import pkg from "@prisma/client";
const { Prisma } = pkg;
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import {
  loadActiveAutoModels,
  resolveAnalyticalAccount,
} from "./autoAnalytical.service.js";
import { applyIncomeActual } from "./budget.service.js";

class CustomerInvoiceService {
  constructor() {
    this.includeInvoice = {
      customer: true,
      salesOrder: true,
      lines: { include: { product: true, analyticalAccount: true } },
      payments: true,
    };
  }

  async listCustomerInvoices(user) {
    let where = {};
    if (user && user.role === "PORTAL") {
      const contact = await prisma.contact.findUnique({
        where: { portalUserId: user.id },
      });
      if (!contact) return [];
      where = { customerId: contact.id };
    }
    return await prisma.customerInvoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: this.includeInvoice,
    });
  }

  async getCustomerInvoiceById(id) {
    const record = await prisma.customerInvoice.findUnique({
      where: { id },
      include: this.includeInvoice,
    });
    if (!record) throw new ApiError(404, "Customer invoice not found");
    return record;
  }

  async createCustomerInvoice(data) {
    const {
      number,
      customerId,
      invoiceDate,
      dueDate,
      salesOrderId,
      lines,
      status = "DRAFT",
      qrCode,
    } = data;

    const customer = await prisma.contact.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new ApiError(404, "Customer not found");

    if (salesOrderId) {
      const so = await prisma.salesOrder.findUnique({
        where: { id: salesOrderId },
      });
      if (!so) throw new ApiError(400, "Linked sales order not found");
    }

    const productIds = [...new Set(lines.map((l) => l.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== productIds.length) {
      throw new ApiError(400, "One or more products were not found");
    }
    const productMap = new Map(products.map((p) => [p.id, p]));
    const autoModels = await loadActiveAutoModels();

    const linesWithTotals = lines.map((line) => {
      const product = productMap.get(line.productId);
      const autoAnalyticalId =
        line.analyticalAccountId ||
        resolveAnalyticalAccount({
          models: autoModels,
          partnerId: customerId,
          partnerTags: customer.tags || [],
          productId: line.productId,
          productCategory: product?.category || null,
        });

      return {
        productId: line.productId,
        analyticalAccountId: autoAnalyticalId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: new Prisma.Decimal(line.quantity).times(line.unitPrice),
        autoAssigned:
          !line.analyticalAccountId && autoAnalyticalId
            ? true
            : line.autoAssigned || false,
      };
    });

    const total = linesWithTotals.reduce(
      (acc, l) => acc.plus(l.lineTotal),
      new Prisma.Decimal(0),
    );

    return await prisma.customerInvoice.create({
      data: {
        number,
        customerId,
        invoiceDate: new Date(invoiceDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        salesOrderId,
        status,
        total,
        amountDue: total,
        qrCode,
        lines: { create: linesWithTotals },
      },
      include: this.includeInvoice,
    });
  }

  async updateCustomerInvoice(id, data) {
    const invoice = await this.getCustomerInvoiceById(id);
    if (invoice.status !== "DRAFT")
      throw new ApiError(409, "Only DRAFT invoices can be updated");

    const { customerId, invoiceDate, dueDate, salesOrderId, lines, qrCode } =
      data;
    let customer = invoice.customer;

    if (customerId) {
      customer = await prisma.contact.findUnique({ where: { id: customerId } });
      if (!customer) throw new ApiError(404, "Customer not found");
    }

    if (salesOrderId) {
      const so = await prisma.salesOrder.findUnique({
        where: { id: salesOrderId },
      });
      if (!so) throw new ApiError(400, "Linked sales order not found");
    }

    let productMap;
    let autoModels;

    if (lines && Array.isArray(lines)) {
      const productIds = [...new Set(lines.map((l) => l.productId))];
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });
      if (products.length !== productIds.length) {
        throw new ApiError(400, "One or more products were not found");
      }
      productMap = new Map(products.map((p) => [p.id, p]));
      autoModels = await loadActiveAutoModels();
    }

    return await prisma.$transaction(async (tx) => {
      if (lines && Array.isArray(lines)) {
        await tx.customerInvoiceLine.deleteMany({
          where: { customerInvoiceId: id },
        });
        const linesWithTotals = lines.map((line) => {
          const product = productMap.get(line.productId);
          const autoAnalyticalId =
            line.analyticalAccountId ||
            resolveAnalyticalAccount({
              models: autoModels,
              partnerId: customer.id,
              partnerTags: customer.tags || [],
              productId: line.productId,
              productCategory: product?.category || null,
            });

          return {
            customerInvoiceId: id,
            productId: line.productId,
            analyticalAccountId: autoAnalyticalId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: new Prisma.Decimal(line.quantity).times(line.unitPrice),
            autoAssigned:
              !line.analyticalAccountId && autoAnalyticalId
                ? true
                : line.autoAssigned || false,
          };
        });
        await tx.customerInvoiceLine.createMany({ data: linesWithTotals });
        const total = linesWithTotals.reduce(
          (acc, l) => acc.plus(l.lineTotal),
          new Prisma.Decimal(0),
        );
        await tx.customerInvoice.update({
          where: { id },
          data: { total, amountDue: total },
        });
      }

      return tx.customerInvoice.update({
        where: { id },
        data: {
          customerId,
          salesOrderId,
          invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          qrCode,
        },
        include: this.includeInvoice,
      });
    });
  }

  async confirmCustomerInvoice(id) {
    const invoice = await this.getCustomerInvoiceById(id);
    if (invoice.status !== "DRAFT")
      throw new ApiError(409, "Only DRAFT invoices can be confirmed");

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.customerInvoice.update({
        where: { id },
        data: { status: "CONFIRMED" },
        include: this.includeInvoice,
      });

      for (const line of invoice.lines) {
        if (line.analyticalAccountId) {
          await applyIncomeActual({
            analyticalAccountId: line.analyticalAccountId,
            onDate: invoice.invoiceDate,
            amount: line.lineTotal,
          });
        }
      }
      return updated;
    });
  }
}

export const customerInvoiceService = new CustomerInvoiceService();
