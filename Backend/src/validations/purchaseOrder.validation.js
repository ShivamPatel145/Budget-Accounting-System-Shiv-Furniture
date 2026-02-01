import { z } from "zod";

export const createPurchaseOrderSchema = z.object({
  body: z.object({
    number: z.string().min(1, "Order number is required"),
    vendorId: z.string().uuid("Invalid vendor ID"),
    orderDate: z.string().datetime({ message: "Invalid ISO 8601 date" }),
    status: z.enum(["DRAFT", "CONFIRMED"]).optional(),
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

export const updatePurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid PO ID"),
  }),
  body: z.object({
    vendorId: z.string().uuid().optional(),
    orderDate: z.string().datetime().optional(),
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
