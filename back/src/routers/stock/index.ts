import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { StockController } from "../../controllers/stock";
import { buildMonthlyStockWorkbook } from "../../controllers/stock/monthly-excel";

const router = asyncRouter();
const ctrl   = new StockController();

// ── Locations ──────────────────────────────────────────────────────────────────

router.get("/locations", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await ctrl.listLocations();
  res.status(statusCode).send(rest);
});

router.post("/locations", async (req: Request, res: Response) => {
  const userId = (req as any).userId as string | undefined;
  const { statusCode, ...rest } = await ctrl.createLocation(req.body, userId);
  res.status(statusCode).send(rest);
});

router.patch("/locations/:id", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await ctrl.updateLocation(req.params.id, req.body);
  res.status(statusCode).send(rest);
});

// ── Balance ────────────────────────────────────────────────────────────────────

router.get("/balance", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await ctrl.balance(req.query.locationId as string | undefined);
  res.status(statusCode).send(rest);
});

// ── Entries ────────────────────────────────────────────────────────────────────

router.get("/entries", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await ctrl.listEntries(req.query as any);
  res.status(statusCode).send(rest);
});

router.post("/entries", async (req: Request, res: Response) => {
  const userId = (req as any).userId as string | undefined;
  const { statusCode, ...rest } = await ctrl.createEntry(req.body, userId);
  res.status(statusCode).send(rest);
});

// ── Transfers ──────────────────────────────────────────────────────────────────

router.get("/transfers", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await ctrl.listTransfers(req.query as any);
  res.status(statusCode).send(rest);
});

router.post("/transfers", async (req: Request, res: Response) => {
  const userId = (req as any).userId as string | undefined;
  const { statusCode, ...rest } = await ctrl.createTransfer(req.body, userId);
  res.status(statusCode).send(rest);
});

// ── Consumptions ───────────────────────────────────────────────────────────────

router.get("/consumptions", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await ctrl.listConsumptions(req.query as any);
  res.status(statusCode).send(rest);
});

router.post("/consumptions", async (req: Request, res: Response) => {
  const userId = (req as any).userId as string | undefined;
  const { statusCode, ...rest } = await ctrl.createConsumption(req.body, userId);
  res.status(statusCode).send(rest);
});

// ── Adjustments ────────────────────────────────────────────────────────────────

router.post("/adjustments", async (req: Request, res: Response) => {
  const userId = (req as any).userId as string | undefined;
  const { statusCode, ...rest } = await ctrl.createAdjustment(req.body, userId);
  res.status(statusCode).send(rest);
});

// ── Declaração de consumo na realização de um serviço ─────────────────────────

// Itens declaráveis (consumíveis + produtos) com saldo actual
router.get("/items", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await ctrl.listStockItems({
    search: req.query.search as string | undefined,
    type: req.query.type as string | undefined,
  });
  res.status(statusCode).send(rest);
});

// Consumo padrão de um ou mais serviços (?serviceId=a  ou  ?serviceIds=a,b,c)
router.get("/consumables/suggest", async (req: Request, res: Response) => {
  const raw = (req.query.serviceIds ?? req.query.serviceId) as string | string[] | undefined;
  const ids = Array.isArray(raw)
    ? raw
    : String(raw ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const { statusCode, ...rest } = await ctrl.suggestConsumables(ids);
  res.status(statusCode).send(rest);
});

router.post("/consumptions/declare", async (req: Request, res: Response) => {
  const userId = (req as any).userId as string | undefined;
  const { statusCode, ...rest } = await ctrl.declareConsumption(req.body, userId);
  res.status(statusCode).send(rest);
});

// ── Movements (history) ────────────────────────────────────────────────────────

router.get("/movements", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await ctrl.listMovements(req.query as any);
  res.status(statusCode).send(rest);
});

// ── Monthly report ─────────────────────────────────────────────────────────────

router.get("/report", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await ctrl.monthlyReport(req.query as any);
  res.status(statusCode).send(rest);
});

router.get("/reports/monthly", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await ctrl.monthlyReport(req.query as any);
  res.status(statusCode).send(rest);
});

// Relatório mensal em Excel (entradas/saídas diárias por produto)
router.get("/reports/monthly/excel", async (req: Request, res: Response) => {
  const now = new Date();
  const year = Number(req.query.year) || now.getFullYear();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const locationId = (req.query.locationId as string) || undefined;

  if (month < 1 || month > 12) {
    res.status(400).send({ success: false, message: "Mês inválido" });
    return;
  }

  const wb = await buildMonthlyStockWorkbook({ year, month, locationId });
  const filename = `inventario-${String(month).padStart(2, "0")}-${year}.xlsx`;
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  await wb.xlsx.write(res);
  res.end();
});

export default router;
