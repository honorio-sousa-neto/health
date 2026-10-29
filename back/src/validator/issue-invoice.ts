import { z } from "zod";
const optionalId = z.preprocess((v) => v === "" || v === null ? undefined : v, z.string().uuid().optional());
const money = z.number().finite().min(0).max(1e12);
export const invoiceItemInput = z.object({
  serviceId: z.string().uuid(), quantity: z.number().int().positive().max(1000000),
  price: money, discount: money.nullish().transform((v) => v ?? 0),
  config: z.record(z.string().max(200), z.string().max(2000)).optional(),
}).refine((i) => i.discount <= i.price, { message: "Desconto superior ao preço" });
export const issueInvoiceInput = z.object({
  type: z.enum(["FR", "FT", "PP", "RC", "ND", "NC"]),
  customerId: optionalId, attendanceId: optionalId, invoiceId: optionalId,
  insuranceId: optionalId, internId: optionalId, partnerId: optionalId, protocolId: optionalId,
  paymentId: optionalId, asNormal: z.boolean().default(true), isAmbulatory: z.boolean().default(false),
  bank: z.string().max(200).nullish(), reasonInssuance: z.string().max(2000).optional(),
  amount_received: money.optional(), co_payment: money.nullish(),
  emission_date: z.preprocess((v) => !v ? undefined : v, z.coerce.date().optional()),
  invoiceItems: z.array(invoiceItemInput).max(500).optional(),
}).superRefine((v, ctx) => {
  if (["FR", "FT", "PP"].includes(v.type) && (!v.invoiceItems?.length || !v.customerId)) ctx.addIssue({ code: "custom", message: "Indique o paciente e os itens" });
  if (["RC", "ND", "NC"].includes(v.type) && !v.invoiceId) ctx.addIssue({ code: "custom", message: "Indique o documento de origem" });
});
export type IssueInvoiceInput = z.infer<typeof issueInvoiceInput>;
