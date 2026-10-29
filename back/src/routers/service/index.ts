import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { ServiceController } from "../../controllers/service";
import { ServiceRepository } from "../../repositories/service";
import { TypeItem } from "@prisma/client";
import fs from "fs";
import { ServiceExport } from "../../controllers/service-export";
const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const repository = new ServiceRepository();
  const controller = new ServiceController(repository);
  const { statusCode, ...rest } = await controller.index({
    search: req.query.search as string,
    page: req.query.page as string,
    perPage: req.query.perPage as string,
    categoryId: req.query.category as string,
    type: req.query.type as TypeItem,
  });
  res.status(statusCode).send(rest);
});

router.get(
  "/filter/find",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new ServiceRepository();
    const controller = new ServiceController(repository);
    const { statusCode, ...rest } = await controller.list({
      search: req.query.search as string,
      page: req.query.page as string,
      perPage: req.query.perPage as string,
      categoryId: req.query.category as string,
    });
    res.status(statusCode).send(rest);
  }
);

router.get(
  "/internment/list",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new ServiceRepository();
    const controller = new ServiceController(repository);
    const { statusCode, ...rest } = await controller.internment({
      search: req.query.search as string,
      page: req.query.page as string,
      perPage: req.query.perPage as string,
      categoryId: req.query.category as string,
    });
    res.status(statusCode).send(rest);
  }
);
router.get(
  "/observation/list",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new ServiceRepository();
    const controller = new ServiceController(repository);
    const { statusCode, ...rest } = await controller.observation({
      search: req.query.search as string,
      page: req.query.page as string,
      perPage: req.query.perPage as string,
      categoryId: req.query.category as string,
    });
    res.status(statusCode).send(rest);
  }
);
router.get(
  "/surgeries/list",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new ServiceRepository();
    const controller = new ServiceController(repository);
    const { statusCode, ...rest } = await controller.surgeries({
      search: req.query.search as string,
      page: req.query.page as string,
      perPage: req.query.perPage as string,
      categoryId: req.query.category as string,
    });
    res.status(statusCode).send(rest);
  }
);
router.get(
  "/administration-medics/list",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new ServiceRepository();
    const controller = new ServiceController(repository);
    const { statusCode, ...rest } = await controller.administrationMedicaments({
      search: req.query.search as string,
      page: req.query.page as string,
      perPage: req.query.perPage as string,
      categoryId: req.query.category as string,
    });
    res.status(statusCode).send(rest);
  }
);
router.get(
  "/pharmacy/list",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new ServiceRepository();
    const controller = new ServiceController(repository);
    const { statusCode, ...rest } = await controller.pharmacyList({
      search: req.query.search as string,
    });
    res.status(statusCode).send(rest);
  }
);
router.get(
  "/vaccines/list",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new ServiceRepository();
    const controller = new ServiceController(repository);
    const { statusCode, ...rest } = await controller.vaccines({
      search: req.query.search as string,
      page: req.query.page as string,
      perPage: req.query.perPage as string,
      categoryId: req.query.category as string,
    });
    res.status(statusCode).send(rest);
  }
);
router.get(
  "/consultations/list",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new ServiceRepository();
    const controller = new ServiceController(repository);
    const { statusCode, ...rest } = await controller.consultations({
      search: req.query.search as string,
    });
    res.status(statusCode).send(rest);
  }
);
router.get(
  "/laboratory/list",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new ServiceRepository();
    const controller = new ServiceController(repository);
    const { statusCode, ...rest } = await controller.laboratory({
      search: req.query.search as string,
      page: req.query.page as string,
      perPage: req.query.perPage as string,
      categoryId: req.query.category as string,
    });
    res.status(statusCode).send(rest);
  }
);

router.get("/injetaveis/list", async (req: Request, res: Response): Promise<void> => {
  const controller = new ServiceController(new ServiceRepository());
  const { statusCode, ...rest } = await controller.injetaveisList();
  res.status(statusCode).send(rest);
});

router.get("/catalog", async (req: Request, res: Response): Promise<void> => {
  const controller = new ServiceController(new ServiceRepository());
  const { statusCode, ...rest } = await controller.catalog();
  res.status(statusCode).send(rest);
});

router.get("/lab-exams/list", async (req: Request, res: Response): Promise<void> => {
  const controller = new ServiceController(new ServiceRepository());
  const { statusCode, ...rest } = await controller.labServicesList();
  res.status(statusCode).send(rest);
});

router.get("/list-prices/index", async (req: Request, res: Response) => {
  const repository = new ServiceRepository();
  const controller = new ServiceController(repository);
  const { statusCode, ...rest } = await controller.listPrices({
    category: req.query.category as string,
  });
  res.status(statusCode).send(rest);
});

// Antes de `/:id` por clareza, ainda que o Express não os confunda: este tem
// três segmentos e aquele só um.
router.get(
  "/:id/export/excel",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { caminho, nome } = await new ServiceExport().handle(req.params.id);
      res.download(caminho, nome, (erro) => {
        if (erro) console.error(erro);
        fs.unlink(caminho, () => {});
      });
    } catch (erro) {
      console.error(erro);
      res.status(404).send({ message: "Não foi possível exportar este artigo." });
    }
  }
);

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new ServiceRepository();
  const controller = new ServiceController(repository);
  const { statusCode, ...rest } = await controller.show(id);
  res.status(statusCode).send(rest);
});

router.patch(
  "/soft-delete/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const repository = new ServiceRepository();
    const controller = new ServiceController(repository);
    const { statusCode, ...rest } = await controller.softDelete(id);
    res.status(statusCode).send(rest);
  }
);
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new ServiceRepository();
  const controller = new ServiceController(repository);
  const { statusCode, ...rest } = await controller.update(id, req.body);
  res.status(statusCode).send(rest);
});
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const repository = new ServiceRepository();
  const controller = new ServiceController(repository);
  const { statusCode, ...rest } = await controller.create(body);
  res.status(statusCode).send(rest);
});

router.post(
  "/change-stock",
  async (req: Request, res: Response): Promise<void> => {
    const { body } = req;
    const repository = new ServiceRepository();
    const controller = new ServiceController(repository);
    const { statusCode, ...rest } = await controller.changeStock(body);
    res.status(statusCode).send(rest);
  }
);

router.post(
  "/materials/attach",
  async (req: Request, res: Response): Promise<void> => {
    const { body } = req;
    const repository = new ServiceRepository();
    const controller = new ServiceController(repository);
    const { statusCode, ...rest } = await controller.attachMaterials(body);
    res.status(statusCode).send(rest);
  }
);

export default router;
