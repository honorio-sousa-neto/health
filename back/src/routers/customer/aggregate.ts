import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { CustomerController } from "../../controllers/customer/customer";
import { CustomerRepository } from "../../repositories/customer/customer";
const router = asyncRouter();

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new CustomerRepository();
  const controller = new CustomerController(repository);
  const { statusCode, ...rest } = await controller.createAggregate(
    req.body,
    id
  );
  res.status(statusCode).send(rest);
});

export default router;
