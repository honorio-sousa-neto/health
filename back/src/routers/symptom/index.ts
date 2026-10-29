import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { SymptomsController } from "../../controllers/symptom";
import { SymptomsRepository } from "../../repositories/symptom";
const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const search = (req.query.search as string) || "";
  const page = Number(req.query.page as string) || 1;
  const perPage = Number(req.query.perPage as string) || 10;
  const repository = new SymptomsRepository();
  const controller = new SymptomsController(repository);
  console.log("Hey there");
  const { status, ...rest } = await controller.index({
    search,
    page,
    perPage,
  });
  res.status(status).send(rest);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new SymptomsRepository();
  const controller = new SymptomsController(repository);
  const { status, ...rest } = await controller.show(id);
  res.status(status).send(rest);
});

router.delete(
  "/destroy/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const repository = new SymptomsRepository();
    const controller = new SymptomsController(repository);
    const { status, ...rest } = await controller.destroy(id);
    res.status(status).send(rest);
  }
);

router.patch(
  "/soft-delete/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const repository = new SymptomsRepository();
    const controller = new SymptomsController(repository);
    const { status, ...rest } = await controller.softDelete(id);
    res.status(status).send(rest);
  }
);
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const repository = new SymptomsRepository();
  const controller = new SymptomsController(repository);
  const { status, ...rest } = await controller.create(body);
  res.status(status).send(rest);
});

export default router;
