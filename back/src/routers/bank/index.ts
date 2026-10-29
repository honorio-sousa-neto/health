import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { BankAccountController } from "../../controllers/bank";
import { BankAccountRepository } from "../../repositories/bank";
const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const repository = new BankAccountRepository();
  const controller = new BankAccountController(repository);
  const { statusCode, ...rest } = await controller.index();
  res.status(statusCode).send(rest);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new BankAccountRepository();
  const controller = new BankAccountController(repository);
  const { statusCode, ...rest } = await controller.show(id);
  res.status(statusCode).send(rest);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new BankAccountRepository();
  const controller = new BankAccountController(repository);
  const { statusCode, ...rest } = await controller.destroy(id);
  res.status(statusCode).send(rest);
});
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new BankAccountRepository();
  const controller = new BankAccountController(repository);
  const { statusCode, ...rest } = await controller.update(id, req.body);
  res.status(statusCode).send(rest);
});
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const repository = new BankAccountRepository();
  const controller = new BankAccountController(repository);
  const { statusCode, ...rest } = await controller.create(body);
  res.status(statusCode).send(rest);
});

export default router;
