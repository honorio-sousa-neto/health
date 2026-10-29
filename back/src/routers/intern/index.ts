import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { InternController } from "../../controllers/intern";
import { InternRepository } from "../../repositories/intern";
const router = asyncRouter();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const repository = new InternRepository();
  const controller = new InternController(repository);
  const { statusCode, ...rest } = await controller.index();
  res.status(statusCode).send(rest);
});

router.get(
  "/my-invoices/list",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new InternRepository();
    const controller = new InternController(repository);
    const { statusCode, ...rest } = await controller.invoicesIntern({
      search: req.query.search as string,
      page: req.query.page as string,
      perPage: req.query.perPage as string,
      customerId: req.query.customerId as string,
      internId: req.query.internId as string,
    });
    res.status(statusCode).send(rest);
  }
);

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  console.log("Hey");
  const { id } = req.params;
  const repository = new InternRepository();
  const controller = new InternController(repository);
  const { statusCode, ...rest } = await controller.show(id);
  res.status(statusCode).send(rest);
});

// router.delete('/destroy/:id', async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params
//   const repository = new
// InternRepository();
//   const controller = new InternController(repository)
//   const { statusCode, ...rest } = await controller.destroy(id)
//   return res.status(statusCode).send(rest)
// })

router.patch(
  "/soft-delete/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const repository = new InternRepository();
    const controller = new InternController(repository);
    const { statusCode, ...rest } = await controller.softDelete(id);
    res.status(statusCode).send(rest);
  }
);
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new InternRepository();
  const controller = new InternController(repository);
  const { statusCode, ...rest } = await controller.update(id, req.body);
  res.status(statusCode).send(rest);
});
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const repository = new InternRepository();
  const controller = new InternController(repository);
  const { statusCode, ...rest } = await controller.create(body);
  res.status(statusCode).send(rest);
});

export default router;
