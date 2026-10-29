import { asyncRouter } from "../../security/router";
import { InvoiceStatus } from "@prisma/client";
import type { Request, Response } from "express";
import express from "express";
import { InsuranceController } from "../../controllers/insurance";
import { InsuranceRepository } from "../../repositories/insurance";
const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const repository = new InsuranceRepository();
  const controller = new InsuranceController(repository);
  const { statusCode, ...rest } = await controller.index();
  res.status(statusCode).send(rest);
});
router.get(
  "/index-customers/list",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new InsuranceRepository();
    const controller = new InsuranceController(repository);
    const { statusCode, ...rest } = await controller.indexCustomers(
      req.query.id as string
    );
    res.status(statusCode).send(rest);
  }
);

router.get(
  "/invoices/:id",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new InsuranceRepository();
    const controller = new InsuranceController(repository);
    const { statusCode, ...rest } = await controller.getInvoices(
      {
        search: req.query.search as string,
        page: Number(req.query.page as string),
        perPage: Number(req.query.perPage as string),
        status: req.query.status as InvoiceStatus,
      },
      req.params.id
    );
    res.status(statusCode).send(rest);
  }
);

router.get(
  "/invoices/:id",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new InsuranceRepository();
    const controller = new InsuranceController(repository);
    const { statusCode, ...rest } = await controller.getInvoices(
      {
        search: req.query.search as string,
        page: Number(req.query.page as string),
        perPage: Number(req.query.perPage as string),
        status: req.query.status as InvoiceStatus,
      },
      req.params.id
    );
    res.status(statusCode).send(rest);
  }
);

router.get(
  "/invoices/debt-and-payment/:id",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new InsuranceRepository();
    const controller = new InsuranceController(repository);
    const status = req.query.status as InvoiceStatus;
    const { statusCode, ...rest } = await controller.getDebtAndPaidInvoices(
      req.params.id,
      status
    );
    res.status(statusCode).send(rest);
  }
);

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new InsuranceRepository();
  const controller = new InsuranceController(repository);
  const { statusCode, ...rest } = await controller.show(id);
  res.status(statusCode).send(rest);
});

// router.delete('/destroy/:id', async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params
//   const repository = new InsuranceRepository()
//   const controller = new InsuranceController(repository)
//   const { statusCode, ...rest } = await controller.destroy(id)
//   return res.status(statusCode).send(rest)
// })

router.patch(
  "/soft-delete/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const repository = new InsuranceRepository();
    const controller = new InsuranceController(repository);
    const { statusCode, ...rest } = await controller.softDelete(id);
    res.status(statusCode).send(rest);
  }
);
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new InsuranceRepository();
  const controller = new InsuranceController(repository);
  const { statusCode, ...rest } = await controller.update(id, req.body);
  res.status(statusCode).send(rest);
});
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const repository = new InsuranceRepository();
  const controller = new InsuranceController(repository);
  const { statusCode, ...rest } = await controller.create(body);
  res.status(statusCode).send(rest);
});

router.post(
  "/attach-customer/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { body } = req;
    const repository = new InsuranceRepository();
    const controller = new InsuranceController(repository);
    const { statusCode, ...rest } = await controller.attachCustomer(id, body);
    res.status(statusCode).send(rest);
  }
);

export default router;
