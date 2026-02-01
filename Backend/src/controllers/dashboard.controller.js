import { prisma } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const { period = "month" } = req.query;

  const aggregateBudgetTotals = async (start, end) => {
    const where = {
      status: { in: ["CONFIRMED", "REVISED"] },
    };

    if (start && end) {
      where.periodStart = { lte: end };
      where.periodEnd = { gte: start };
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: { lines: true },
    });

    let incomeActual = 0;
    let incomeBudgeted = 0;
    let expenseActual = 0;
    let expenseBudgeted = 0;

    budgets.forEach((budget) => {
      budget.lines.forEach((line) => {
        if (line.type === "INCOME") {
          incomeActual += Number(line.actualAmount ?? 0);
          incomeBudgeted += Number(line.budgetedAmount ?? 0);
        } else {
          expenseActual += Number(line.actualAmount ?? 0);
          expenseBudgeted += Number(line.budgetedAmount ?? 0);
        }
      });
    });

    return {
      incomeActual,
      incomeBudgeted,
      expenseActual,
      expenseBudgeted,
      count: budgets.length,
    };
  };

  // Calculate date ranges based on period
  const now = new Date();
  let currentStart, currentEnd, previousStart, previousEnd;

  switch (period) {
    case "week":
      currentStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7,
      );
      currentEnd = now;
      previousStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 14,
      );
      previousEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7,
      );
      break;
    case "month":
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      currentEnd = now;
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case "quarter":
      const currentQuarter = Math.floor(now.getMonth() / 3);
      currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
      currentEnd = now;
      previousStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
      previousEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
      break;
    case "year":
      currentStart = new Date(now.getFullYear(), 0, 1);
      currentEnd = now;
      previousStart = new Date(now.getFullYear() - 1, 0, 1);
      previousEnd = new Date(now.getFullYear() - 1, 11, 31);
      break;
    default: // all time
      currentStart = new Date(2000, 0, 1);
      currentEnd = now;
      previousStart = null;
      previousEnd = null;
  }

  // 1. Current Period Total Income (Invoices confirmed/paid)
  const totalIncomeAgg = await prisma.customerInvoice.aggregate({
    _sum: { total: true },
    where: {
      status: { in: ["CONFIRMED", "PAID", "PARTIAL"] },
      invoiceDate: { gte: currentStart, lte: currentEnd },
    },
  });
  const totalIncome = Number(totalIncomeAgg._sum.total) || 0;

  // Previous Period Income
  let previousIncome = 0;
  if (previousStart) {
    const prevIncomeAgg = await prisma.customerInvoice.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["CONFIRMED", "PAID", "PARTIAL"] },
        invoiceDate: { gte: previousStart, lte: previousEnd },
      },
    });
    previousIncome = Number(prevIncomeAgg._sum.total) || 0;
  }

  // 2. Current Period Total Expenses (Bills confirmed/paid)
  const totalExpenseAgg = await prisma.vendorBill.aggregate({
    _sum: { total: true },
    where: {
      status: { in: ["CONFIRMED", "PAID", "PARTIAL"] },
      billDate: { gte: currentStart, lte: currentEnd },
    },
  });
  const totalExpense = Number(totalExpenseAgg._sum.total) || 0;

  // Previous Period Expenses
  let previousExpense = 0;
  if (previousStart) {
    const prevExpenseAgg = await prisma.vendorBill.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["CONFIRMED", "PAID", "PARTIAL"] },
        billDate: { gte: previousStart, lte: previousEnd },
      },
    });
    previousExpense = Number(prevExpenseAgg._sum.total) || 0;
  }

  const currentBudgetAgg = await aggregateBudgetTotals(currentStart, currentEnd);
  const previousBudgetAgg = previousStart
    ? await aggregateBudgetTotals(previousStart, previousEnd)
    : {
        incomeActual: 0,
        incomeBudgeted: 0,
        expenseActual: 0,
        expenseBudgeted: 0,
        count: 0,
      };

  const effectiveIncome =
    totalIncome || currentBudgetAgg.incomeActual || currentBudgetAgg.incomeBudgeted;
  const effectiveExpense =
    totalExpense ||
    currentBudgetAgg.expenseActual ||
    currentBudgetAgg.expenseBudgeted;

  const effectivePreviousIncome =
    previousIncome ||
    previousBudgetAgg.incomeActual ||
    previousBudgetAgg.incomeBudgeted;
  const effectivePreviousExpense =
    previousExpense ||
    previousBudgetAgg.expenseActual ||
    previousBudgetAgg.expenseBudgeted;

  const percentChange = (current, previous) => {
    if (previous > 0) {
      return parseFloat((((current - previous) / previous) * 100).toFixed(1));
    }
    if (current > 0) {
      return 100.0;
    }
    return 0.0;
  };

  // Calculate percentage changes
  const incomeChange = percentChange(effectiveIncome, effectivePreviousIncome);

  const expenseChange = percentChange(effectiveExpense, effectivePreviousExpense);

  const netBalance = effectiveIncome - effectiveExpense;
  const previousNetBalance =
    effectivePreviousIncome - effectivePreviousExpense;
  const balanceChange =
    previousNetBalance !== 0
      ? parseFloat(
          (
            ((netBalance - previousNetBalance) /
              Math.abs(previousNetBalance)) *
            100
          ).toFixed(1),
        )
      : netBalance > 0
        ? 100.0
        : 0.0;

  // 3. Active Budgets
  const activeBudgetsCount = currentBudgetAgg.count;

  // Budget utilization scoped to active budgets in the selected period
  const budgetUtilization =
    currentBudgetAgg.expenseBudgeted > 0
      ? Math.round(
          (currentBudgetAgg.expenseActual / currentBudgetAgg.expenseBudgeted) *
            100,
        )
      : 0;

  // 4. Recent Transactions (Combined PO and SO for simplicity or just Invoices/Bills)
  const recentInvoices = await prisma.customerInvoice.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } } },
  });

  const recentBills = await prisma.vendorBill.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { vendor: { select: { name: true } } },
  });

  res.json(
    new ApiResponse(200, {
      totalIncome: effectiveIncome,
      totalExpense: effectiveExpense,
      netBalance,
      incomeChange,
      expenseChange,
      balanceChange,
      activeBudgetsCount,
      budgetUtilization,
      period,
      currentPeriod: { start: currentStart, end: currentEnd },
      recentInvoices,
      recentBills,
    }),
  );
});
