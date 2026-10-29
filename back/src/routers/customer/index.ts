import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { CustomerController } from "../../controllers/customer/customer";
import { CustomerRepository } from "../../repositories/customer/customer";
const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const search = req.query.search as string;
  const page = req.query.page as string;
  const perPage = req.query.perPage as string;
  const type = req.query.type as string;

  const repository = new CustomerRepository();
  const controller = new CustomerController(repository);
  const { statusCode, ...rest } = await controller.index({
    search,
    page,
    perPage,
    type,
  });
  res.status(statusCode).send(rest);
  return;
});

router.get(
  "/filter/search",
  async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string;

    const repository = new CustomerRepository();
    const controller = new CustomerController(repository);
    const { statusCode, ...rest } = await controller.index({ search });
    res.status(statusCode).send(rest);
  }
);

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new CustomerRepository();
  const controller = new CustomerController(repository);
  const { statusCode, ...rest } = await controller.show(id);
  res.status(statusCode).send(rest);
});

router.get(
  "/children/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const repository = new CustomerRepository();
    const controller = new CustomerController(repository);
    const { statusCode, ...rest } = await controller.indexChildren(id);
    res.status(statusCode).send(rest);
  }
);

router.get(
  "/my-benefits/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const repository = new CustomerRepository();
    const controller = new CustomerController(repository);
    const { statusCode, ...rest } = await controller.myBenefits({
      customerId: id,
    });
    res.status(statusCode).send(rest);
  }
);
router.get(
  "/accounts/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const repository = new CustomerRepository();
    const controller = new CustomerController(repository);
    const { statusCode, ...rest } = await controller.indexAccounts({
      customerId: req.query.customerId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      internId: req.query.internId as string,
      page: "1",
      perPage: "10",
    });
    res.status(statusCode).send(rest);
  }
);
router.get(
  "/other-accounts/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const repository = new CustomerRepository();
    const controller = new CustomerController(repository);
    const { statusCode, ...rest } = await controller.indexOtherAccounts({
      source: req.query.source as string,
      customerId: id,
      type: req.query.type as any,
    });
    res.status(statusCode).send(rest);
  }
);

router.patch(
  "/soft-delete/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const repository = new CustomerRepository();
    const controller = new CustomerController(repository);
    const { statusCode, ...rest } = await controller.softDelete(id);
    res.status(statusCode).send(rest);
  }
);

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new CustomerRepository();
  const controller = new CustomerController(repository);
  const { statusCode, ...rest } = await controller.update(id, req.body);
  res.status(statusCode).send(rest);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const repository = new CustomerRepository();
  const controller = new CustomerController(repository);
  const { statusCode, ...rest } = await controller.create(body);
  res.status(statusCode).send(rest);
});

export default router;
