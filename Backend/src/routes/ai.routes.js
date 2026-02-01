import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  getBudgetInsights,
  getAnomalies,
} from "../controllers/ai.controller.js";

const router = Router();

router.use(authenticate);

router.get("/insights", getBudgetInsights);
router.get("/anomalies", getAnomalies);

export default router;
