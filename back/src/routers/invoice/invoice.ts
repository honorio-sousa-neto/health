import { asyncRouter } from "../../security/router";
import { Category, InvoiceStatus, InvoiceType } from "@prisma/client";
import type { Request, Response } from "express";
import express from "express";
import { InvoiceController } from "../../controllers/invoice/invoice";
import { InvoiceRepository } from "../../repositories/invoice/invoice";
import { StockError } from "../../services/stock/stock-service";
import { issueInvoice, InvoiceError } from "../../services/invoice/issue";
const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const repository = new InvoiceRepository();
  const controller = new InvoiceController(repository);
  const { statusCode, ...rest } = await controller.index({
    search: req.query.search as string,
    page: req.query.page as string,
    perPage: req.query.perPage as string,
    type: req.query.category as InvoiceType,
  });
  res.status(statusCode).send(rest);
});

router.get(
  "/index/by-status",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new InvoiceRepository();
    const controller = new InvoiceController(repository);
    const { statusCode, ...rest } = await controller.indexByStatus({
      search: req.query.search as string,
      page: req.query.page as string,
      perPage: req.query.perPage as string,
      status: req.query.status as InvoiceStatus,
    });
    res.status(statusCode).send(rest);
  }
);
router.get(
  "/index/by-service-category",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new InvoiceRepository();
    const controller = new InvoiceController(repository);
    const { statusCode, ...rest } =
      await controller.getInvoicesByCategoryOfService({
        search: req.query.search as string,
        page: Number(req.query.page as string),
        perPage: Number(req.query.perPage as string),
        range: req.query.range as string,
        categoryId: req.query.category as string,
      });
    res.status(statusCode).send(rest);
  }
);

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new InvoiceRepository();
  const controller = new InvoiceController(repository);
  const { statusCode, ...rest } = await controller.show(id);
  res.status(statusCode).send(rest);
});

// Issued documents cannot be edited directly; settlement/correction creates a linked document.
router.patch("/:id", (_req, res) => {
  res.status(405).json({ success: false, message: "Emita um documento de regularização para alterar o estado" });
});
router.post("/", async (req, res, next): Promise<void> => {
  try {
    const data = await issueInvoice(req.body, req.user!, req.get("Idempotency-Key") ?? "");
    res.status(201).json({ success: true, message: "Documento emitido", data });
  } catch (error) {
    if (error instanceof StockError) { res.status(409).json({ success: false, message: error.message }); return; }
    if (error instanceof InvoiceError) { res.status(error.status).json({ success: false, message: error.message }); return; }
    next(error);
  }
});

export default router;
