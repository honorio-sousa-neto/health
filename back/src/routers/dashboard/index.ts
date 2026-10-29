import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { ReportPerMonthController } from "../../controllers/dashboard/report-per-month/report-per-month";
import { MongoGetReportPerMonth } from "../../repositories/dashboard/report-per-month/report-per-month";

const router = asyncRouter();

router.get("/per-month", async (req: Request, res: Response): Promise<void> => {
  const repository = new MongoGetReportPerMonth();
  const controller = new ReportPerMonthController(repository);
  const { body, statusCode } = await controller.handle();
  res.status(statusCode).send(body);
});

export default router;
