import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { MaterialController } from "../../controllers/material";
import { MaterialRepository } from "../../repositories/material";
const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const repository = new MaterialRepository();
  const controller = new MaterialController(repository);
  const { statusCode, ...rest } = await controller.index({
    search: req.query.search as string,
    page: req.query.page as string,
    perPage: req.query.perPage as string,
  });
  res.status(statusCode).send(rest);
});


router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new MaterialRepository();
  const controller = new MaterialController(repository);
  const { statusCode, ...rest } = await controller.show(id);
  res.status(statusCode).send(rest);
});

// router.delete('/destroy/:id', async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params
//   const repository = new MaterialRepository()
//   const controller = new MaterialController(repository)
//   const { statusCode, ...rest } = await controller.destroy(id)
//   return res.status(statusCode).send(rest)
// })

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  // Sem este try/catch, um erro de validação do zod rejeitava a promessa do
  // handler e mais nada acontecia: o Express 4 não apanha rejeições de
  // handlers assíncronos, por isso o pedido nunca recebia resposta. Do lado de
  // quem grava, era um botão que fica a carregar para sempre — pior do que um
  // erro, porque não se sabe se gravou.
  try {
    const { id } = req.params;
    const repository = new MaterialRepository();
    const controller = new MaterialController(repository);
    const { statusCode, ...rest } = await controller.update(id, req.body);
    res.status(statusCode).send(rest);
  } catch (erro: any) {
    console.error("materials PATCH", erro);
    res.status(400).send({
      success: false,
      data: null,
      message: "Não foi possível guardar o consumível. Verifique os campos.",
    });
  }
});

router.patch(
  "/update/stock/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const repository = new MaterialRepository();
    const controller = new MaterialController(repository);
    const { statusCode, ...rest } = await controller.updateQuantity(
      id,
      req.body
    );
    res.status(statusCode).send(rest);
  }
);

router.post("/", async (req: Request, res: Response): Promise<void> => {
  // O mesmo do PATCH, pela mesma razão: sem try/catch, um erro de validação
  // não devolve erro nenhum — devolve silêncio, e o botão fica a girar.
  try {
    const { body } = req;
    const repository = new MaterialRepository();
    const controller = new MaterialController(repository);
    const { statusCode, ...rest } = await controller.create(body);
    res.status(statusCode).send(rest);
  } catch (erro: any) {
    console.error("materials POST", erro);
    res.status(400).send({
      success: false,
      data: null,
      message: "Não foi possível criar o consumível. Verifique os campos.",
    });
  }
});

export default router;
