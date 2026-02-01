import { z } from "zod";

export const paymentValidation = {
  createPayment: z.object({
    body: z
      .object({
        number: z.string().optional(), // Often auto-generated, but can be passed
        paymentType: z.enum(["BILL", "INVOICE"]),
        method: z.string().min(1, "Payment method is required"),
        amount: z.number().int().positive("Amount must be a positive integer"), // Assuming amounts are integers/cents or similar based on Prisma Decimal usage usually requiring transformation, but looking at service it uses Decimal. We'll stick to number for now, service handles Decimal conversion.
        // amount: z.union([z.string(), z.number()]).refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be positive"), // Alternative if string/number mix is expected.

        referenceNotes: z.string().optional(),

        vendorBillId: z.string().optional(),
        customerInvoiceId: z.string().optional(),
      })
      .refine(
        (data) => {
          if (data.paymentType === "BILL") {
            return !!data.vendorBillId;
          }
          return true;
        },
        {
          message: "vendorBillId required for BILL payments",
          path: ["vendorBillId"],
        },
      )
      .refine(
        (data) => {
          if (data.paymentType === "INVOICE") {
            return !!data.customerInvoiceId;
          }
          return true;
        },
        {
          message: "customerInvoiceId required for INVOICE payments",
          path: ["customerInvoiceId"],
        },
      ),
  }),
};
