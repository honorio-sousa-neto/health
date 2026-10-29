import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { LoginController } from "../../controllers/auth/login";
import { UserRepository } from "../../repositories/user";

import { loginLimit } from "../../security/rate-limit";
const router = asyncRouter();

router.post("/login", loginLimit, async (req: Request, res: Response): Promise<void> => {
  const repository = new UserRepository();
  const controller = new LoginController(repository);
  const { statusCode, ...rest } = await controller.handle(req.body);
  res.status(statusCode).send(rest);
});

export default router;
