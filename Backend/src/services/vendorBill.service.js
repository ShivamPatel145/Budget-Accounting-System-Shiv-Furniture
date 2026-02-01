import pkg from "@prisma/client";
const { Prisma } = pkg;
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import {
  loadActiveAutoModels,
  resolveAnalyticalAccount,
} from "./autoAnalytical.service.js";
import { applyExpenseActual } from "./budget.service.js";

class VendorBillService {
  constructor() {
    this.includeBill = {
      vendor: true,
      purchaseOrder: true,
      lines: { include: { product: true, analyticalAccount: true } },
      payments: true,
    };
  }

  async listVendorBills(user) {
    let where = {};
    if (user && user.role === "PORTAL") {
      const contact = await prisma.contact.findUnique({
        where: { portalUserId: user.id },
      });
      if (!contact) return [];
      where = { vendorId: contact.id };
    }
    return await prisma.vendorBill.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: this.includeBill,
    });
  }

  async getVendorBillById(id) {
    const bill = await prisma.vendorBill.findUnique({
      where: { id },
      include: this.includeBill,
    });
    if (!bill) throw new ApiError(404, "Vendor bill not found");
    return bill;
  }

  async createVendorBill(data) {
    const {
      number,
      vendorId,
      billDate,
      dueDate,
      purchaseOrderId,
      lines,
      status = "DRAFT",
    } = data;

    const vendor = await prisma.contact.findUnique({ where: { id: vendorId } });
    if (!vendor) throw new ApiError(404, "Vendor not found");

    if (purchaseOrderId) {
      const po = await prisma.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
      });
      if (!po) throw new ApiError(400, "Linked purchase order not found");
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
          partnerId: vendorId,
          partnerTags: vendor.tags || [],
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

    return await prisma.vendorBill.create({
      data: {
        number,
        vendorId,
        billDate: new Date(billDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        purchaseOrderId,
        status,
        total,
        amountDue: total,
        lines: { create: linesWithTotals },
      },
      include: this.includeBill,
    });
  }

  async updateVendorBill(id, data) {
    const bill = await this.getVendorBillById(id);
    if (bill.status !== "DRAFT")
      throw new ApiError(409, "Only DRAFT vendor bills can be updated");

    const { vendorId, billDate, dueDate, lines, purchaseOrderId } = data;
    let vendor = bill.vendor;

    if (vendorId) {
      vendor = await prisma.contact.findUnique({ where: { id: vendorId } });
      if (!vendor) throw new ApiError(404, "Vendor not found");
    }

    if (purchaseOrderId) {
      const po = await prisma.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
      });
      if (!po) throw new ApiError(400, "Linked purchase order not found");
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
        await tx.vendorBillLine.deleteMany({ where: { vendorBillId: id } });
        const linesWithTotals = lines.map((line) => {
          const product = productMap.get(line.productId);
          const autoAnalyticalId =
            line.analyticalAccountId ||
            resolveAnalyticalAccount({
              models: autoModels,
              partnerId: vendor.id,
              partnerTags: vendor.tags || [],
              productId: line.productId,
              productCategory: product?.category || null,
            });

          return {
            vendorBillId: id,
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
        await tx.vendorBillLine.createMany({ data: linesWithTotals });
        const total = linesWithTotals.reduce(
          (acc, l) => acc.plus(l.lineTotal),
          new Prisma.Decimal(0),
        );
        await tx.vendorBill.update({
          where: { id },
          data: { total, amountDue: total },
        });
      }

      return tx.vendorBill.update({
        where: { id },
        data: {
          vendorId,
          purchaseOrderId,
          billDate: billDate ? new Date(billDate) : undefined,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        },
        include: this.includeBill,
      });
    });
  }

  async confirmVendorBill(id) {
    const bill = await this.getVendorBillById(id);
    if (bill.status !== "DRAFT")
      throw new ApiError(409, "Only DRAFT vendor bills can be confirmed");

    return await prisma.$transaction(async (tx) => {
      const confirmed = await tx.vendorBill.update({
        where: { id },
        data: { status: "CONFIRMED" },
        include: this.includeBill,
      });

      for (const line of bill.lines) {
        if (line.analyticalAccountId) {
          await applyExpenseActual({
            analyticalAccountId: line.analyticalAccountId,
            onDate: bill.billDate,
            amount: line.lineTotal,
          });
        }
      }
      return confirmed;
    });
  }
}

export const vendorBillService = new VendorBillService();
