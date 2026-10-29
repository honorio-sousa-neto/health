import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { InventoryController } from "../../controllers/inventory";

const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const search = req.query.search as string;
  const page = req.query.page as string;
  const perPage = req.query.perPage as string;
  const type = req.query.type as string;

  const controller = new InventoryController();
  const status = req.query.status as string;
  const { statusCode, ...rest } = await controller.index({ search, page, perPage, status });
  res.status(statusCode).send(rest);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const controller = new InventoryController();
  const { statusCode, ...rest } = await controller.show(id);
  res.status(statusCode).send(rest);
});

export default router;
