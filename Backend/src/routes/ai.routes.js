import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import {

  getBudgetInsights,
  getAnomalies,
  getPredictions,
  getEfficiencyTrend
} from "../controllers/ai.controller.js";

const router = Router();

router.use(authenticate);

router.get("/insights", getBudgetInsights);
router.get("/anomalies", getAnomalies);
router.get("/predictions", getPredictions);
router.get("/trends", getEfficiencyTrend);

export default router;
