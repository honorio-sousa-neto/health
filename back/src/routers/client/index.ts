import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { CreateClientController } from "../../controllers/client/create-client/create-client";
import { DeleteClientController } from "../../controllers/client/delete-client/delete-client";
import { GetClientController } from "../../controllers/client/get-client/get-client";
import { GetClientsController } from "../../controllers/client/get-clients/get-clients";
import { UpdateClientController } from "../../controllers/client/update-client/update-client";
import { MongoCreateClientRepository } from "../../repositories/client/create-client/mongo-create-client";
import { MongoDeleteClientRepository } from "../../repositories/client/delete-client/mongo-delete-client";
import { MongoGetClientRepository } from "../../repositories/client/get-client/mongo-get-client";
import { MongoGetClientsRepository } from "../../repositories/client/get-clients/mongo-get-clients";
import { MongoUpdateClientRepository } from "../../repositories/client/update-client/mongo-update-client";

const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const getClientsRepository = new MongoGetClientsRepository();
  const getClientsController = new GetClientsController(getClientsRepository);
  const { body, statusCode } = await getClientsController.handle();
  res.status(statusCode).send(body);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const createClientRepository = new MongoCreateClientRepository();
  const createClientController = new CreateClientController(
    createClientRepository
  );
  const { body, statusCode } = await createClientController.handle(req.body);

  res.status(statusCode).send(body);
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const updateClientRepository = new MongoUpdateClientRepository();
  const updateClientController = new UpdateClientController(
    updateClientRepository
  );
  const { statusCode, body } = await updateClientController.handle(
    req.params.id,
    req.body
  );

  res.status(statusCode).send(body);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  // Pegar um;'ao
  const repository = new MongoGetClientRepository();
  const controller = new GetClientController(repository);

  const { body, statusCode } = await controller.handle(req.params.id);
  res.status(statusCode).send(body);
});
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  // Deletar um;'ao
  const repository = new MongoDeleteClientRepository();
  const controller = new DeleteClientController(repository);
  const { body, statusCode } = await controller.handle(req.params.id);
  res.status(statusCode).send(body);
});

export default router;
