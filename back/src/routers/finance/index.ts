import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { FinanceController } from "../../controllers/finance";
import { FinanceRepository } from "../../repositories/finance";
const router = asyncRouter();

router.get("/receipt", async (req: Request, res: Response): Promise<void> => {
  const repository = new FinanceRepository();
  const controller = new FinanceController(repository);
  const { status, ...rest } = await controller.receipt();
  res.status(status).send(rest);
});

export default router;
