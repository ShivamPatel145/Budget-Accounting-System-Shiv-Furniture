import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  listVendorBills,
  getVendorBill,
  createVendorBill,
  updateVendorBill,
  confirmVendorBill,
} from "../controllers/vendorBills.controller.js";

import { validate } from "../middlewares/validate.js";
import {
  createVendorBillSchema,
  updateVendorBillSchema,
} from "../validations/vendorBill.validation.js";

const router = Router();

router.use(authenticate);

// Allow both ADMIN and PORTAL users to list and view bills
router.get("/vendor-bills", authorize("ADMIN", "PORTAL"), listVendorBills);
router.get("/vendor-bills/:id", authorize("ADMIN", "PORTAL"), getVendorBill);
router.post(
  "/vendor-bills",
  authorize("ADMIN"),
  validate(createVendorBillSchema),
  createVendorBill,
);
router.put(
  "/vendor-bills/:id",
  authorize("ADMIN"),
  validate(updateVendorBillSchema),
  updateVendorBill,
);
router.post("/vendor-bills/:id/confirm", authorize("ADMIN"), confirmVendorBill);

export default router;
