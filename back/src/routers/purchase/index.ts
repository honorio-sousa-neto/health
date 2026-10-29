import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { PurchaseController } from "../../controllers/purchase/purchase";
import { PurchaseRepository } from "../../repositories/purchase/purchase";
const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const repository = new PurchaseRepository();
  const controller = new PurchaseController(repository);
  const { statusCode, ...rest } = await controller.index({
    search: req.query.search as string,
    page: req.query.page as string,
    perPage: req.query.perPage as string,
  });
  res.status(statusCode).send(rest);
});

// Antes de "/:id", senão estes seriam lidos como ids.
router.get("/pre-flight", async (req: Request, res: Response): Promise<void> => {
  const repository = new PurchaseRepository();
  const controller = new PurchaseController(repository);
  const { statusCode, ...rest } = await controller.preFlight(
    (req.query.destination as string) || "Caixa"
  );
  res.status(statusCode).send(rest);
});

router.get(
  "/last-item/:productId",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new PurchaseRepository();
    const controller = new PurchaseController(repository);
    const { statusCode, ...rest } = await controller.lastItem(
      req.params.productId
    );
    res.status(statusCode).send(rest);
  }
);

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new PurchaseRepository();
  const controller = new PurchaseController(repository);
  const { statusCode, ...rest } = await controller.show(id);
  res.status(statusCode).send(rest);
});

router.delete(
  "/destroy/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const repository = new PurchaseRepository();
    const controller = new PurchaseController(repository);
    // Anular compra = estornar stock + fluxo financeiro (não era o que fazia:
    // chamava show() e não apagava nada).
    const { statusCode, ...rest } = await controller.softDelete(id);
    res.status(statusCode).send(rest);
  }
);

router.patch(
  "/soft-delete/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const repository = new PurchaseRepository();
    const controller = new PurchaseController(repository);
    const { statusCode, ...rest } = await controller.softDelete(id);
    res.status(statusCode).send(rest);
  }
);

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new PurchaseRepository();
  const controller = new PurchaseController(repository);
  const { statusCode, ...rest } = await controller.update(id, req.body);
  res.status(statusCode).send(rest);
});
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const repository = new PurchaseRepository();
  const controller = new PurchaseController(repository);
  const { statusCode, ...rest } = await controller.create(body);
  res.status(statusCode).send(rest);
});

export default router;
