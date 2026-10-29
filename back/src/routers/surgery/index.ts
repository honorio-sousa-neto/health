import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { SurgeryController } from "../../controllers/surgery";
import { SurgeryRepository } from "../../repositories/surgery";
import { Socket } from "socket.io";
const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io") as Socket;
  const repository = new SurgeryRepository();
  const controller = new SurgeryController(repository, io);
  const { statusCode, ...rest } = await controller.index();
  res.status(statusCode).send(rest);
});

router.get(
  "/requests/list",
  async (req: Request, res: Response): Promise<void> => {
    const io = req.app.get("io") as Socket;
    const repository = new SurgeryRepository();
    const controller = new SurgeryController(repository, io);
    const { statusCode, ...rest } = await controller.indexSurgeriesToPay();
    res.status(statusCode).send(rest);
  }
);

router.get("/by-customer/:customerId", async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io") as Socket;
  const repository = new SurgeryRepository();
  const controller = new SurgeryController(repository, io);
  const { statusCode, ...rest } = await controller.byCustomer(req.params.customerId);
  res.status(statusCode).send(rest);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const io = req.app.get("io") as Socket;
  const repository = new SurgeryRepository();
  const controller = new SurgeryController(repository, io);
  const { statusCode, ...rest } = await controller.show(id);
  res.status(statusCode).send(rest);
});

// router.delete('/destroy/:id', async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params
//   const repository = new
// SurgeryRepository();
//   const controller = new SurgeryController(repository)
//   const { statusCode, ...rest } = await controller.destroy(id)
//   return res.status(statusCode).send(rest)
// })

// router.patch('/soft-delete/:id', async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params
//   const repository = new
// SurgeryRepository();
//   const controller = new SurgeryController(repository)
//   const { statusCode, ...rest } = await controller.softDelete(id)
//   return res.status(statusCode).send(rest)
// })
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const io = req.app.get("io") as Socket;
  const repository = new SurgeryRepository();
  const controller = new SurgeryController(repository, io);
  const { statusCode, ...rest } = await controller.update(id, req.body);
  res.status(statusCode).send(rest);
});
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const io = req.app.get("io") as Socket;
  const repository = new SurgeryRepository();
  const controller = new SurgeryController(repository, io);
  const { statusCode, ...rest } = await controller.create(body);
  res.status(statusCode).send(rest);
});

export default router;
