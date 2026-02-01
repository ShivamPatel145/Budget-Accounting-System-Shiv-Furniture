import pkg from "@prisma/client";
const { Prisma } = pkg;
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import {
  loadActiveAutoModels,
  resolveAnalyticalAccount,
} from "./autoAnalytical.service.js";

class SalesOrderService {
  constructor() {
    this.includeSo = {
      customer: true,
      lines: { include: { product: true, analyticalAccount: true } },
      invoices: true,
    };
  }

  async listSalesOrders(user) {
    let where = {};
    if (user && user.role === "PORTAL") {
      const contact = await prisma.contact.findUnique({
        where: { portalUserId: user.id },
      });
      if (!contact) return [];
      where = { customerId: contact.id };
    }
    return await prisma.salesOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: this.includeSo,
    });
  }

  async getSalesOrderById(id) {
    const record = await prisma.salesOrder.findUnique({
      where: { id },
      include: this.includeSo,
    });
    if (!record) {
      throw new ApiError(404, "Sales order not found");
    }
    return record;
  }

  async createSalesOrder(data) {
    const { number, customerId, orderDate, status = "DRAFT", lines } = data;

    const customer = await prisma.contact.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new ApiError(404, "Customer not found");

    const productIds = [...new Set(lines.map((l) => l.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== productIds.length) {
      throw new ApiError(400, "One or more products were not found");
    }
    const productMap = new Map(products.map((p) => [p.id, p]));
    const autoModels = await loadActiveAutoModels();

    const linesWithTotals = this.buildLinesWithAutoAssign({
      lines,
      partnerId: customerId,
      partnerTags: customer.tags || [],
      productMap,
      autoModels,
    });

    const total = this.computeTotals(linesWithTotals);

    return await prisma.salesOrder.create({
      data: {
        number,
        customerId,
        orderDate: new Date(orderDate),
        status,
        total,
        lines: { create: linesWithTotals },
      },
      include: this.includeSo,
    });
  }

  async updateSalesOrder(id, data) {
    const so = await this.getSalesOrderById(id);
    if (so.status !== "DRAFT")
      throw new ApiError(409, "Only DRAFT sales orders can be updated");

    const { customerId, orderDate, lines } = data;
    let customer = so.customer;

    if (customerId) {
      customer = await prisma.contact.findUnique({ where: { id: customerId } });
      if (!customer) throw new ApiError(404, "Customer not found");
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
        await tx.salesOrderLine.deleteMany({ where: { salesOrderId: id } });
        const linesWithTotals = this.buildLinesWithAutoAssign({
          lines,
          partnerId: customer.id,
          partnerTags: customer.tags || [],
          productMap,
          autoModels,
          salesOrderId: id,
        });

        await tx.salesOrderLine.createMany({ data: linesWithTotals });
        const total = this.computeTotals(linesWithTotals);
        await tx.salesOrder.update({ where: { id }, data: { total } });
      }

      return tx.salesOrder.update({
        where: { id },
        data: {
          customerId,
          orderDate: orderDate ? new Date(orderDate) : undefined,
        },
        include: this.includeSo,
      });
    });
  }

  async confirmSalesOrder(id) {
    const so = await this.getSalesOrderById(id);
    if (so.status !== "DRAFT")
      throw new ApiError(409, "Only DRAFT sales orders can be confirmed");

    return await prisma.salesOrder.update({
      where: { id },
      data: { status: "CONFIRMED" },
      include: this.includeSo,
    });
  }

  buildLinesWithAutoAssign({
    lines,
    partnerId,
    partnerTags,
    productMap,
    autoModels,
    salesOrderId,
  }) {
    return lines.map((line) => {
      const product = productMap.get(line.productId);
      const autoAnalyticalId =
        line.analyticalAccountId ||
        resolveAnalyticalAccount({
          models: autoModels,
          partnerId,
          partnerTags,
          productId: line.productId,
          productCategory: product?.category || null,
        });

      return {
        salesOrderId,
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
  }

  computeTotals(lines) {
    return lines.reduce(
      (acc, l) => acc.plus(l.lineTotal),
      new Prisma.Decimal(0),
    );
  }
}

export const salesOrderService = new SalesOrderService();
