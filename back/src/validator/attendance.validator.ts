import { z } from "zod";

export const createAttendance = z.object({
  customerId: z.string().uuid(),
  receptionistId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional().nullable(),
  note: z.string().optional().nullable(),
});

export const updateAttendance = z.object({
  status: z.enum(["WAITING", "IN_SCREENING", "SCREENED", "WAITING_DOCTOR", "IN_CONSULTATION", "COMPLETED", "CANCELED"]).optional(),
  note: z.string().optional().nullable(),
});

export type TCreateAttendance = z.infer<typeof createAttendance>;
export type TUpdateAttendance = z.infer<typeof updateAttendance>;
