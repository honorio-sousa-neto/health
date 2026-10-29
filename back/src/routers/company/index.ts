import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { CompanyController } from "../../controllers/company";
import { CompanyRepository } from "../../repositories/company";
const router = asyncRouter();

const make = () => new CompanyController(new CompanyRepository());

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const { statusCode, ...body } = await make().index();
  res.status(statusCode).send(body);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { statusCode, ...body } = await make().show(id);
  res.status(statusCode).send(body);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { statusCode, ...body } = await make().upsert(req.body);
  res.status(statusCode).send(body);
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { statusCode, ...body } = await make().update(id, req.body);
  res.status(statusCode).send(body);
});

export default router;
