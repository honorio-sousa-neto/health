import type { Server } from "socket.io";
import { prisma } from "../database/prisma";
import { randomUUID } from "crypto";

export interface NotificationPayload {
  title: string;
  message: string;
  /** visual colour hint for the frontend */
  type: "info" | "success" | "alert";
  patientName?: string;
  reference?: string;
}

/**
 * Emit a real-time notification to every socket in a given room
 * and persist it so offline users find it on next login.
 */
export function notify(io: any, room: string, payload: NotificationPayload): void {
  const id = randomUUID();
  const timestamp = new Date().toISOString();
  io.to(room).emit("notification", { ...payload, id, room, timestamp });

  prisma.notification.create({
    data: {
      id,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      patientName: payload.patientName ?? null,
      reference: payload.reference ?? null,
      room,
    },
  }).catch(() => {});
}

/** Rooms each role should join on connect */
export const ROLE_ROOMS: Record<string, string[]> = {
  admin:       ["recepcao", "enfermaria", "consultorio", "laboratorio", "farmacia"],
  attendant:   ["recepcao"],
  nurse:       ["enfermaria"],
  techNursian: ["enfermaria"],
  doctor:      ["consultorio"],
  analyst:     ["laboratorio"],
  chiefLab:    ["laboratorio"],
  techLab:     ["laboratorio"],
};
