import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  listCustomerInvoices,
  getCustomerInvoice,
  createCustomerInvoice,
  updateCustomerInvoice,
  confirmCustomerInvoice,
  downloadInvoicePDF,
} from "../controllers/customerInvoices.controller.js";

import { validate } from "../middlewares/validate.js";
import {
  createCustomerInvoiceSchema,
  updateCustomerInvoiceSchema,
} from "../validations/customerInvoice.validation.js";

const router = Router();

// Debug middleware to log all requests to this router
router.use((req, res, next) => {
  console.log("[customerInvoices.routes] Request:", req.method, req.path);
  next();
});

router.use(authenticate);

// Allow both ADMIN and PORTAL users to list and view invoices
router.get("/customer-invoices", authorize("ADMIN", "PORTAL"), listCustomerInvoices);
router.get("/customer-invoices/:id", authorize("ADMIN", "PORTAL"), getCustomerInvoice);
router.post(
  "/customer-invoices",
  authorize("ADMIN"),
  validate(createCustomerInvoiceSchema),
  createCustomerInvoice,
);
router.put(
  "/customer-invoices/:id",
  authorize("ADMIN"),
  validate(updateCustomerInvoiceSchema),
  updateCustomerInvoice,
);
router.post(
  "/customer-invoices/:id/confirm",
  authorize("ADMIN"),
  confirmCustomerInvoice,
);
router.get("/customer-invoices/:id/pdf", authorize("ADMIN", "PORTAL"), downloadInvoicePDF);

export default router;
