import { asyncRouter } from "../../security/router";
import express from "express";
import type { Request, Response } from "express";
import { prisma } from "../../database/prisma";
import { ROLE_ROOMS } from "../../utils/notify";

const router = asyncRouter();

async function currentUser(req: Request) {
  return req.user ?? null;
}

/** GET /notifications — returns persisted notifications for the caller's rooms */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const user = await currentUser(req);
  if (!user) { res.status(401).json({ success: false }); return; }

  const rooms = ROLE_ROOMS[user.role] ?? [];
  if (!rooms.length) { res.status(200).json({ data: [], success: true }); return; }

  const data = await prisma.notification.findMany({
    where: { room: { in: rooms } },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  res.status(200).json({ data, success: true });
});

/** PATCH /notifications/:id/read — mark a single notification as read */
router.patch("/:id/read", async (req: Request, res: Response): Promise<void> => {
  const user = await currentUser(req);
  if (!user) { res.status(401).json({ success: false }); return; }

  await prisma.notification.updateMany({
    where: { id: req.params.id, room: { in: ROLE_ROOMS[user.role] ?? [] }, NOT: { readBy: { has: user.id } } },
    data: { readBy: { push: user.id } },
  }).catch(() => {});

  res.status(200).json({ success: true });
});

/** DELETE /notifications — mark all notifications as read for this user */
router.delete("/", async (req: Request, res: Response): Promise<void> => {
  const user = await currentUser(req);
  if (!user) { res.status(401).json({ success: false }); return; }

  const rooms = ROLE_ROOMS[user.role] ?? [];
  await prisma.notification.updateMany({
    where: { room: { in: rooms }, NOT: { readBy: { has: user.id } } },
    data: { readBy: { push: user.id } },
  }).catch(() => {});

  res.status(200).json({ success: true });
});

export default router;
