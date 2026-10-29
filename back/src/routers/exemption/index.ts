import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { ExemptionController } from "../../controllers/exemption";
import { ExemptionRepository } from "../../repositories/exemption";
const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const search = req.query.search as string;
  const page = req.query.page as string;
  const perPage = req.query.perPage as string;
  const type = req.query.type as string;

  const repository = new ExemptionRepository();
  const controller = new ExemptionController(repository);
  const { statusCode, ...rest } = await controller.index();
  res.status(statusCode).send(rest);
});

export default router;
