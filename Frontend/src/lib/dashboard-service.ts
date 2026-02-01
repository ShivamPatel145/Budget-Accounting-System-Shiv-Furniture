import { api } from "./api";

export interface DashboardStats {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    incomeChange: number;
    expenseChange: number;
    balanceChange: number;
    activeBudgetsCount: number;
    budgetUtilization: number;
    period: string;
    currentPeriod: {
        start: string;
        end: string;
    };
    recentInvoices: Array<{
        id: string;
        number: string;
        total: number;
        status: string;
        invoiceDate: string;
        customer: {
            name: string;
        };
    }>;
    recentBills: Array<{
        id: string;
        number: string;
        total: number;
        status: string;
        billDate: string;
        vendor: {
            name: string;
        };
    }>;
}

export interface Alert {
    id: string;
    type: "warning" | "error" | "info" | "success";
    title: string;
    description: string;
    time: string;
}

export interface Transaction {
    id: string;
    type: "income" | "expense";
    description: string;
    party: string;
    amount: number;
    date: string;
    status: "completed" | "pending" | "failed";
    costCenter?: string;
}

export type DashboardPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

export const dashboardService = {
    async getStats(period: DashboardPeriod = 'month'): Promise<DashboardStats> {
        const response = await api.get(`/dashboard/stats?period=${period}`);
        return response.data.data;
    },
};
