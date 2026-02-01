import { z } from "zod";

export const createCustomerInvoiceSchema = z.object({
  body: z.object({
    number: z.string().min(1, "Invoice number is required"),
    customerId: z.string().uuid("Invalid customer ID"),
    salesOrderId: z.string().uuid().optional(),
    invoiceDate: z.string().datetime({ message: "Invalid ISO 8601 date" }),
    dueDate: z.string().datetime().optional(),
    status: z.enum(["DRAFT", "CONFIRMED"]).optional(),
    qrCode: z.string().optional(),
    lines: z
      .array(
        z.object({
          productId: z.string().uuid("Invalid product ID"),
          quantity: z.number().positive("Quantity must be positive"),
          unitPrice: z.number().min(0, "Unit price must be non-negative"),
          analyticalAccountId: z.string().uuid().optional(),
        }),
      )
      .min(1, "At least one line item is required"),
  }),
});

export const updateCustomerInvoiceSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Invoice ID"),
  }),
  body: z.object({
    customerId: z.string().uuid().optional(),
    salesOrderId: z.string().uuid().optional(),
    invoiceDate: z.string().datetime().optional(),
    dueDate: z.string().datetime().optional(),
    qrCode: z.string().optional(),
    lines: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().positive(),
          unitPrice: z.number().min(0),
          analyticalAccountId: z.string().uuid().optional(),
        }),
      )
      .optional(),
  }),
});
