import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { ExamController } from "../../controllers/exams";
import { ExamRepository } from "../../repositories/exams";
const router = asyncRouter();

router.get(
  "/section/:id",
  async (req: Request, res: Response): Promise<void> => {
    const repository = new ExamRepository();
    const controller = new ExamController(repository);
    const { statusCode, ...rest } = await controller.index(
      {
        search: req.query.search as string,
        page: req.query.page as string,
        perPage: req.query.perPage as string,
      },
      req.params.id as string
    );
    res.status(statusCode).send(rest);
  }
);

router.get("/index", async (req: Request, res: Response): Promise<void> => {
  const repository = new ExamRepository();
  const controller = new ExamController(repository);
  const { statusCode, ...rest } = await controller.indexAll({
    search: req.query.search as string,
    page: req.query.page as string,
    perPage: req.query.perPage as string,
  });
  res.status(statusCode).send(rest);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new ExamRepository();
  const controller = new ExamController(repository);
  const { statusCode, ...rest } = await controller.show(id);
  res.status(statusCode).send(rest);
});

// router.delete('/destroy/:id', async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params
//   const repository = new ExamRepository()
//   const controller = new ExamController(repository)
//   const { statusCode, ...rest } = await controller.destroy(id)
//   return res.status(statusCode).send(rest)
// })

// router.patch('/soft-delete/:id', async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params
//   const repository = new ExamRepository()
//   const controller = new ExamController(repository)
//   const { statusCode, ...rest } = await controller.softDelete(id)
//   return res.status(statusCode).send(rest)
// })
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const repository = new ExamRepository();
  const controller = new ExamController(repository);
  const { statusCode, ...rest } = await controller.update(id, req.body);
  res.status(statusCode).send(rest);
});
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const repository = new ExamRepository();
  const controller = new ExamController(repository);
  const { statusCode, ...rest } = await controller.create(body);
  res.status(statusCode).send(rest);
});

export default router;
