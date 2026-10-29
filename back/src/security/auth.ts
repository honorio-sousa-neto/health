import jwt from "jsonwebtoken";
import { Role, User } from "@prisma/client";
import { prisma } from "../database/prisma";

export type Identity = Pick<User, "id" | "email" | "role">;
export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32 || secret === "alfavida_app_management_clinic") {
    throw new Error("Configure JWT_SECRET com pelo menos 32 bytes aleatórios; a chave antiga não é permitida.");
  }
  return secret;
}
export function signSession(user: Identity): string {
  return jwt.sign({}, jwtSecret(), { subject: user.id, algorithm: "HS256", expiresIn: "8h", issuer: "medicmanager", audience: "medicmanager" });
}
export async function authenticate(token: string): Promise<Identity> {
  const payload = jwt.verify(token, jwtSecret(), { algorithms: ["HS256"], issuer: "medicmanager", audience: "medicmanager" });
  if (typeof payload === "string" || !payload.sub || !/^[0-9a-f-]{36}$/i.test(payload.sub)) throw new Error("Sessão inválida");
  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, role: true, deletedAt: true } });
  if (!user || user.deletedAt) throw new Error("Sessão inválida");
  return { id: user.id, email: user.email, role: user.role };
}
export const clinicalRoles: Role[] = ["attendant", "nurse", "techNursian", "doctor", "analyst", "techLab", "chiefLab"];
export const clinicalRooms = clinicalRoles.map((role) => `role:${role}`).concat("role:admin");
