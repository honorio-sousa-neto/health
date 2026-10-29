import { asyncRouter } from "../../security/router";
import express from "express";
import type { Request, Response } from "express-serve-static-core";
import { ScreeningController } from "../../controllers/screening";
import { ScreeningRepository } from "../../repositories/screening";
import { Socket } from "socket.io";
const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io") as Socket;
  const repository = new ScreeningRepository();
  const controller = new ScreeningController(repository, io);
  const { statusCode, ...rest } = await controller.index({
    queue: req.query.queue as string | undefined,
    search: req.query.search as string,
    page: req.query.page as string,
    perPage: req.query.perPage as string,
  });
  res.status(statusCode).send(rest);
});
router.get("/logs/list", async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io") as Socket;
  const repository = new ScreeningRepository();
  const controller = new ScreeningController(repository, io);
  const { statusCode, ...rest } = await controller.indexLogs({
    search: req.query.search as string,
    page: req.query.page as string,
    perPage: req.query.perPage as string,
  });
  res.status(statusCode).send(rest);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const io = req.app.get("io") as Socket;
  const repository = new ScreeningRepository();
  const controller = new ScreeningController(repository, io);
  const { statusCode, ...rest } = await controller.show(id);
  res.status(statusCode).send(rest);
});

// router.delete('/destroy/:id', async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params
//   const repository = new ScreeningRepository()
//   const controller = new ScreeningController(repository)
//   const { statusCode, ...rest } = await controller.destroy(id)
//   return res.status(statusCode).send(rest)
// })

// router.patch('/soft-delete/:id', async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params
//   const repository = new ScreeningRepository()
//   const controller = new ScreeningController(repository)
//   const { statusCode, ...rest } = await controller.softDelete(id)
//   return res.status(statusCode).send(rest)
// })
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const io = req.app.get("io") as Socket;
  const repository = new ScreeningRepository();
  const controller = new ScreeningController(repository, io);
  const { statusCode, ...rest } = await controller.update(id, { ...req.body, nurseId: req.user!.id });
  res.status(statusCode).send(rest);
});
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const io = req.app.get("io") as Socket;
  const repository = new ScreeningRepository();
  const controller = new ScreeningController(repository, io);
  const { statusCode, ...rest } = await controller.create(body);
  res.status(statusCode).send(rest);
});

export default router;
