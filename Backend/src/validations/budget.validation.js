import { z } from "zod";

export const createBudgetSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Budget name is required"),
    periodStart: z.string().datetime(),
    periodEnd: z.string().datetime(),
    analyticalAccountId: z.string().uuid(),
    lines: z
      .array(
        z.object({
          type: z.enum(["INCOME", "EXPENSE"]),
          budgetedAmount: z.number().min(0),
        }),
      )
      .min(1, "At least one budget line is required"),
  }),
});

export const reviseBudgetSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    lines: z
      .array(
        z.object({
          type: z.enum(["INCOME", "EXPENSE"]),
          budgetedAmount: z.number().min(0),
        }),
      )
      .min(1, "Revision lines are required"),
  }),
});
