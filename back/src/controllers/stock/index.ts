import { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  resolveDefaultLocationId,
  stockEntry,
  stockExit,
  stockTransfer,
  stockAdjust,
  totalBalance,
  checkMinStockTransition,
} from "../../services/stock/stock-service";

// ── helpers ──────────────────────────────────────────────────────────────────

function ok(data: unknown, message = "OK") {
  return { data, message, success: true, statusCode: 200 };
}
function created(data: unknown, message = "Criado com sucesso") {
  return { data, message, success: true, statusCode: 201 };
}
function badRequest(message: string) {
  return { data: null, message, success: false, statusCode: 400 };
}

const movInclude = {
  product: { select: { id: true, name: true, type: true, minimumStock: true, unit: { select: { abbreviation: true } } } },
  fromLocation: { select: { id: true, name: true } },
  toLocation:   { select: { id: true, name: true } },
  user:         { select: { id: true, name: true } },
  attendance:   { select: { id: true, reference: true } },
};

// ── balance aggregation ───────────────────────────────────────────────────────

async function computeBalance(locationId?: string) {
  // Agregação por SQL (groupBy) em vez de carregar o ledger inteiro para memória.
  // Créditos entram na toLocation (ENTRY/TRANSFER); débitos saem da fromLocation
  // (EXIT/OUT/TRANSFER) — mesma lógica de balanceAtLocation, por (produto, local).
  const [credits, debits] = await Promise.all([
    prisma.movimentationStock.groupBy({
      by: ["productId", "toLocationId"],
      where: { type: { in: ["ENTRY", "TRANSFER"] }, toLocationId: locationId ?? { not: null } },
      _sum: { quantity: true },
    }),
    prisma.movimentationStock.groupBy({
      by: ["productId", "fromLocationId"],
      where: { type: { in: ["EXIT", "OUT", "TRANSFER"] }, fromLocationId: locationId ?? { not: null } },
      _sum: { quantity: true },
    }),
  ]);

  const map: Record<string, { productId: string; locationId: string; quantity: number }> = {};
  const add = (productId: string, locId: string, delta: number) => {
    const key = `${productId}|${locId}`;
    if (!map[key]) map[key] = { productId, locationId: locId, quantity: 0 };
    map[key].quantity += delta;
  };

  for (const c of credits) if (c.toLocationId) add(c.productId, c.toLocationId, c._sum.quantity ?? 0);
  for (const d of debits)  if (d.fromLocationId) add(d.productId, d.fromLocationId, -(d._sum.quantity ?? 0));

  const rows = Object.values(map);
  if (!rows.length) return [];

  // Hydrate product and location info
  const productIds  = [...new Set(rows.map((r) => r.productId))];
  const locationIds = [...new Set(rows.map((r) => r.locationId))];

  const [products, locations] = await Promise.all([
    prisma.service.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, minimumStock: true, unit: { select: { abbreviation: true } }, materialCategory: true },
    }),
    prisma.stockLocation.findMany({
      where: { id: { in: locationIds } },
      select: { id: true, name: true },
    }),
  ]);

  const prodMap = Object.fromEntries(products.map((p) => [p.id, p]));
  const locMap  = Object.fromEntries(locations.map((l) => [l.id, l]));

  return rows
    .map((r) => ({
      id:         `${r.productId}-${r.locationId}`,
      productId:  r.productId,
      product:    prodMap[r.productId] ?? null,
      locationId: r.locationId,
      location:   locMap[r.locationId] ?? null,
      quantity:   r.quantity,
    }))
    .filter((r) => r.product && r.location)
    .sort((a, b) => (a.product?.name ?? "").localeCompare(b.product?.name ?? ""));
}

// ── controller class ─────────────────────────────────────────────────────────

export class StockController {

  // ── Locations ──────────────────────────────────────────────────────────────

