import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  listSalesOrders,
  getSalesOrder,
  createSalesOrder,
  updateSalesOrder,
  confirmSalesOrder,
} from "../controllers/salesOrders.controller.js";

import { validate } from "../middlewares/validate.js";
import {
  createSalesOrderSchema,
  updateSalesOrderSchema,
} from "../validations/salesOrder.validation.js";

const router = Router();

router.use(authenticate);

// Allow both ADMIN and PORTAL users to list and view orders
router.get("/sales-orders", authorize("ADMIN", "PORTAL"), listSalesOrders);
router.get("/sales-orders/:id", authorize("ADMIN", "PORTAL"), getSalesOrder);
router.post(
  "/sales-orders",
  authorize("ADMIN"),
  validate(createSalesOrderSchema),
  createSalesOrder,
);
router.put(
  "/sales-orders/:id",
  authorize("ADMIN"),
  validate(updateSalesOrderSchema),
  updateSalesOrder,
);
router.post("/sales-orders/:id/confirm", authorize("ADMIN"), confirmSalesOrder);

export default router;
