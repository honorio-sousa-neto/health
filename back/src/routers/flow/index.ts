import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { FlowController } from "../../controllers/flow";
import { FlowRepository } from "../../repositories/flow";
const router = asyncRouter();

router.get(
  "/index/:flow",
  async (req: Request, res: Response): Promise<void> => {
    const search = (req.query.search as string) || "";
    const page = Number(req.query.page as string) || 1;
    const perPage = Number(req.query.perPage as string) || 10;
    const flow = req.params.flow || "Caixa";
    const orderBy = req.query.orderBy || { createdAt: "desc" };

    const repository = new FlowRepository();
    const controller = new FlowController(repository);
    const { status, ...rest } = await controller.reportByFlow(flow, {
      search,
      page,
      perPage,
      orderBy,
    });
    res.status(status).send(rest);
  }
);

router.get(
  "/filter/search",
  async (req: Request, res: Response): Promise<void> => {}
);

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new FlowRepository();
  const controller = new FlowController(repository);
  const { status, ...rest } = await controller.show(id);
  res.status(status).send(rest);
});

router.delete(
  "/destroy/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const repository = new FlowRepository();
    const controller = new FlowController(repository);
    const { status, ...rest } = await controller.destroy(id);
    res.status(status).send(rest);
  }
);

router.patch(
  "/soft-delete/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const repository = new FlowRepository();
    const controller = new FlowController(repository);
    const { status, ...rest } = await controller.softDelete(id);
    res.status(status).send(rest);
  }
);

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new FlowRepository();
  const controller = new FlowController(repository);
  const { status, ...rest } = await controller.update(id, req.body);
  res.status(status).send(rest);
});
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const repository = new FlowRepository();
  const controller = new FlowController(repository);
  const { status, ...rest } = await controller.create(body);
  res.status(status).send(rest);
});

export default router;
