import { asyncRouter } from "../../security/router";
import express from "express";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { upload, uploadDirectory, legacyUploadDirectory, fileType } from "../../config/multer";
import { prisma } from "../../database/prisma";
const router = asyncRouter();
router.post("/invoice/:id", upload.single("file"), async (req, res, next): Promise<void> => {
  let stored: string | undefined;
  try {
    if (!req.file) { res.status(400).json({ message: "Seleccione um ficheiro" }); return; }
    const type = fileType(req.file.buffer);
    if (!type) { res.status(415).json({ message: "Apenas PDF, PNG e JPEG são permitidos" }); return; }
    const purchase = await prisma.purchase.findUnique({ where: { id: req.params.id } });
    if (!purchase) { res.status(404).json({ message: "Compra não encontrada" }); return; }
    const filename = `${randomUUID()}.${type.extension}`;
    await fs.mkdir(uploadDirectory, { recursive: true, mode: 0o700 });
    stored = path.join(uploadDirectory, filename);
    await fs.writeFile(stored, req.file.buffer, { flag: "wx", mode: 0o600 });
    const data = await prisma.purchase.update({ where: { id: purchase.id }, data: { invoice: filename } });
    stored = undefined;
    res.status(200).json({ message: "Comprovativo guardado", data });
  } catch (error) {
    if (stored) await fs.unlink(stored).catch(() => {});
    next(error);
  }
});
router.get("/files/:filename", async (req, res, next): Promise<void> => {
  try {
    const name = req.params.filename;
    if (!/^[a-zA-Z0-9_-]+\.(pdf|png|jpe?g)$/.test(name)) { res.sendStatus(404); return; }
    const purchase = await prisma.purchase.findFirst({ where: { invoice: name }, select: { id: true } });
    if (!purchase) { res.sendStatus(404); return; }
    let file = path.join(uploadDirectory, name);
    try { await fs.access(file); } catch { file = path.join(legacyUploadDirectory, name); }
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.download(file, name, (err) => { if (err) next(err); });
  } catch (error) { next(error); }
});
export default router;
