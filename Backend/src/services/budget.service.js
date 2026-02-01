import pkg from "@prisma/client";
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

const { Prisma } = pkg;

class BudgetService {
  constructor() {
    this.includeBudget = {
      lines: true,
      analyticalAccount: true,
      revisions: {
        select: { id: true, version: true, status: true, createdAt: true },
      },
    };
  }

  async ensureAnalyticalAccount(analyticalAccountId) {
    if (!analyticalAccountId)
      throw new ApiError(400, "analyticalAccountId is required");
    const account = await prisma.analyticalAccount.findUnique({
      where: { id: analyticalAccountId },
    });
    if (!account) {
      throw new ApiError(400, "Analytical account not found");
    }
    return account;
  }

  async listBudgets(status) {
    return await prisma.budget.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      include: this.includeBudget,
    });
  }

  async getBudgetById(id) {
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: this.includeBudget,
    });
    if (!budget) throw new ApiError(404, "Budget not found");
    return budget;
  }

  async createBudget(data) {
    const { name, periodStart, periodEnd, analyticalAccountId, lines } = data;

    await this.ensureAnalyticalAccount(analyticalAccountId);

    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    if (start > end) {
      throw new ApiError(
        400,
        "periodStart must be before or equal to periodEnd",
      );
    }

    return await prisma.budget.create({
      data: {
        name,
        periodStart: start,
        periodEnd: end,
        analyticalAccountId,
        lines: {
          create: lines.map((line) => ({
            type: line.type,
            budgetedAmount: new Prisma.Decimal(line.budgetedAmount ?? "0"),
          })),
        },
      },
      include: this.includeBudget,
    });
  }

  async updateBudget(id, data) {
    const budget = await this.getBudgetById(id);

    if (budget.status !== "DRAFT") {
      throw new ApiError(409, "Only DRAFT budgets can be updated");
    }

    const { name, periodStart, periodEnd, analyticalAccountId, lines } = data;

    if (analyticalAccountId) {
      await this.ensureAnalyticalAccount(analyticalAccountId);
    }

    const startDate = periodStart ? new Date(periodStart) : budget.periodStart;
    const endDate = periodEnd ? new Date(periodEnd) : budget.periodEnd;
    if (startDate > endDate) {
      throw new ApiError(
        400,
        "periodStart must be before or equal to periodEnd",
      );
    }

    return await prisma.$transaction(async (tx) => {
      if (Array.isArray(lines)) {
        await tx.budgetLine.deleteMany({ where: { budgetId: id } });
        await tx.budgetLine.createMany({
          data: lines.map((line) => ({
            budgetId: id,
            type: line.type,
            budgetedAmount: new Prisma.Decimal(line.budgetedAmount ?? "0"),
          })),
        });
      }

      return tx.budget.update({
        where: { id },
        data: {
          name,
          periodStart: periodStart ? new Date(periodStart) : undefined,
          periodEnd: periodEnd ? new Date(periodEnd) : undefined,
          analyticalAccountId,
        },
        include: this.includeBudget,
      });
    });
  }

  async confirmBudget(id) {
    const budget = await this.getBudgetById(id);
    if (budget.status !== "DRAFT") {
      throw new ApiError(409, "Only DRAFT budgets can be confirmed");
    }

    return await prisma.budget.update({
      where: { id },
      data: { status: "CONFIRMED" },
      include: this.includeBudget,
    });
  }

  async archiveBudget(id) {
    await this.getBudgetById(id);
    return await prisma.budget.update({
      where: { id },
      data: { status: "ARCHIVED" },
      include: this.includeBudget,
    });
  }

  async reviseBudget(id, data) {
    const source = await this.getBudgetById(id);
    const { name, periodStart, periodEnd, analyticalAccountId, lines } = data;

    if (analyticalAccountId) {
      await this.ensureAnalyticalAccount(analyticalAccountId);
    }

    const startDate = periodStart ? new Date(periodStart) : source.periodStart;
    const endDate = periodEnd ? new Date(periodEnd) : source.periodEnd;
    if (startDate > endDate) {
      throw new ApiError(
        400,
        "periodStart must be before or equal to periodEnd",
      );
    }

    const rootRevisionId = source.revisionOfId || source.id;
    const newVersion = source.version + 1;

    return await prisma.$transaction(async (tx) => {
      await tx.budget.update({
        where: { id: source.id },
        data: { status: "REVISED" },
      });

      return tx.budget.create({
        data: {
          name: name || source.name,
          periodStart: startDate,
          periodEnd: endDate,
          analyticalAccountId:
            analyticalAccountId || source.analyticalAccountId,
          status: "CONFIRMED",
          version: newVersion,
          revisionOfId: rootRevisionId,
          lines: {
            create: lines.map((line) => ({
              type: line.type,
              budgetedAmount: new Prisma.Decimal(line.budgetedAmount ?? "0"),
            })),
          },
        },
        include: this.includeBudget,
      });
    });
  }

  // Helper logic for actuals
  eligibleBudgetWhere(analyticalAccountId, onDate) {
    return {
      analyticalAccountId,
      periodStart: { lte: onDate },
      periodEnd: { gte: onDate },
      status: { in: ["CONFIRMED", "REVISED"] },
    };
  }

  async applyExpenseActual({ analyticalAccountId, onDate, amount }) {
    if (!analyticalAccountId || !amount) return;
    const date = new Date(onDate);

    const budget = await prisma.budget.findFirst({
      where: this.eligibleBudgetWhere(analyticalAccountId, date),
      orderBy: [{ version: "desc" }, { createdAt: "desc" }],
      include: { lines: true },
    });

    if (!budget) return;

    const expenseLine = budget.lines.find((l) => l.type === "EXPENSE");
    if (!expenseLine) return;

    await prisma.budgetLine.update({
      where: { id: expenseLine.id },
      data: {
        actualAmount: new Prisma.Decimal(expenseLine.actualAmount).plus(amount),
      },
    });
  }

  async applyIncomeActual({ analyticalAccountId, onDate, amount }) {
    if (!analyticalAccountId || !amount) return;
    const date = new Date(onDate);

    const budget = await prisma.budget.findFirst({
      where: this.eligibleBudgetWhere(analyticalAccountId, date),
      orderBy: [{ version: "desc" }, { createdAt: "desc" }],
      include: { lines: true },
    });

    if (!budget) return;

    const incomeLine = budget.lines.find((l) => l.type === "INCOME");
    if (!incomeLine) return;

    await prisma.budgetLine.update({
      where: { id: incomeLine.id },
      data: {
        actualAmount: new Prisma.Decimal(incomeLine.actualAmount).plus(amount),
      },
    });
  }
}

export const budgetService = new BudgetService();
export const applyExpenseActual =
  budgetService.applyExpenseActual.bind(budgetService);
export const applyIncomeActual =
  budgetService.applyIncomeActual.bind(budgetService);
