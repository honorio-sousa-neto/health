import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
// import { MapReportController } from '../../controllers/printing/map'
import { ExcelReport } from "../../controllers/excel-report";
import { InvoicePrintController } from "../../controllers/report-new";
const router = asyncRouter();

import fs from "fs";
import { InvoiceController } from "../../controllers/invoice";
import { InvoiceRepository } from "../../repositories/invoice";
router.get(
  "/:id/:second?",
  async (req: Request, res: Response): Promise<void> => {
    const reportController = new InvoicePrintController();
    const { id, second } = req.params;
    const result = await reportController.handle(id, Boolean(second));
    res.type("application/pdf").end(result);
  }
);

router.get(
  "/download/excel/report",
  async (req: Request, res: Response): Promise<void> => {
    const reportController = new ExcelReport();
    const { year, month } = req.query;
    const filePath = await reportController.handle(Number(year), Number(month));
    res.download(filePath, `relatorio-${month}-${year}.xlsx`, (err) => {
      if (err) {
        console.error(err);
      }
      fs.unlinkSync(filePath);
    });
  }
);
router.get(
  "/download/excel/monthly-report",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new InvoiceRepository();
    const reportController = new InvoiceController(repository);
    const { year, month } = req.query;
    const { body } = await reportController.invoicesByMonth(
      Number(month),
      Number(year)
    );
    res.download(body?.data, `relatorio-${month}-${year}.xlsx`, (err) => {
      if (err) {
        console.error(err);
      }
      fs.unlinkSync(body?.data);
    });
  }
);

router.get(
  "/termal/printing/:id/:second?",
  async (req: Request, res: Response): Promise<void> => {
    const reportController = new InvoicePrintController();
    const { id, second } = req.params;
    const result = await reportController.defineDocument(id, Boolean(second));
    res.type("application/pdf").end(result);
  }
);
router.get(
  "/levantamento/byMonth/excel",
  async (req: Request, res: Response): Promise<void> => {
    const reportController = new ExcelReport();
    console.log("Hey there");
    const { year, month } = req.query;
    const filePath = await reportController.generateReportByMonth(
      Number(year),
      Number(month)
    );
    res.download(filePath, `${month}-${year}.xlsx`, (err) => {
      if (err) {
        console.error(err);
      }
      fs.unlinkSync(filePath);
    });
  }
);
// router.get('/map/services', async (req: Request, res: Response): Promise<void> => {
//   const reportController = new MapReportController()
//   const { id } = req.params
//   const result = await reportController.handle(id)
//   return res.end(result)
// })
// router.get("/map/products", async (req: Request, res: Response): Promise<void> => {
//   const reportController = new MapProductReportController();
//   const { id } = req.params;
//   const result = await reportController.handle(id);
//   return res.end(result);
// });

export default router;
