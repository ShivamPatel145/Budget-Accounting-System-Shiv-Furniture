import { api } from "./api";

export interface BudgetInsight {
    budgetId: string;
    analyticalAccount: string;
    usage: string;
    severity: "CRITICAL" | "WARNING";
    message: string;
}

export interface Anomaly {
    id: string;
    number: string;
    amount: number;
    reason: string;
}

export const aiService = {
    async getInsights(): Promise<BudgetInsight[]> {
        const response = await api.get("/ai/insights");
        return response.data.data;
    },

    async getAnomalies(): Promise<Anomaly[]> {
        const response = await api.get("/ai/anomalies");
        return response.data.data;
    },
};
