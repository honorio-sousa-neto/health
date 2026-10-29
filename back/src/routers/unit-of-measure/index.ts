import { asyncRouter } from "../../security/router";
import express, { Request, Response } from "express";
import { UnitOfMeasureController } from "../../controllers/unit-of-measure";

const router = asyncRouter();
const controller = new UnitOfMeasureController();

router.get("/", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await controller.index(req.query.search as string);
  res.status(statusCode).send(rest);
});

router.get("/:id", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await controller.show(req.params.id);
  res.status(statusCode).send(rest);
});

router.post("/", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await controller.create(req.body);
  res.status(statusCode).send(rest);
});

router.patch("/:id", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await controller.update(req.params.id, req.body);
  res.status(statusCode).send(rest);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { statusCode, ...rest } = await controller.destroy(req.params.id);
  res.status(statusCode).send(rest);
});

export default router;
