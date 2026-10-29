import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { ProductController } from "../../controllers/product";
import { ProductRepository } from "../../repositories/product";

const router = asyncRouter();

function makeController() {
  const repository = new ProductRepository();
  return new ProductController(repository);
}

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const controller = makeController();
  const { statusCode, ...rest } = await controller.index({
    search: req.query.search as string,
    page: req.query.page as string,
    perPage: req.query.perPage as string,
    categoryId: req.query.category as string,
  });
  res.status(statusCode).send(rest);
});

router.get(
  "/filter/find",
  async (req: Request, res: Response): Promise<void> => {
    const controller = makeController();
    const { statusCode, ...rest } = await controller.list({
      search: req.query.search as string,
      page: req.query.page as string,
      perPage: req.query.perPage as string,
      categoryId: req.query.category as string,
    });
    res.status(statusCode).send(rest);
  }
);

router.get("/list-prices/index", async (req: Request, res: Response) => {
  const controller = makeController();
  const { statusCode, ...rest } = await controller.listPrices({
    category: req.query.category as string,
  });
  res.status(statusCode).send(rest);
});

router.get("/pharmacy/articles", async (req: Request, res: Response): Promise<void> => {
  const controller = makeController();
  const { statusCode, ...rest } = await controller.pharmacyArticles({
    search: req.query.search as string,
  });
  res.status(statusCode).send(rest);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const controller = makeController();
  const { statusCode, ...rest } = await controller.show(req.params.id);
  res.status(statusCode).send(rest);
});

router.patch(
  "/soft-delete/:id",
  async (req: Request, res: Response): Promise<void> => {
    const controller = makeController();
    const { statusCode, ...rest } = await controller.softDelete(req.params.id);
    res.status(statusCode).send(rest);
  }
);

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const controller = makeController();
  const { statusCode, ...rest } = await controller.update(
    req.params.id,
    req.body
  );
  res.status(statusCode).send(rest);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const controller = makeController();
  const { statusCode, ...rest } = await controller.create(req.body);
  res.status(statusCode).send(rest);
});

router.post(
  "/change-stock",
  async (req: Request, res: Response): Promise<void> => {
    const controller = makeController();
    const { statusCode, ...rest } = await controller.changeStock(req.body);
    res.status(statusCode).send(rest);
  }
);

router.post(
  "/materials/attach",
  async (req: Request, res: Response): Promise<void> => {
    const controller = makeController();
    const { statusCode, ...rest } = await controller.attachMaterials(req.body);
    res.status(statusCode).send(rest);
  }
);

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const controller = makeController();
  const { statusCode, ...rest } = await controller.destroy(req.params.id);
  res.status(statusCode).send(rest);
});

export default router;
