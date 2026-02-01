import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  listAutoModels,
  getAutoModel,
  createAutoModel,
  updateAutoModel,
  deleteAutoModel,
} from "../controllers/autoModels.controller.js";

const router = Router();

router.use(authenticate);

router.get("/auto-analytical-models", listAutoModels);
router.get("/auto-analytical-models/:id", getAutoModel);
router.post("/auto-analytical-models", authorize("ADMIN"), createAutoModel);
router.put("/auto-analytical-models/:id", authorize("ADMIN"), updateAutoModel);
router.delete(
  "/auto-analytical-models/:id",
  authorize("ADMIN"),
  deleteAutoModel,
);

export default router;
