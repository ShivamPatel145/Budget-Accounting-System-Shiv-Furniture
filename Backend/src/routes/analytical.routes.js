import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  listAnalyticalAccounts,
  getAnalyticalAccount,
  createAnalyticalAccount,
  updateAnalyticalAccount,
  deleteAnalyticalAccount,
} from "../controllers/analytical.controller.js";

const router = Router();

router.use(authenticate);

router.get("/analytical-accounts", authorize("ADMIN", "PORTAL"), listAnalyticalAccounts);
router.get("/analytical-accounts/:id", authorize("ADMIN", "PORTAL"), getAnalyticalAccount);
router.post(
  "/analytical-accounts",
  authorize("ADMIN"),
  createAnalyticalAccount,
);
router.put(
  "/analytical-accounts/:id",
  authorize("ADMIN"),
  updateAnalyticalAccount,
);
router.delete(
  "/analytical-accounts/:id",
  authorize("ADMIN"),
  deleteAnalyticalAccount,
);

export default router;
