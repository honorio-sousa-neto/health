import { createHash } from "crypto";
import { Invoice, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { Identity } from "../../security/auth";
import { issueInvoiceInput, IssueInvoiceInput } from "../../validator/issue-invoice";
import { resolveDefaultLocationId, stockExit } from "../stock/stock-service";
import { setStatus } from "../../controllers/invoice/utils";

export class InvoiceError extends Error { constructor(message: string, public status = 400) { super(message); } }
const money = (value: number | Prisma.Decimal) => new Prisma.Decimal(value).toDecimalPlaces(2).toNumber();
export function operationIdentity(userId: string, key: string, input: IssueInvoiceInput) {
  const hex = createHash("sha256").update(`invoice:${userId}:${key}`).digest("hex");
  const id = `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
  // Parsed inputs have a fixed key order. The persisted digest also rejects key reuse with another payload.
  const fingerprint = createHash("sha256").update(JSON.stringify(input)).digest("hex");
  return { id, fingerprint };
}

async function priceItems(tx: Prisma.TransactionClient, input: IssueInvoiceInput, identity: Identity) {
  const customer = await tx.customer.findUnique({ where: { id: input.customerId! }, include: { protocol: true } });
  if (!customer || customer.deletedAt) throw new InvoiceError("Paciente inválido");
  if (input.attendanceId) {
    const attendance = await tx.attendance.findUnique({ where: { id: input.attendanceId } });
    if (!attendance || attendance.customerId !== customer.id || attendance.deletedAt) throw new InvoiceError("Atendimento inválido para o paciente");
  }
  if (input.protocolId && (customer.protocolId !== input.protocolId || customer.protocol?.deletedAt)) throw new InvoiceError("Protocolo inválido para o paciente");
  if (input.partnerId && customer.partnerId !== input.partnerId) throw new InvoiceError("Parceiro inválido para o paciente");
  if (input.insuranceId && !await tx.customerInsurance.findFirst({ where: { customerId: customer.id, insuranceId: input.insuranceId, deletedAt: null } })) throw new InvoiceError("Seguro inválido para o paciente");
  let intern: { internTax: number | null } | null = null;
  if (input.internId) {
    const cover = await tx.customerIntern.findFirst({ where: { internId: input.internId, deletedAt: null, startDate: { lte: new Date() }, endDate: { gte: new Date() }, OR: [{ customerId: customer.id }, { members: { some: { id: customer.id } } }] }, include: { intern: true } });
    if (!cover || cover.intern.deletedAt) throw new InvoiceError("Seguro interno inválido ou expirado");
    intern = cover.intern;
  }
  const services = await tx.service.findMany({ where: { id: { in: input.invoiceItems!.map((i) => i.serviceId) }, deletedAt: null } });
  const byId = new Map(services.map((s) => [s.id, s]));
  const canReprice = identity.role === "admin" || identity.role === "financial";
  return input.invoiceItems!.map((item) => {
    const service = byId.get(item.serviceId);
    if (!service || service.unit_price == null) throw new InvoiceError("Serviço sem preço válido");
    let price = money(service.unit_price);
    let discount = money(service.discount ?? 0);
    if (input.protocolId && customer.protocol) discount = money(new Prisma.Decimal(price).mul(customer.protocol.value).div(100));
    if (intern && service.name.toLowerCase().includes("internamento")) price = money(new Prisma.Decimal(price).mul(intern.internTax ?? 100).div(100));
    if (!canReprice && (money(item.price) !== price || money(item.discount) !== discount)) throw new InvoiceError("O preço ou desconto difere do preçário. Solicite validação financeira.", 403);
    if (canReprice) { price = money(item.price); discount = money(item.discount); }
    if (discount > price || discount < 0 || price < 0) throw new InvoiceError("Preço ou desconto inválido");
    return { serviceId: item.serviceId, quantity: item.quantity, price, discount, total: money(new Prisma.Decimal(price).minus(discount).mul(item.quantity)), ...(item.config ? { config: item.config } : {}) };
  });
}

export async function issueInvoice(raw: unknown, identity: Identity, key: string): Promise<Invoice> {
  const input = issueInvoiceInput.parse(raw);
  if (!/^[a-zA-Z0-9_-]{16,128}$/.test(key)) throw new InvoiceError("Indique uma chave de idempotência válida");
  const { id, fingerprint } = operationIdentity(identity.id, key, input);
  return prisma.$transaction(async (tx) => {
    // Serializes reference allocation and replay checks across all application instances.
    // No schema migration is needed: the deterministic UUID uses Invoice's existing primary key.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(724281990)::text`;
    const existing = await tx.invoice.findUnique({ where: { id } });
    if (existing) {
      if (existing.userId !== identity.id || existing.hash64 !== fingerprint) throw new InvoiceError("Chave de idempotência já utilizada com outros dados", 409);
      return existing;
    }
    const normal = ["FR", "FT", "PP"].includes(input.type);
    let source: Invoice | null = null;
    if (!normal) {
      source = await tx.invoice.findUnique({ where: { id: input.invoiceId! } });
      if (!source || source.deletedAt || source.status === "FINAL" || !["FT", "FR"].includes(source.type)) throw new InvoiceError("Documento de origem inválido ou já finalizado");
      if (input.type === "RC" && (source.type !== "FT" || source.status !== "POR_PAGAR")) throw new InvoiceError("Só é possível receber uma factura por pagar");
    }
    const items = normal ? await priceItems(tx, input, identity) : [];
    const total = normal ? money(items.reduce((sum, item) => sum.plus(item.total), new Prisma.Decimal(0))) : money(source!.total ?? 0);
    if (["FR", "RC"].includes(input.type) && !input.paymentId) throw new InvoiceError("Indique o método de pagamento");
    const internId = source ? source.internId : input.internId;
    if (["FR", "RC"].includes(input.type) && !internId && money(input.amount_received ?? 0) < total) throw new InvoiceError("Montante recebido insuficiente");
    const count = await tx.invoice.count({ where: { type: input.type } });
    const stamp = new Date().toLocaleDateString("pt-BR", { timeZone: "Africa/Luanda" }).replace(/\//g, "");
    let number = count + 1;
    let reference = `${input.type} ${stamp}/${number}`;
    while (await tx.invoice.findFirst({ where: { reference }, select: { id: true } })) reference = `${input.type} ${stamp}/${++number}`;
    const data = await tx.invoice.create({ data: {
      id, type: input.type, reference, serie: new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Africa/Luanda" }).format(new Date()), status: setStatus(input.type),
      hash64: fingerprint, hash4: fingerprint.slice(0, 4), userId: identity.id,
      customerId: source ? source.customerId : input.customerId, invoiceId: source?.id,
      attendanceId: source ? source.attendanceId : input.attendanceId, emission_date: input.emission_date ?? new Date(),
      insuranceId: source ? source.insuranceId : input.insuranceId, protocolId: source ? source.protocolId : input.protocolId,
      partnerId: source ? source.partnerId : input.partnerId, internId, paymentId: input.paymentId,
      reasonInssuance: input.reasonInssuance, asNormal: source?.asNormal ?? input.asNormal,
      isAmbulatory: source?.isAmbulatory ?? input.isAmbulatory, co_payment: input.co_payment,
      amount_received: input.amount_received, total,
      discount: money(items.reduce((sum, item) => sum.plus(new Prisma.Decimal(item.discount).mul(item.quantity)), new Prisma.Decimal(0))),
      invoiceItems: { createMany: { data: items } },
    } });
    if (source) await tx.invoice.update({ where: { id: source.id }, data: { status: "FINAL" } });
    const internment = items.length ? await tx.service.findUnique({ where: { id: items[0].serviceId }, select: { name: true } }) : null;
    if (["FR", "RC"].includes(input.type) && (!internId || (input.type === "FR" && internment?.name.toLowerCase().includes("internamento")))) {
      await tx.flow.create({ data: { amount: total, description: `Pagamento do documento ${source?.reference ?? reference}`, destination: input.bank || "Caixa", type: "ENTRY" } });
    }
    if (["FR", "FT"].includes(input.type)) {
      const entered = await tx.movimentationStock.groupBy({ by: ["productId"], where: { productId: { in: items.map((i) => i.serviceId) }, type: "ENTRY" } });
      const tracked = new Set(entered.map((e) => e.productId));
      const stockItems = items.filter((i) => tracked.has(i.serviceId)).sort((a,b) => a.serviceId.localeCompare(b.serviceId));
      if (stockItems.length) {
        const locationId = await resolveDefaultLocationId(tx);
        if (!locationId) throw new InvoiceError("Configure uma localização de stock antes de emitir");
        for (const item of stockItems) await stockExit(tx, { productId: item.serviceId, locationId, quantity: item.quantity, reason: "sale", description: `Fatura ${reference}`, userId: identity.id, attendanceId: input.attendanceId });
      }
    }
    return data;
  }, { timeout: 30000, maxWait: 10000 });
}
