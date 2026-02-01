import { z } from "zod";

export const productValidation = {
  createProduct: z.object({
    body: z.object({
      name: z.string().min(1, "Name is required"),
      description: z.string().optional(),
      category: z.string().optional(), // Adjust based on actual schema if needed
      salesPrice: z.union([z.string(), z.number()]).optional(),
      purchasePrice: z.union([z.string(), z.number()]).optional(),
      inventory: z.number().int().nonnegative().optional().default(0),
    }),
  }),
  updateProduct: z.object({
    body: z.object({
      name: z.string().min(1, "Name is required").optional(), // Optional on update
      description: z.string().optional(),
      category: z.string().optional(),
      salesPrice: z.union([z.string(), z.number()]).optional(),
      purchasePrice: z.union([z.string(), z.number()]).optional(),
      inventory: z.number().int().nonnegative().optional(),
    }),
  }),
};
