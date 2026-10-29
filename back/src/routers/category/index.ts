import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { CategoryController } from "../../controllers/category";
import { CategoryRepository } from "../../repositories/category";

const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const search = req.query.search as string;
  const page = req.query.page as string;
  const perPage = req.query.perPage as string;

  const repository = new CategoryRepository();
  const controller = new CategoryController(repository);
  const { statusCode, ...rest } = await controller.index({
    search,
    page: Number(page),
    perPage: Number(perPage),
  });
  res.status(statusCode).send(rest);
  return;
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new CategoryRepository();
  const controller = new CategoryController(repository);
  const { statusCode, ...rest } = await controller.show({ id });
  res.status(statusCode).send(rest);
  return;
});
router.get(
  "/services/index",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new CategoryRepository();
    const controller = new CategoryController(repository);
    const { statusCode, ...rest } = await controller.observationsServices();
    res.status(statusCode).send(rest);
    return;
  }
);

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const repository = new CategoryRepository();
  const controller = new CategoryController(repository);
  console.log(body);
  const { statusCode, ...rest } = await controller.create(body);
  res.status(statusCode).send(rest);
  return;
});

router.patch("/soft-delete/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new CategoryRepository();
  const controller = new CategoryController(repository);
  const { statusCode, ...rest } = await controller.softDelete(id);
  res.status(statusCode).send(rest);
  return;
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new CategoryRepository();
  const controller = new CategoryController(repository);
  const { statusCode, ...rest } = await controller.update(id, req.body);
  res.status(statusCode).send(rest);
  return;
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new CategoryRepository();
  const controller = new CategoryController(repository);
  const { statusCode, ...rest } = await controller.destroy(id);
  res.status(statusCode).send(rest);
  return;
});

export default router;
