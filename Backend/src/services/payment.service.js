import pkg from "@prisma/client";
const { Prisma } = pkg;
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

class PaymentService {
  constructor() {
    this.includePayment = {
      vendorBill: true,
      customerInvoice: true,
    };
  }

  #generateNumber(prefix = "PAY") {
    // Basic unique-ish number: PAY-YYYYMMDD-HHMMSS-XXXX
    const now = new Date();
    const ts = now
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);
    const rand = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `${prefix}-${ts}-${rand}`;
  }

  async listPayments() {
    return await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: this.includePayment,
    });
  }

  async createPayment(data) {
    const {
      number,
      paymentType,
      method,
      amount,
      vendorBillId,
      customerInvoiceId,
      referenceNotes,
    } = data;

    let bill, invoice;

    const paymentNumber = number && number.trim() !== "" ? number : this.#generateNumber();

    if (paymentType === "BILL") {
      bill = await prisma.vendorBill.findUnique({
        where: { id: vendorBillId },
      });
      if (!bill) throw new ApiError(404, "Vendor bill not found");
    }

    if (paymentType === "INVOICE") {
      invoice = await prisma.customerInvoice.findUnique({
        where: { id: customerInvoiceId },
      });
      if (!invoice) throw new ApiError(404, "Customer invoice not found");
    }

    return await prisma.$transaction(async (tx) => {
      const pay = await tx.payment.create({
        data: {
          number: paymentNumber,
          paymentType,
          method,
          status: "PAID",
          amount,
          paidAt: new Date(),
          vendorBillId,
          customerInvoiceId,
          referenceNotes,
        },
        include: this.includePayment,
      });

      if (bill) {
        const newDue = new Prisma.Decimal(bill.amountDue).minus(amount);
        const status = newDue.lte(0)
          ? "PAID"
          : newDue.lt(bill.total)
            ? "PARTIAL"
            : bill.status;
        await tx.vendorBill.update({
          where: { id: vendorBillId },
          data: { amountDue: newDue, status },
        });
      }

      if (invoice) {
        const newDue = new Prisma.Decimal(invoice.amountDue).minus(amount);
        const status = newDue.lte(0)
          ? "PAID"
          : newDue.lt(invoice.total)
            ? "PARTIAL"
            : invoice.status;
        await tx.customerInvoice.update({
          where: { id: customerInvoiceId },
          data: { amountDue: newDue, status },
        });
      }

      return pay;
    });
  }
}

export const paymentService = new PaymentService();
