import { prisma } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getBudgetInsights = asyncHandler(async (req, res) => {
  // Heuristic: Find budgets where actual > 80% of budgeted (Warning) or > 100% (Critical)
  const budgets = await prisma.budget.findMany({
    where: { status: { in: ["CONFIRMED", "REVISED"] } },
    include: { lines: true, analyticalAccount: true },
  });

  const insights = budgets
    .map((b) => {
      const expenseLine = b.lines.find((l) => l.type === "EXPENSE");
      if (!expenseLine) return null;

      const budgeted = Number(expenseLine.budgetedAmount);
      const actual = Number(expenseLine.actualAmount);
      const usage = budgeted > 0 ? (actual / budgeted) * 100 : 0;

      if (usage > 80) {
        return {
          budgetId: b.id,
          analyticalAccount: b.analyticalAccount.name,
          usage: `${usage.toFixed(2)}%`,
          severity: usage > 100 ? "CRITICAL" : "WARNING",
          message:
            usage > 100
              ? `Budget exceeded by ${(actual - budgeted).toFixed(2)}`
              : `Budget nearing limit (remaining: ${(budgeted - actual).toFixed(2)})`,
        };
      }
      return null;
    })
    .filter(Boolean);

  res.json(new ApiResponse(200, insights));
});

export const getAnomalies = asyncHandler(async (req, res) => {
  // Heuristic: Find transactions > 3x average of last 50 transactions
  const bills = await prisma.vendorBill.findMany({
    where: { status: "CONFIRMED" },
    select: { total: true, id: true, number: true },
    take: 50,
  });

  if (bills.length === 0) return res.json(new ApiResponse(200, []));

  const totalSum = bills.reduce((acc, b) => acc + Number(b.total), 0);
  const avg = totalSum / bills.length;
  const threshold = avg * 3;

  const anomalies = bills
    .filter((b) => Number(b.total) > threshold)
    .map((b) => ({
      id: b.id,
      number: b.number,
      amount: b.total,
      reason: `Amount is significantly higher than average (${avg.toFixed(2)})`,
    }));

  res.json(new ApiResponse(200, anomalies));
});
