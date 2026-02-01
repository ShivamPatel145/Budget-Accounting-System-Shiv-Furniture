import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  listPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  confirmPurchaseOrder,
} from "../controllers/purchaseOrders.controller.js";

import { validate } from "../middlewares/validate.js";
import {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
} from "../validations/purchaseOrder.validation.js";

const router = Router();

router.use(authenticate);

// Allow both ADMIN and PORTAL users to list and view orders
router.get("/purchase-orders", authorize("ADMIN", "PORTAL"), listPurchaseOrders);
router.get("/purchase-orders/:id", authorize("ADMIN", "PORTAL"), getPurchaseOrder);
router.post(
  "/purchase-orders",
  authorize("ADMIN"),
  validate(createPurchaseOrderSchema),
  createPurchaseOrder,
);
router.put(
  "/purchase-orders/:id",
  authorize("ADMIN"),
  validate(updatePurchaseOrderSchema),
  updatePurchaseOrder,
);
router.post(
  "/purchase-orders/:id/confirm",
  authorize("ADMIN"),
  confirmPurchaseOrder,
);

export default router;
