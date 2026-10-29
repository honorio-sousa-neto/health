import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { BalanceController } from "../../controllers/balance";
const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const type = String(req.query.type);
  const range = String(req.query.range);

  const controller = new BalanceController();
  const response = await controller.show(type, range);
  res.status(200).send(response);
  return;
});

router.get("/reports", async (req: Request, res: Response): Promise<void> => {
  const type = String(req.query.type);
  const range = String(req.query.range);
  const from = String(req.query.from);
  const to = String(req.query.to);
  console.log({ type, range, from, to });
  const controller = new BalanceController();
  const response = await controller.showReport(type, range, from, to);
  res.status(200).send(response);
  return;
});

export default router;
