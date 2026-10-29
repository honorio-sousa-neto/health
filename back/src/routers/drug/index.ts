import { Router } from "express";
import { DrugController } from "../../controllers/drug";
import { DrugRepository } from "../../repositories/drug";

const router = Router();

router.get("/", async (req, res) => {
  const drugController = new DrugController(new DrugRepository());
  const { perPage, page, search } = req.query;
  const { statusCode, ...rest } = await drugController.index({
    perPage: Number(perPage),
    page: Number(page),
    search: search as string,
  });
  res.status(statusCode).json(rest);
  return;
});

router.post("/", async (req, res) => {
  const drugController = new DrugController(new DrugRepository());
  const { statusCode, ...rest } = await drugController.create(req.body);
  res.status(statusCode).json(rest);
  return;
});
router.patch("/:id", async (req, res) => {
  const drugController = new DrugController(new DrugRepository());
  const { statusCode, ...rest } = await drugController.update(
    req.params.id,
    req.body
  );
  res.status(statusCode).json(rest);
  return;
});

// router.delete("/:id", async (req, res) => {
//   const drugController = new DrugController(new DrugRepository());
//   const { statusCode, ...rest } = await drugController.destroy(req.params.id);
//   res.status(statusCode).json(rest);
//   return;
// });

router.get("/:id", async (req, res) => {
  const drugController = new DrugController(new DrugRepository());
  const { statusCode, ...rest } = await drugController.show(req.params.id);
  res.status(statusCode).json(rest);
  return;
});
router.patch("/soft-delete/:id", async (req, res) => {
  const drugController = new DrugController(new DrugRepository());
  const { statusCode, ...rest } = await drugController.softDelete(
    req.params.id
  );
  res.status(statusCode).json(rest);
  return;
});
export default router;
