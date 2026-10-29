import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { CreateAccountClosureController } from "../../controllers/account-closure/create-account-closure/create-acount-closure";
import { GetAccountClosuresController } from "../../controllers/account-closure/get-account-closures/get-account-closures";
import { MongoCreateAccountClosure } from "../../repositories/account-closure/create-account-closure/mongo-create-account-closure";
import { MongoGetAccountClosuresRepository } from "../../repositories/account-closure/get-account-closures/mongo-get-account-closures";

const router = asyncRouter();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const getClientsRepository = new MongoGetAccountClosuresRepository();
  const getClientsController = new GetAccountClosuresController(
    getClientsRepository
  );

  const { body, statusCode } = await getClientsController.handle(req.body);
  res.status(statusCode).send(body);
});

router.post(
  "/create-account",
  async (req: Request, res: Response): Promise<void> => {
    const createAccountRepository = new MongoCreateAccountClosure();
    const createAccountController = new CreateAccountClosureController(
      createAccountRepository
    );
    const { body, statusCode } = await createAccountController.handle(req.body);

    res.status(statusCode).send(body);
  }
);

// router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
//   const updateClientRepository = new MongoUpdateClientRepository()
//   const updateClientController = new UpdateClientController(
//     updateClientRepository
//   )
//   const { statusCode, body } = await updateClientController.handle(
//     req.params.id,
//     req.body
//   )

//   return res.status(statusCode).send(body)
// })

// router.get('/:id', async (req: Request, res: Response): Promise<void> => {
//   // Pegar um;'ao
//   const repository = new MongoGetClientRepository()
//   const controller = new GetClientController(repository)

//   const { body, statusCode } = await controller.handle(req.params.id)
//   return res.status(statusCode).send(body)
// })
// router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
//   // Deletar um;'ao
//   const repository = new MongoDeleteClientRepository()
//   const controller = new DeleteClientController(repository)
//   const { body, statusCode } = await controller.handle(req.params.id)
//   return res.status(statusCode).send(body)
// })

export default router;
