import { prisma } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { aiService } from "../services/ai.service.js";

export const getBudgetInsights = asyncHandler(async (req, res) => {
  const budgets = await prisma.budget.findMany({
    where: { status: { in: ["CONFIRMED", "REVISED"] } },
    include: { lines: true, analyticalAccount: true },
  });

  const insights = await aiService.generateBudgetInsights(budgets);
  res.json(new ApiResponse(200, insights));
});

export const getAnomalies = asyncHandler(async (req, res) => {
  const bills = await prisma.vendorBill.findMany({
    where: { status: "CONFIRMED" },
    select: { total: true, id: true, number: true },
    take: 50, // Analyze last 50 bills
  });

  const anomalies = await aiService.detectAnomalies(bills);
  res.json(new ApiResponse(200, anomalies));
});

export const getPredictions = asyncHandler(async (req, res) => {
  // 1. Fetch historical monthly expense data (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const expenses = await prisma.vendorBill.findMany({
    where: {
      status: { in: ["CONFIRMED", "PAID", "PARTIAL"] },
      billDate: { gte: sixMonthsAgo },
    },
    select: { billDate: true, total: true },
    orderBy: { billDate: "asc" },
  });

  // Group by month
  const monthlyExpenses = expenses.reduce((acc, bill) => {
    const month = new Date(bill.billDate).toLocaleString("en-US", {
      month: "short",
    });
    acc[month] = (acc[month] || 0) + Number(bill.total);
    return acc;
  }, {});

  console.log("[DEBUG] getPredictions - Raw Expenses Count:", expenses.length);
  console.log("[DEBUG] getPredictions - Monthly Expenses:", JSON.stringify(monthlyExpenses));

  const predictions = await aiService.generatePredictions(monthlyExpenses);
  res.json(new ApiResponse(200, predictions));
});

export const getEfficiencyTrend = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // 1. Fetch Expenses (Bills)
  const bills = await prisma.vendorBill.findMany({
    where: {
      status: { in: ["CONFIRMED", "PAID", "PARTIAL"] },
      billDate: { gte: sixMonthsAgo },
    },
    select: { billDate: true, total: true },
  });

  // 2. Fetch Income (Invoices)
  const invoices = await prisma.customerInvoice.findMany({
    where: {
      status: { in: ["CONFIRMED", "PAID", "PARTIAL"] },
      invoiceDate: { gte: sixMonthsAgo },
    },
    select: { invoiceDate: true, total: true },
  });

  // 3. Aggregate by Month
  const monthlyData = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Initialize last 6 months to ensure continuity
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.toLocaleString("en-US", { month: "short" });
    monthlyData[m] = { expense: 0, income: 0, month: m };
  }

  // Sum Expenses
  bills.forEach(b => {
    const m = new Date(b.billDate).toLocaleString("en-US", { month: "short" });
    if (monthlyData[m]) monthlyData[m].expense += Number(b.total);
  });

  // Sum Income
  invoices.forEach(i => {
    const m = new Date(i.invoiceDate).toLocaleString("en-US", { month: "short" });
    if (monthlyData[m]) monthlyData[m].income += Number(i.total);
  });

  // 4. Calculate Efficiency
  const trends = Object.values(monthlyData).map(d => {
    const profit = d.income - d.expense;
    let efficiency = 0;

    if (d.income > 0) {
      // Efficiency = Profit Margin %
      efficiency = (profit / d.income) * 100;
    } else if (d.expense === 0) {
      // No income, no expense -> Neutral efficiency? Or 0?
      efficiency = 0;
    } else {
      // Expense but no income -> Negative efficiency (capped at -100 for chart readability?)
      // Let's keep it raw but maybe cap visible range in frontend
      efficiency = -100;
    }

    return {
      month: d.month,
      cost: d.expense,
      efficiency: Math.round(efficiency),
      income: d.income // Optional, useful for debug
    };
  });

  // Sort chronologically? Object.values might not guarantee order, but our init loop did.
  // Ideally, re-sort based on our 6-month window logic if needed, but the loop was chronological.

  res.json(new ApiResponse(200, trends));
});
