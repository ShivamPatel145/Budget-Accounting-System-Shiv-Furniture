import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

// Initialize Gemini if key exists
const genAI = env.geminiApiKey
    ? new GoogleGenerativeAI(env.geminiApiKey)
    : null;

export const aiService = {
    /**
     * Generates insights using Gemini or falls back to stats
     */
    async generateBudgetInsights(budgets) {
        // Debug API Key loading
        const key = env.geminiApiKey || "";
        logger.info(`[DEBUG] Loaded Gemini Key: ${key.substring(0, 10)}... (Length: ${key.length})`);

        // 1. Prepare Data for AI
        const budgetSummary = budgets
            .map((b) => {
                const expense = b.lines.find((l) => l.type === "EXPENSE");
                if (!expense) return null;
                const budgeted = Number(expense.budgetedAmount);
                const actual = Number(expense.actualAmount);
                const usage = budgeted > 0 ? (actual / budgeted) * 100 : 0;
                return {
                    id: b.id,
                    name: b.analyticalAccount.name,
                    budgeted,
                    actual,
                    usage,
                };
            })
            .filter(Boolean);

        // 2. Try Gemini if available
        if (genAI && env.geminiApiKey) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `
          Analyze these budget records JSON: ${JSON.stringify(budgetSummary)}
          
          Identify top 3 critical or warning items.
          Rules:
          - Usage > 100% is CRITICAL.
          - Usage > 80% is WARNING.
          - Usage < 50% is GOOD/OPPORTUNITY.
          
          Return ONLY a JSON array with this schema:
          [{
            "budgetId": "id_from_input",
            "analyticalAccount": "name_from_input",
            "usage": "percentage_string",
            "severity": "CRITICAL|WARNING|INFO",
            "message": "Start with key insight, be professional"
          }]
          Do not include markdown formatting.
        `;

                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                // Clean markdown if present
                const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
                return JSON.parse(jsonStr);
            } catch (error) {
                logger.error(`Gemini API Error: ${error.message || error}`, error);
            }
        }

        // 3. Fallback: Local Statistical Analysis (Real Data)
        return budgetSummary
            .map((b) => {
                if (b.usage > 80) {
                    return {
                        budgetId: b.id,
                        analyticalAccount: b.name,
                        usage: `${b.usage.toFixed(2)}%`,
                        severity: b.usage > 100 ? "CRITICAL" : "WARNING",
                        message: b.usage > 100
                            ? `Budget exceeded by ${(b.actual - b.budgeted).toFixed(2)}`
                            : `Budget nearing limit (remaining: ${(b.budgeted - b.actual).toFixed(2)})`,
                    };
                }
                return null;
            })
            .filter(Boolean);
    },

    /**
     * Detects anomalies using Gemini or falls back to stats
     */
    async detectAnomalies(bills) {
        if (bills.length === 0) return [];

        // 1. Prepare Data
        const billSummary = bills.map(b => ({
            id: b.id,
            number: b.number,
            amount: Number(b.total)
        }));

        // 2. Try Gemini
        if (genAI && env.geminiApiKey) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `
          Analyze these vendor bills JSON: ${JSON.stringify(billSummary)}
          
          Find outliers/anomalies based on amount.
          Return ONLY a JSON array:
          [{
            "id": "id",
            "number": "number",
            "amount": number,
            "reason": "Why is this an anomaly?"
          }]
        `;

                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
                return JSON.parse(jsonStr);
            } catch (error) {
                logger.error(`Gemini API Error: ${error.message || error}`, error);
            }
        }

        // 3. Fallback: Statistical Outliers (Z-score inspired)
        const totalSum = billSummary.reduce((acc, b) => acc + b.amount, 0);
        const avg = totalSum / billSummary.length;
        const threshold = avg * 2.5; // Stricter than 3x for more sensitivity

        return billSummary
            .filter(b => b.amount > threshold)
            .map(b => ({
                id: b.id,
                number: b.number,
                amount: b.amount,
                reason: `High value transaction: ${(b.amount / avg).toFixed(1)}x above average`
            }));


    },

    /**
     * Forecasts future spending using Gemini or Linear Regression
     */
    /**
     * Forecasts future spending using Gemini or Linear Regression
     */
    async generatePredictions(monthlyExpenses) {
        // 1. Prepare continuous 6-month historical data (filling 0s for missing months)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const today = new Date();
        const historicalData = [];

        // Generate last 6 months (chronological)
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = monthNames[d.getMonth()];
            historicalData.push({
                month: monthName,
                amount: Number(monthlyExpenses[monthName] || 0)
            });
        }

        const nonEmptyData = historicalData.filter(d => d.amount > 0);

        // 2. Try Gemini (only if we have SOME data, otherwise prompt might be confused)
        // actually Gemini can handle 0s, but let's be efficient.
        if (genAI && env.geminiApiKey && nonEmptyData.length > 0) {
            try {
                // Use the faster, newer model
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `
          Analyze this monthly expense series JSON: ${JSON.stringify(historicalData)}
          
          Predict the total expense for the next 3 months.
          Return ONLY a JSON array with this schema:
          [{
            "month": "Month Name",
            "predicted": number,
            "confidence": number_0_to_100
          }]
          Do not include markdown.
        `;

                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();
                const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
                const predictions = JSON.parse(jsonStr);

                // Merge historical and predicted
                return [
                    ...historicalData.map(d => ({ month: d.month, actual: d.amount, predicted: null })),
                    ...predictions.map(p => ({ month: p.month, actual: null, predicted: p.predicted }))
                ];
            } catch (error) {
                // Log full error details for debugging
                logger.error(`Gemini Prediction Error: ${error.message || error}`, error);
                // Fallthrough to stats
            }
        }

        // 3. Fallback: Linear Regression (y = mx + c)
        const n = historicalData.length; // Always 6 now
        const x = Array.from({ length: n }, (_, i) => i);
        const y = historicalData.map(d => d.amount);

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
        const sumXX = x.reduce((acc, val) => acc + val * val, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Create predictions for next 3 months
        const nextMonths = [];
        // Start from next month index relative to our 6-month window
        // our x indices are 0..5. Next is 6, 7, 8.

        for (let i = 1; i <= 3; i++) {
            const nextIdx = (n - 1) + i; // 6, 7, 8
            const predictedAmount = slope * nextIdx + intercept;

            // Calculate next month name
            const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const nextMonthName = monthNames[d.getMonth()];

            nextMonths.push({
                month: nextMonthName,
                actual: null,
                predicted: Math.max(0, predictedAmount),
                confidence: 85 - (i * 10)
            });
        }

        return [
            ...historicalData.map(d => ({ month: d.month, actual: d.amount, predicted: null })),
            ...nextMonths
        ];
    }
};
