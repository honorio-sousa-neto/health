import { InvoiceStatus, InvoiceType } from "@prisma/client";
import { z } from "zod";
export const createInvoice = z.object({
  bank: z.string().optional().nullable(),
  asNormal: z.boolean(),
  partnerId: z.string().nullable().optional(),
  protocolId: z.string().nullable().optional(),
  insuranceId: z.string().nullable().optional(),
  internId: z.string().nullable().optional(),
  customerId: z.string().optional(),
  medicalConsultationId: z
    .string()
    .optional()
    .transform((val) => val || undefined),
  attendanceId: z.string().optional().nullable(),
  type: z.enum([
    InvoiceType.FR,
    InvoiceType.FT,
    InvoiceType.NC,
    InvoiceType.ND,
    InvoiceType.PP,
    InvoiceType.RC,
  ]),
  paymentId: z.string().optional().nullable(),
  reasonInssuance: z.string().optional(),
  invoiceId: z.string().optional().nullable(),
  emission_date: z.date(),
  invoiceItems: z
    .array(
      z.object({
        serviceId: z.string(),
        quantity: z.number(),
        discount: z.number().nullable().default(0),
        price: z.number(),
        total: z.number(),
        config: z.record(z.string(), z.string()).optional(),
      })
    )
    .optional(),
  amount_received: z.number().optional(),
  co_payment: z.number().nullable(),
  hash64: z.string(),
  hash4: z.string(),
  total: z.number().optional(),
  discount: z.number().optional(),
  userId: z.string(),
  serie: z.string(),
  reference: z.string(),
  status: z.enum([
    InvoiceStatus.PAGO,
    InvoiceStatus.POR_PAGAR,
    InvoiceStatus.FINAL,
  ]),
  isAmbulatory: z
    .boolean()
    .optional()
    .transform((val) => val ?? false),
});

export type TCreateInvoice = z.infer<typeof createInvoice>;

export const updateInvoice = z.object({
  bank: z.string().optional().nullable(),
  customerId: z.string(),
  type: z.enum([
    InvoiceType.FR,
    InvoiceType.FT,
    InvoiceType.NC,
    InvoiceType.ND,
    InvoiceType.PP,
    InvoiceType.RC,
  ]),
  amount_received: z.number().optional(),
  co_payment: z.number().nullable(),
  paymentId: z.string().optional(),
  reasonInssuance: z.string().optional(),
  invoiceId: z.string().optional(),
  emission_date: z.string().optional(),
  invoiceItems: z.array(
    z.object({
      serviceId: z.string(),
      quantity: z.number(),
      discount: z.number(),
      total: z.number(),
    })
  ),
});

export type TUpdateInvoice = z.infer<typeof updateInvoice>;
