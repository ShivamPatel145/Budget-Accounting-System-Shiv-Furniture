import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { customerInvoiceService } from "../services/customerInvoice.service.js";
import { generateInvoicePDF } from "../services/pdf.service.js";

export const listCustomerInvoices = asyncHandler(async (req, res) => {
  console.log("listCustomerInvoices called - User:", req.user);
  const invoices = await customerInvoiceService.listCustomerInvoices(req.user);
  res.json(new ApiResponse(200, invoices));
});

export const getCustomerInvoice = asyncHandler(async (req, res) => {
  const invoice = await customerInvoiceService.getCustomerInvoiceById(
    req.params.id,
  );
  res.json(new ApiResponse(200, invoice));
});

export const createCustomerInvoice = asyncHandler(async (req, res) => {
  const invoice = await customerInvoiceService.createCustomerInvoice(req.body);
  res
    .status(201)
    .json(
      new ApiResponse(201, invoice, "Customer Invoice created successfully"),
    );
});

export const updateCustomerInvoice = asyncHandler(async (req, res) => {
  const invoice = await customerInvoiceService.updateCustomerInvoice(
    req.params.id,
    req.body,
  );
  res.json(
    new ApiResponse(200, invoice, "Customer Invoice updated successfully"),
  );
});

export const confirmCustomerInvoice = asyncHandler(async (req, res) => {
  const invoice = await customerInvoiceService.confirmCustomerInvoice(
    req.params.id,
  );
  res.json(
    new ApiResponse(200, invoice, "Customer Invoice confirmed successfully"),
  );
});

export const downloadInvoicePDF = asyncHandler(async (req, res) => {
  const doc = await generateInvoicePDF(req.params.id);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${req.params.id}.pdf`,
  );

  doc.pipe(res);
});
