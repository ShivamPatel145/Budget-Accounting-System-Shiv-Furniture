import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  listBudgets,
  getBudget,
  createBudget,
  updateBudget,
  confirmBudget,
  archiveBudget,
  reviseBudget,
} from "../controllers/budgets.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createBudgetSchema,
  reviseBudgetSchema,
} from "../validations/budget.validation.js";

const router = Router();

router.use(authenticate);

router.get("/budgets", listBudgets);
router.get("/budgets/:id", getBudget);

router.post(
  "/budgets",
  authorize("ADMIN"),
  validate(createBudgetSchema),
  createBudget,
);
router.put("/budgets/:id", authorize("ADMIN"), updateBudget);
router.post("/budgets/:id/confirm", authorize("ADMIN"), confirmBudget);
router.post("/budgets/:id/archive", authorize("ADMIN"), archiveBudget);
router.post(
  "/budgets/:id/revise",
  authorize("ADMIN"),
  validate(reviseBudgetSchema),
  reviseBudget,
);

export default router;
