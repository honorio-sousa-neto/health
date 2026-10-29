import { asyncRouter } from "../../security/router";
import express from "express";
import type { Request, Response } from "express-serve-static-core";
import { AttendanceController } from "../../controllers/attendance";
import { AttendanceRepository } from "../../repositories/attendance";

const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const controller = new AttendanceController(new AttendanceRepository());
  const { statusCode, ...rest } = await controller.index({
    page: req.query.page as string,
    perPage: req.query.perPage as string,
    search: req.query.search as string,
  });
  res.status(statusCode).send(rest);
});

router.get("/by-customer/:customerId", async (req: Request, res: Response): Promise<void> => {
  const controller = new AttendanceController(new AttendanceRepository());
  const { statusCode, ...rest } = await controller.byCustomer(req.params.customerId);
  res.status(statusCode).send(rest);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const controller = new AttendanceController(new AttendanceRepository());
  const { statusCode, ...rest } = await controller.show(req.params.id);
  res.status(statusCode).send(rest);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io");
  const controller = new AttendanceController(new AttendanceRepository(), io);
  const { statusCode, ...rest } = await controller.create({ ...req.body, receptionistId: req.user!.id });
  res.status(statusCode).send(rest);
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io");
  const controller = new AttendanceController(new AttendanceRepository(), io);
  const { statusCode, ...rest } = await controller.update(req.params.id, req.body);
  res.status(statusCode).send(rest);
});

export default router;
