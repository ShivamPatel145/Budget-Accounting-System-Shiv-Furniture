import { prisma } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const { period = "month" } = req.query;

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

  // Calculate percentage changes
  const incomeChange =
    previousIncome > 0
      ? (((totalIncome - previousIncome) / previousIncome) * 100).toFixed(1)
      : totalIncome > 0
        ? "100.0"
        : "0.0";

  const expenseChange =
    previousExpense > 0
      ? (((totalExpense - previousExpense) / previousExpense) * 100).toFixed(1)
      : totalExpense > 0
        ? "100.0"
        : "0.0";

  const netBalance = totalIncome - totalExpense;
  const previousNetBalance = previousIncome - previousExpense;
  const balanceChange =
    previousNetBalance !== 0
      ? (
          ((netBalance - previousNetBalance) / Math.abs(previousNetBalance)) *
          100
        ).toFixed(1)
      : netBalance > 0
        ? "100.0"
        : "0.0";

  // 3. Active Budgets
  const activeBudgetsCount = await prisma.budget.count({
    where: { status: { in: ["CONFIRMED", "REVISED"] } },
  });

  // Budget utilization
  const budgetAgg = await prisma.budgetLine.aggregate({
    _sum: { budgetedAmount: true, actualAmount: true },
  });
  const totalBudgeted = Number(budgetAgg._sum.budgetedAmount) || 0;
  const totalActual = Number(budgetAgg._sum.actualAmount) || 0;
  const budgetUtilization =
    totalBudgeted > 0 ? Math.round((totalActual / totalBudgeted) * 100) : 0;

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
      totalIncome,
      totalExpense,
      netBalance,
      incomeChange: parseFloat(incomeChange),
      expenseChange: parseFloat(expenseChange),
      balanceChange: parseFloat(balanceChange),
      activeBudgetsCount,
      budgetUtilization,
      period,
      currentPeriod: { start: currentStart, end: currentEnd },
      recentInvoices,
      recentBills,
    }),
  );
});