  async listLocations() {
    const data = await prisma.stockLocation.findMany({
      where: { deletedAt: null },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
    return ok(data);
  }

  /**
   * O `isDefault` é exclusivo — só um departamento recebe as entradas sem
   * origem declarada (as compras, sobretudo). Não era garantido em lado
   * nenhum: marcados dois, o `resolveDefaultLocationId` ficava com o mais
   * antigo e o outro parecia estar marcado sem o estar.
   */
  private async marcarComoUnicoPadrao(tx: Prisma.TransactionClient, id: string) {
    await tx.stockLocation.updateMany({
      where: { id: { not: id }, isDefault: true },
      data: { isDefault: false },
    });
  }

  async createLocation(body: { name: string; description?: string; isDefault?: boolean }, userId: string | undefined) {
    if (!body.name?.trim()) return badRequest("Indique o nome do departamento");
    try {
      const data = await prisma.$transaction(async (tx) => {
        const criado = await tx.stockLocation.create({
          data: {
            name: body.name.trim(),
            description: body.description,
            isDefault: body.isDefault ?? false,
          },
        });
        if (criado.isDefault) await this.marcarComoUnicoPadrao(tx, criado.id);
        return criado;
      });
      return created(data, "Departamento criado");
    } catch (erro) {
      console.error("[stock] createLocation", erro);
      return badRequest("Não foi possível criar o departamento.");
    }
  }

  async updateLocation(id: string, body: { name?: string; description?: string; isDefault?: boolean }) {
    try {
      const data = await prisma.$transaction(async (tx) => {
        const actualizado = await tx.stockLocation.update({ where: { id }, data: body });
        if (actualizado.isDefault) await this.marcarComoUnicoPadrao(tx, actualizado.id);
        return actualizado;
      });
      return ok(data, "Departamento actualizado");
    } catch (erro) {
      console.error("[stock] updateLocation", erro);
      return badRequest("Não foi possível actualizar o departamento.");
    }
  }

  // ── Balance ─────────────────────────────────────────────────────────────────

  async balance(locationId?: string) {
    const data = await computeBalance(locationId);
    return ok(data);
  }

  // ── Entries ─────────────────────────────────────────────────────────────────

  async createEntry(
    body: { productId: string; locationId: string; quantity: number; reason?: string; description?: string; batch?: string; expiration?: string },
    userId: string | undefined
  ) {
    if (!body.productId || !body.locationId || !body.quantity) return badRequest("Campos obrigatórios em falta");
    try {
      const mov = await prisma.$transaction((tx) =>
        stockEntry(tx, {
          productId:   body.productId,
          locationId:  body.locationId,
          quantity:    body.quantity,
          batch:       body.batch || null,
          expiration:  body.expiration ? new Date(body.expiration) : null,
          reason:      body.reason ?? "purchase",
          description: body.description,
          userId,
        })
      );
      if (!mov) return badRequest("Quantidade inválida");
      // Entradas só aumentam o stock — não podem cruzar o mínimo para baixo.
      const data = await prisma.movimentationStock.findUnique({ where: { id: mov.id }, include: movInclude });
      return created(data, "Entrada registada");
    } catch (e: any) {
      // O `e.message` do Prisma traz o caminho do ficheiro no servidor e o
      // corpo da query. Isso vai para o log, não para o ecrã de quem regista
      // uma entrada: não lhe diz o que fazer e conta a estranhos como o
      // servidor está montado.
      console.error("createEntry", e);
      const fk = String(e?.message ?? "");
      if (fk.includes("toLocationId")) return badRequest("Departamento inválido ou já removido.");
      if (fk.includes("productId")) return badRequest("Artigo inválido ou já removido.");
      return badRequest("Não foi possível registar a entrada.");
    }
  }

  async listEntries(params: { page?: string; perPage?: string; locationId?: string }) {
    const take = Number(params.perPage) || 20;
    const skip = Math.max(((Number(params.page) || 1) - 1) * take, 0);
    const where: any = { type: "ENTRY", ...(params.locationId ? { toLocationId: params.locationId } : {}) };
    const [data, total] = await Promise.all([
      prisma.movimentationStock.findMany({ where, take, skip, orderBy: { createdAt: "desc" }, include: movInclude }),
      prisma.movimentationStock.count({ where }),
    ]);
    return { data, meta: { total, totalPages: Math.ceil(total / take), page: Number(params.page) || 1, perPage: take }, statusCode: 200, success: true, message: "OK" };
  }

  // ── Transfers ───────────────────────────────────────────────────────────────

  /**
   * Transferência entre departamentos, de um artigo ou de vários.
   *
   * Aceita duas formas: `items: [{ productId, quantity }]` para várias linhas,
   * ou o par `productId`/`quantity` à cabeça para uma só — é esta que o ecrã
   * de saldos ainda envia, e continua a valer.
   *
   * As linhas vão todas na mesma transação: ou o carrinho inteiro se move, ou
   * não se move nada. Metade de uma transferência é um inventário que não
   * bate certo com o papel que acompanha a caixa.
   */
  async createTransfer(
    body: {
      productId?: string;
      quantity?: number;
      items?: { productId: string; quantity: number }[];
      fromLocationId: string;
      toLocationId: string;
      description?: string;
    },
    userId: string | undefined
  ) {
    const linhas = Array.isArray(body.items) && body.items.length
      ? body.items
      : body.productId
        ? [{ productId: body.productId, quantity: Number(body.quantity) }]
        : [];

    if (!linhas.length || !body.fromLocationId || !body.toLocationId) return badRequest("Campos obrigatórios em falta");
    if (body.fromLocationId === body.toLocationId) return badRequest("Origem e destino não podem ser iguais");

    for (const l of linhas) {
      if (!l?.productId) return badRequest("Há uma linha sem artigo.");
      if (!(Number(l.quantity) > 0)) return badRequest("Todas as linhas precisam de uma quantidade maior que zero.");
    }

    // Duas linhas do mesmo artigo seriam somadas em silêncio contra o mesmo
    // saldo. É quase sempre um engano de quem preenche — vale mais dizê-lo.
    const repetido = linhas.map((l) => l.productId).find((id, i, todos) => todos.indexOf(id) !== i);
    if (repetido) {
      const p = await prisma.service.findUnique({ where: { id: repetido }, select: { name: true } });
      return badRequest(`"${p?.name ?? "Um artigo"}" aparece em mais do que uma linha. Junte-as numa só.`);
    }

    try {
      const movs = await prisma.$transaction(async (tx) => {
        const criados = [];
        // Em série, e não em paralelo: cada linha valida o saldo da origem já
        // com as anteriores descontadas, e `tx` é uma ligação só.
        for (const l of linhas) {
          criados.push(
            ...(await stockTransfer(tx, {
              productId:      l.productId,
              fromLocationId: body.fromLocationId,
              toLocationId:   body.toLocationId,
              quantity:       Number(l.quantity),
              description:    body.description,
              userId,
            }))
          );
        }
        return criados;
      });
      if (!movs.length) return badRequest("Quantidade inválida");
      const data = await prisma.movimentationStock.findMany({
        where: { id: { in: movs.map((m) => m.id) } },
        include: movInclude,
      });
      return created(
        data,
        linhas.length > 1 ? `${linhas.length} artigos transferidos` : "Transferência registada"
      );
    } catch (e: any) {
      return badRequest(e?.message ?? "Erro ao transferir");
    }
  }

  async listTransfers(params: { page?: string; perPage?: string; locationId?: string }) {
    const take = Number(params.perPage) || 20;
    const skip = Math.max(((Number(params.page) || 1) - 1) * take, 0);
    const where: any = {
      type: "TRANSFER",
      ...(params.locationId ? { OR: [{ fromLocationId: params.locationId }, { toLocationId: params.locationId }] } : {}),
    };
    const [data, total] = await Promise.all([
      prisma.movimentationStock.findMany({ where, take, skip, orderBy: { createdAt: "desc" }, include: movInclude }),
      prisma.movimentationStock.count({ where }),
    ]);
    return { data, meta: { total, totalPages: Math.ceil(total / take), page: Number(params.page) || 1, perPage: take }, statusCode: 200, success: true, message: "OK" };
  }

  // ── Consumptions ────────────────────────────────────────────────────────────

  async createConsumption(
    body: { productId: string; locationId: string; quantity: number; attendanceId?: string; description?: string },
    userId: string | undefined
  ) {
    if (!body.productId || !body.locationId || !body.quantity) return badRequest("Campos obrigatórios em falta");
    const before = await totalBalance(prisma, body.productId);
    try {
      const movs = await prisma.$transaction((tx) =>
        stockExit(tx, {
          productId:         body.productId,
          locationId:        body.locationId,
          quantity:          body.quantity,
          reason:            "consumption",
          description:       body.description,
          userId,
          attendanceId:      body.attendanceId,
          enforceAvailability: true,
        })
      );
      await checkMinStockTransition(prisma, body.productId, before);
      const data = await prisma.movimentationStock.findMany({
        where: { id: { in: movs.map((m) => m.id) } },
        include: movInclude,
      });
      return created(data, "Consumo registado");
    } catch (e: any) {
      return badRequest(e?.message ?? "Erro ao registar consumo");
    }
  }

  async listConsumptions(params: { page?: string; perPage?: string; locationId?: string }) {
    const take = Number(params.perPage) || 20;
    const skip = Math.max(((Number(params.page) || 1) - 1) * take, 0);
    // Só consumos manuais de departamento; vendas (reason "sale") ficam fora
    const where: any = { type: "EXIT", reason: "consumption", ...(params.locationId ? { fromLocationId: params.locationId } : {}) };
    const [data, total] = await Promise.all([
      prisma.movimentationStock.findMany({ where, take, skip, orderBy: { createdAt: "desc" }, include: movInclude }),
      prisma.movimentationStock.count({ where }),
    ]);
    return { data, meta: { total, totalPages: Math.ceil(total / take), page: Number(params.page) || 1, perPage: take }, statusCode: 200, success: true, message: "OK" };
  }

  // ── Declaração de consumo na realização de um serviço ──────────────────────

  /**
   * Itens que podem ser declarados como consumidos: consumíveis (reagentes,
   * materiais) e produtos (fármacos). Devolve o saldo actual para o operador
   * ver a disponibilidade antes de declarar.
   */
  async listStockItems(params: { search?: string; type?: string }) {
    // `type` restringe a um dos dois; sem ele vêm ambos, como sempre vieram.
    const tipos =
      params.type === "CONSUMABLE" || params.type === "PRODUCT"
        ? [params.type]
        : ["CONSUMABLE", "PRODUCT"];

    const items = await prisma.service.findMany({
      where: {
        deletedAt: null,
        type: { in: tipos as any },
        ...(params.search
          ? { name: { contains: params.search, mode: "insensitive" as const } }
          : {}),
      },
      select: {
        id: true,
        name: true,
        type: true,
        materialCategory: true,
        unit: { select: { abbreviation: true } },
      },
      orderBy: { name: "asc" },
      take: 50,
    });

    const ids = items.map((i) => i.id);
    const [credits, debits] = await Promise.all([
      prisma.movimentationStock.groupBy({
        by: ["productId"],
        where: { productId: { in: ids }, type: { in: ["ENTRY", "TRANSFER"] }, toLocationId: { not: null } },
        _sum: { quantity: true },
      }),
      prisma.movimentationStock.groupBy({
        by: ["productId"],
        where: { productId: { in: ids }, type: { in: ["EXIT", "OUT", "TRANSFER"] }, fromLocationId: { not: null } },
        _sum: { quantity: true },
      }),
    ]);
    const cIn = Object.fromEntries(credits.map((c) => [c.productId, c._sum.quantity ?? 0]));
    const cOut = Object.fromEntries(debits.map((d) => [d.productId, d._sum.quantity ?? 0]));

    return ok(
      items.map((i) => ({
        ...i,
        unitLabel: i.unit?.abbreviation ?? null,
        balance: (cIn[i.id] ?? 0) - (cOut[i.id] ?? 0),
      }))
    );
  }

  /**
   * Consumo padrão (receita) de um ou mais serviços, para pré-preencher o
   * formulário de declaração. Com vários serviços (ex.: vários exames no mesmo
   * atendimento) as quantidades do mesmo consumível são somadas.
   */
  async suggestConsumables(serviceIds: string[]) {
    const ids = serviceIds.filter(Boolean);
    if (!ids.length) return badRequest("Indique pelo menos um serviceId");

    const rows = await prisma.materialOfService.findMany({
      where: { serviceId: { in: ids } },
      include: {
        consumable: {
          select: { id: true, name: true, type: true, unit: { select: { abbreviation: true } } },
        },
      },
    });

    const agregado = new Map<string, any>();
    for (const r of rows) {
      const atual = agregado.get(r.consumableId);
      if (atual) {
        atual.quantity += Number(r.quantity);
      } else {
        agregado.set(r.consumableId, {
          productId: r.consumableId,
          name: r.consumable?.name ?? r.consumableId,
          type: r.consumable?.type ?? null,
          unitLabel: r.consumable?.unit?.abbreviation ?? null,
          quantity: Number(r.quantity),
        });
      }
    }
    return ok([...agregado.values()]);
  }

  /**
   * Declara o que foi consumido para realizar um serviço (ex.: reagentes de um
   * exame). Gera as saídas de stock via FEFO, numa só transação.
   */
  async declareConsumption(
    body: {
      locationId?: string;
      serviceId?: string;
      attendanceId?: string;
      reference?: string;
      items?: { productId: string; quantity: number }[];
    },
    userId: string | undefined
  ) {
    const items = (body.items ?? []).filter((i) => i?.productId && Number(i.quantity) > 0);
    if (!items.length) return badRequest("Indique pelo menos um item com quantidade válida");

    const locationId = body.locationId ?? (await resolveDefaultLocationId(prisma));
    if (!locationId) {
      return badRequest(
        "Nenhum departamento está marcado para receber as entradas. Vá a Inventário › Departamentos, abra um e ligue \"Recebe as entradas das compras\"."
      );
    }

    // Agrega quantidades do mesmo produto declarado mais do que uma vez
    const agregado = new Map<string, number>();
    for (const i of items) {
      agregado.set(i.productId, (agregado.get(i.productId) ?? 0) + Number(i.quantity));
    }

    const before: Record<string, number> = {};
    for (const productId of agregado.keys()) {
      before[productId] = await totalBalance(prisma, productId);
    }

    const description =
      body.reference?.trim() ||
      (body.serviceId
        ? (await prisma.service.findUnique({ where: { id: body.serviceId }, select: { name: true } }))?.name
        : undefined) ||
      "Consumo na realização de serviço";

    const movements = await prisma.$transaction(async (tx) => {
      const movs: any[] = [];
      for (const [productId, quantity] of agregado) {
        movs.push(
          ...(await stockExit(tx, {
            productId,
            locationId,
            quantity,
            reason: "service_consumption",
            description,
            userId,
            attendanceId: body.attendanceId,
          }))
        );
      }
      return movs;
    });

    for (const productId of agregado.keys()) {
      await checkMinStockTransition(prisma, productId, before[productId] ?? 0);
    }

    return created(movements, "Consumo declarado");
  }

  // ── Adjustments ─────────────────────────────────────────────────────────────

  async createAdjustment(
    body: { productId: string; locationId: string; quantity: number; reason?: string; description?: string; batch?: string; expiration?: string },
    userId: string | undefined
  ) {
    if (!body.productId || !body.locationId || body.quantity === undefined) return badRequest("Campos obrigatórios em falta");
    const before = await totalBalance(prisma, body.productId);
    try {
      const movs = await prisma.$transaction((tx) =>
        stockAdjust(tx, {
          productId:   body.productId,
          locationId:  body.locationId,
          quantity:    body.quantity,
          reason:      body.reason ?? "positive_adjustment",
          batch:       body.batch || null,
          expiration:  body.expiration ? new Date(body.expiration) : null,
          description: body.description,
          userId,
        })
      );
      // Só notifica se um ajuste negativo cruzou o mínimo (positivos não cruzam).
      await checkMinStockTransition(prisma, body.productId, before);
      const data = await prisma.movimentationStock.findMany({
        where: { id: { in: movs.map((m) => m.id) } },
        include: movInclude,
      });
      return created(data, "Ajuste registado");
    } catch (e: any) {
      return badRequest(e?.message ?? "Erro ao registar ajuste");
    }
  }

  // ── All movements ───────────────────────────────────────────────────────────

  async listMovements(params: { page?: string; perPage?: string; type?: string; locationId?: string; from?: string; to?: string }) {
    const take = Number(params.perPage) || 30;
    const skip = Math.max(((Number(params.page) || 1) - 1) * take, 0);
    const where: any = {};

    if (params.type) where.type = params.type === "EXIT" ? { in: ["EXIT", "OUT"] } : params.type;
    if (params.locationId) {
      where.OR = [{ fromLocationId: params.locationId }, { toLocationId: params.locationId }];
    }
    if (params.from || params.to) {
      where.createdAt = {};
      if (params.from) where.createdAt.gte = new Date(params.from);
      if (params.to)   where.createdAt.lte = new Date(params.to + "T23:59:59");
    }

    const [data, total] = await Promise.all([
      prisma.movimentationStock.findMany({ where, take, skip, orderBy: { createdAt: "desc" }, include: movInclude }),
      prisma.movimentationStock.count({ where }),
    ]);

    // Normalise OUT → EXIT for frontend compatibility
    const normalised = data.map((m) => ({ ...m, type: m.type === "OUT" ? "EXIT" : m.type }));
    return { data: normalised, meta: { total, totalPages: Math.ceil(total / take), page: Number(params.page) || 1, perPage: take }, statusCode: 200, success: true, message: "OK" };
  }

  // ── Monthly report ─────────────────────────────────────────────────────────

  async monthlyReport(params: { year?: string; month?: string; locationId?: string }) {
    const year  = Number(params.year)  || new Date().getFullYear();
    const month = Number(params.month) || new Date().getMonth() + 1;
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59, 999);
    const prevEnd = new Date(start.getTime() - 1);

    const locFilter = params.locationId ? { locationId: params.locationId } : {};

    const [allMov, prevMov] = await Promise.all([
      prisma.movimentationStock.findMany({
        where: { createdAt: { lte: end }, ...(params.locationId ? { OR: [{ fromLocationId: params.locationId }, { toLocationId: params.locationId }] } : {}) },
        include: { product: { select: { id: true, name: true } } },
      }),
      prisma.movimentationStock.findMany({
        where: { createdAt: { lte: prevEnd }, ...(params.locationId ? { OR: [{ fromLocationId: params.locationId }, { toLocationId: params.locationId }] } : {}) },
        include: { product: { select: { id: true, name: true } } },
      }),
    ]);

    const curMov = allMov.filter((m) => m.createdAt >= start && m.createdAt <= end);

    // Quando filtrado por localização, um movimento só conta na perspectiva
    // dessa localização: uma transferência DE saída (from = local) é débito, e
    // uma DE entrada (to = local) é crédito — nunca ambos. Sem filtro, a
    // transferência credita no destino e debita na origem (líquido zero global).
    const inLoc = (l: string | null) => !params.locationId || l === params.locationId;

    const computeQty = (movs: typeof allMov) => {
      const map: Record<string, number> = {};
      for (const m of movs) {
        if (!map[m.productId]) map[m.productId] = 0;
        if (m.type === "ENTRY" && inLoc(m.toLocationId)) map[m.productId] += m.quantity;
        else if ((m.type === "EXIT" || m.type === "OUT") && inLoc(m.fromLocationId)) map[m.productId] -= m.quantity;
        else if (m.type === "TRANSFER") {
          if (m.toLocationId && inLoc(m.toLocationId)) map[m.productId] += m.quantity;
          if (m.fromLocationId && inLoc(m.fromLocationId)) map[m.productId] -= m.quantity;
        }
      }
      return map;
    };

    const opening = computeQty(prevMov);
    const closing = computeQty(allMov);

    const productMap: Record<string, { productId: string; productName: string; openingQty: number; totalEntries: number; totalOuts: number; totalTransfersIn: number; totalTransfersOut: number; closingQty: number }> = {};

    for (const m of curMov) {
      if (!productMap[m.productId]) {
        productMap[m.productId] = {
          productId: m.productId,
          productName: m.product?.name ?? m.productId,
          openingQty: opening[m.productId] ?? 0,
          totalEntries: 0, totalOuts: 0, totalTransfersIn: 0, totalTransfersOut: 0,
          closingQty: closing[m.productId] ?? 0,
        };
      }
      const row = productMap[m.productId];
      if (m.type === "ENTRY" && inLoc(m.toLocationId)) row.totalEntries += m.quantity;
      else if ((m.type === "EXIT" || m.type === "OUT") && inLoc(m.fromLocationId)) row.totalOuts += m.quantity;
      else if (m.type === "TRANSFER") {
        if (m.toLocationId && inLoc(m.toLocationId)) row.totalTransfersIn += m.quantity;
        if (m.fromLocationId && inLoc(m.fromLocationId)) row.totalTransfersOut += m.quantity;
      }
    }

    return ok({
      summary: Object.values(productMap),
      movements: {
        entries:   curMov.filter((m) => m.type === "ENTRY").map((m) => ({ ...m, type: "ENTRY" })),
        exits:     curMov.filter((m) => m.type === "EXIT" || m.type === "OUT").map((m) => ({ ...m, type: "EXIT" })),
        transfers: curMov.filter((m) => m.type === "TRANSFER"),
      },
    });
  }
}
