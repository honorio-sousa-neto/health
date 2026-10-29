import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { FlowController } from "../../controllers/flow/flow";
import { FlowRepository } from "../../repositories/flow/flow";
const router = asyncRouter();

router.get(
  "/metrics/:destination",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new FlowRepository();
    const controller = new FlowController(repository);
    const { statusCode, ...rest } = await controller.aggregateData(
      req.params.destination
    );
    res.status(statusCode).send(rest);
  }
);

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { destination, perPage, page } = req.query;
  const repository = new FlowRepository();
  const controller = new FlowController(repository);
  const { statusCode, ...rest } = await controller.index(
    { page: String(page), perPage: String(perPage) },
    destination as string
  );
  res.status(statusCode).send(rest);
});

// router.delete('/destroy/:id', async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params
//   const repository = new
// FlowRepository();
//   const controller = new FlowController(repository)
//   const { statusCode, ...rest } = await controller.destroy(id)
//   return res.status(statusCode).send(rest)
// })

// router.patch('/soft-delete/:id', async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params
//   const repository = new
// FlowRepository();
//   const controller = new FlowController(repository)
//   const { statusCode, ...rest } = await controller.softDelete(id)
//   return res.status(statusCode).send(rest)
// })
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new FlowRepository();
  const controller = new FlowController(repository);
  const { statusCode, ...rest } = await controller.update(id, req.body);
  res.status(statusCode).send(rest);
});
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const repository = new FlowRepository();
  const controller = new FlowController(repository);
  const { statusCode, ...rest } = await controller.create(body);
  res.status(statusCode).send(rest);
});

export default router;
