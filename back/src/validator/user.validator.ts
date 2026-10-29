import { Role } from "@prisma/client";
import { z } from "zod";
export const createUser = z.object({
  name: z.string(),
  nif: z.string().nullable().optional(),
  phone: z.string(),
  role: z.enum([
    Role.admin,
    Role.analyst,
    Role.attendant,
    Role.doctor,
    Role.financial,
    Role.nurse,
    Role.techLab,
    Role.chiefLab,
    Role.techNursian,
    Role.inventory,
  ]),
  email: z.string().optional(),
  password: z.string().min(12).refine((value) => Buffer.byteLength(value, "utf8") <= 72, "A palavra-passe excede 72 bytes"),
});

export type TCreateUser = z.infer<typeof createUser>;

export const updateUser = z.object({
  name: z.string().optional(),
  nif: z.string().nullable().optional(),
  phone: z.string().optional(),
  role: z
    .enum([
      Role.admin,
      Role.analyst,
      Role.attendant,
      Role.doctor,
      Role.financial,
      Role.nurse,
      Role.techLab,
      Role.chiefLab,
      Role.techNursian,
      Role.inventory,
    ])
    .optional(),
  email: z.string().optional(),
});

export type TUpdateUser = z.infer<typeof updateUser>;
