import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { SupplierController } from "../../controllers/supplier";
import { SupplierRepository } from "../../repositories/supplier";

const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const controller = new SupplierController(new SupplierRepository());
  const { statusCode, ...rest } = await controller.index({
    search: req.query.search as string,
    page: Number(req.query.page),
    perPage: Number(req.query.perPage),
  });
  res.status(statusCode).send(rest);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const controller = new SupplierController(new SupplierRepository());
  const { statusCode, ...rest } = await controller.show(req.params.id);
  res.status(statusCode).send(rest);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const controller = new SupplierController(new SupplierRepository());
  const { statusCode, ...rest } = await controller.create(req.body);
  res.status(statusCode).send(rest);
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const controller = new SupplierController(new SupplierRepository());
  const { statusCode, ...rest } = await controller.update(req.params.id, req.body);
  res.status(statusCode).send(rest);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const controller = new SupplierController(new SupplierRepository());
  const { statusCode, ...rest } = await controller.softDelete(req.params.id);
  res.status(statusCode).send(rest);
});

export default router;
