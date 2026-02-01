import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { paymentService } from "../services/payment.service.js";
import { generatePaymentReceiptPDF } from "../services/pdf.service.js";

export const listPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.listPayments();
  res.json(new ApiResponse(200, payments));
});

export const createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPayment(req.body);
  res
    .status(201)
    .json(new ApiResponse(201, payment, "Payment recorded successfully"));
});

export const downloadPaymentReceipt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { doc, payment } = await generatePaymentReceiptPDF(id);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${payment.number || "payment-receipt"}.pdf`,
  );

  doc.pipe(res);
  doc.end();
});
