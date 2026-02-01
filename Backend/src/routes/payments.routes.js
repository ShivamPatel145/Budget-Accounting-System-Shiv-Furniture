import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  listPayments,
  createPayment,
  downloadPaymentReceipt,
} from "../controllers/payments.controller.js";
import { validate } from "../middlewares/validate.js";
import { paymentValidation } from "../validations/payment.validation.js";

const router = Router();

router.use(authenticate);

router.get("/payments", authorize("ADMIN", "PORTAL"), listPayments);
router.get(
  "/payments/:id/receipt",
  authorize("ADMIN", "PORTAL"),
  downloadPaymentReceipt,
);
router.post(
  "/payments",
  authorize("ADMIN"),
  validate(paymentValidation.createPayment),
  createPayment,
);

export default router;
