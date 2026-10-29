import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { ConsultationController } from "../../controllers/consultation";
import { ConsultationRepository } from "../../repositories/consultation";
import { Socket } from "socket.io";
const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io") as Socket;
  const repository = new ConsultationRepository();
  const controller = new ConsultationController(repository, io);
  const { statusCode, ...rest } = await controller.index({
    search: req.query.search as string,
    page: req.query.page as string,
    perPage: req.query.perPage as string,
    doctorId: req.query.doctorId as string | undefined,
  });
  res.status(statusCode).send(rest);
});

router.get("/logs/list", async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io") as Socket;
  const repository = new ConsultationRepository();
  const controller = new ConsultationController(repository, io);
  const { statusCode, ...rest } = await controller.indexLogs({
    search: req.query.search as string,
    page: req.query.page as string,
    perPage: req.query.perPage as string,
  });
  res.status(statusCode).send(rest);
});

router.get("/by-customer/:customerId", async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io") as Socket;
  const repository = new ConsultationRepository();
  const controller = new ConsultationController(repository, io);
  const { statusCode, ...rest } = await controller.byCustomer(req.params.customerId);
  res.status(statusCode).send(rest);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const io = req.app.get("io") as Socket;
  const repository = new ConsultationRepository();
  const controller = new ConsultationController(repository, io);
  const { statusCode, ...rest } = await controller.show(id);
  res.status(statusCode).send(rest);
});

// router.delete('/destroy/:id', async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params
//   const repository = new ConsultationRepository()
//   const controller = new ConsultationController(repository)
//   const { statusCode, ...rest } = await controller.destroy(id)
//   return res.status(statusCode).send(rest)
// })

// router.patch('/soft-delete/:id', async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params
//   const repository = new ConsultationRepository()
//   const controller = new ConsultationController(repository)
//   const { statusCode, ...rest } = await controller.softDelete(id)
//   return res.status(statusCode).send(rest)
// })
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const io = req.app.get("io") as Socket;
  const repository = new ConsultationRepository();
  const controller = new ConsultationController(repository, io);
  const { statusCode, ...rest } = await controller.update(id, { ...req.body, ...(["doctor", "admin"].includes(req.user!.role) ? { doctorId: req.user!.id } : {}) });
  res.status(statusCode).send(rest);
});
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const io = req.app.get("io") as Socket;
  const repository = new ConsultationRepository();
  const controller = new ConsultationController(repository, io);
  const { statusCode, ...rest } = await controller.create(body);
  res.status(statusCode).send(rest);
});

export default router;
