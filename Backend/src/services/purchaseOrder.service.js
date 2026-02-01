import pkg from "@prisma/client";
const { Prisma } = pkg;
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import {
  loadActiveAutoModels,
  resolveAnalyticalAccount,
} from "./autoAnalytical.service.js";

class PurchaseOrderService {
  constructor() {
    this.includePo = {
      vendor: true,
      lines: { include: { product: true, analyticalAccount: true } },
      vendorBills: true,
    };
  }

  async createPurchaseOrder(data) {
    const { number, vendorId, orderDate, status = "DRAFT", lines } = data;

    const vendor = await prisma.contact.findUnique({ where: { id: vendorId } });
    if (!vendor) throw new ApiError(404, "Vendor not found");

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
      partnerId: vendorId,
      partnerTags: vendor.tags,
      productMap,
      autoModels,
    });

    const total = this.computePoTotals(linesWithTotals);

    return await prisma.purchaseOrder.create({
      data: {
        number,
        vendorId,
        orderDate: new Date(orderDate),
        status,
        total,
        lines: { create: linesWithTotals },
      },
      include: this.includePo,
    });
  }

  async getPurchaseOrders(user) {
    let where = {};
    if (user && user.role === "PORTAL") {
      const contact = await prisma.contact.findUnique({
        where: { portalUserId: user.id },
      });
      if (!contact) return [];
      where = { vendorId: contact.id };
    }
    return await prisma.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: this.includePo,
    });
  }

  async getPurchaseOrderById(id) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: this.includePo,
    });
    if (!po) throw new ApiError(404, "Purchase Order not found");
    return po;
  }

  async updatePurchaseOrder(id, data) {
    const po = await this.getPurchaseOrderById(id);
    if (po.status !== "DRAFT")
      throw new ApiError(409, "Only DRAFT purchase orders can be updated");

    const { vendorId, orderDate, lines } = data;
    let vendor = po.vendor;

    if (vendorId) {
      vendor = await prisma.contact.findUnique({ where: { id: vendorId } });
      if (!vendor) throw new ApiError(404, "Vendor not found");
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
        await tx.purchaseOrderLine.deleteMany({
          where: { purchaseOrderId: id },
        });
        const linesWithTotals = this.buildLinesWithAutoAssign({
          lines,
          partnerId: vendor.id,
          partnerTags: vendor.tags || [],
          productMap,
          autoModels,
          purchaseOrderId: id,
        });

        await tx.purchaseOrderLine.createMany({ data: linesWithTotals });
        const total = this.computePoTotals(linesWithTotals);
        await tx.purchaseOrder.update({ where: { id }, data: { total } });
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: {
          vendorId,
          orderDate: orderDate ? new Date(orderDate) : undefined,
        },
        include: this.includePo,
      });
    });
  }

  async confirmPurchaseOrder(id) {
    const po = await this.getPurchaseOrderById(id);
    if (po.status !== "DRAFT")
      throw new ApiError(409, "Only DRAFT purchase orders can be confirmed");

    return await prisma.purchaseOrder.update({
      where: { id },
      data: { status: "CONFIRMED" },
      include: this.includePo,
    });
  }

  buildLinesWithAutoAssign({
    lines,
    partnerId,
    partnerTags,
    productMap,
    autoModels,
    purchaseOrderId,
  }) {
    return lines.map((line) => {
      const product = productMap.get(line.productId);
      const autoAnalyticalId =
        line.analyticalAccountId ||
        resolveAnalyticalAccount({
          models: autoModels,
          partnerId,
          partnerTags: partnerTags || [],
          productId: line.productId,
          productCategory: product?.category || null,
        });

      return {
        purchaseOrderId,
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

  computePoTotals(lines) {
    return lines.reduce(
      (acc, line) => acc.plus(line.lineTotal),
      new Prisma.Decimal(0),
    );
  }
}

export const purchaseOrderService = new PurchaseOrderService();
