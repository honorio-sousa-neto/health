import { asyncRouter } from "../../security/router";
import express, { Request, Response } from "express";
import { AmbulatoryPlanController } from "../../controllers/ambulatory-plan";
import { AmbulatoryPlanRepository } from "../../repositories/ambulatory-plan";

const router = asyncRouter();
const ctrl = () => new AmbulatoryPlanController(new AmbulatoryPlanRepository());

router.post("/", async (req: Request, res: Response) => {
  const { prescriptionId, customerId } = req.body;
  const { statusCode, ...rest } = await ctrl().create(prescriptionId, customerId);
  res.status(statusCode).send(rest);
});

router.get("/", async (_req: Request, res: Response) => {
  const { statusCode, ...rest } = await ctrl().index();
  res.status(statusCode).send(rest);
});

router.get("/:planId", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await ctrl().show(req.params.planId);
  res.status(statusCode).send(rest);
});

router.patch("/:sessionId/done", async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const doneById = req.user!.id;
  const { statusCode, ...rest } = await ctrl().markDone(sessionId, doneById);
  res.status(statusCode).send(rest);
});

export default router;
