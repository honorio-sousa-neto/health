import { asyncRouter } from "../../security/router";
import express from "express";
import type { Request, Response } from "express-serve-static-core";
import { RequestExamsController } from "../../controllers/request-exam";
import { RequestExamsRepository } from "../../repositories/request-exam";
import { Socket } from "socket.io";
const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io") as Socket;
  const repository = new RequestExamsRepository();
  const controller = new RequestExamsController(repository, io);
  const { statusCode, ...rest } = await controller.index(req.query.analystId as string | undefined);
  res.status(statusCode).send(rest);
});

router.get(
  "/view-results",
  async (req: Request, res: Response): Promise<void> => {
    const io = req.app.get("io") as Socket;
    const repository = new RequestExamsRepository();
    const controller = new RequestExamsController(repository, io);
    const { statusCode, ...rest } = await controller.results();
    res.status(statusCode).send(rest);
  }
);

router.get(
  "/external",
  async (req: Request, res: Response): Promise<void> => {
    const io = req.app.get("io") as Socket;
    const repository = new RequestExamsRepository();
    const controller = new RequestExamsController(repository, io);
    const { statusCode, ...rest } = await controller.indexExternal();
    res.status(statusCode).send(rest);
  }
);

router.get(
  "/external/:customerId",
  async (req: Request, res: Response): Promise<void> => {
    const io = req.app.get("io") as Socket;
    const repository = new RequestExamsRepository();
    const controller = new RequestExamsController(repository, io);
    const { statusCode, ...rest } = await controller.findByCustomer(req.params.customerId);
    res.status(statusCode).send(rest);
  }
);

router.post(
  "/external",
  async (req: Request, res: Response): Promise<void> => {
    const io = req.app.get("io") as Socket;
    const repository = new RequestExamsRepository();
    const controller = new RequestExamsController(repository, io);
    const { statusCode, ...rest } = await controller.createExternal(
      req.body.customerId,
      req.body.exams,
      req.body.paid === true
    );
    res.status(statusCode).send(rest);
  }
);

router.patch("/claim/:consultationId", async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io") as Socket;
  const repository = new RequestExamsRepository();
  const controller = new RequestExamsController(repository, io);
  const { statusCode, ...rest } = await controller.claimConsultation(
    req.params.consultationId,
    req.user!.id
  );
  res.status(statusCode).send(rest);
});

router.patch("/conclude/:customerId", async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io") as Socket;
  const repository = new RequestExamsRepository();
  const controller = new RequestExamsController(repository, io);
  const { statusCode, ...rest } = await controller.concludeExternal(req.params.customerId);
  res.status(statusCode).send(rest);
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io") as Socket;
  const repository = new RequestExamsRepository();
  const controller = new RequestExamsController(repository, io);
  const { statusCode, ...rest } = await controller.updateMany(req.params.id, req.body.exams);
  res.status(statusCode).send(rest);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io") as Socket;
  const userId = (req as any).userId as string | undefined;
  const repository = new RequestExamsRepository();
  const controller = new RequestExamsController(repository, io);
  const { statusCode, ...rest } = await controller.setResult(req.body, userId);
  res.status(statusCode).send(rest);
});

router.post(
  "/:consultationId",
  async (req: Request, res: Response): Promise<void> => {
    const io = req.app.get("io") as Socket;
    const repository = new RequestExamsRepository();
    const controller = new RequestExamsController(repository, io);
    const { statusCode, ...rest } = await controller.create(
      req.params.consultationId,
      req.body.exams
    );
    res.status(statusCode).send(rest);
  }
);

export default router;
