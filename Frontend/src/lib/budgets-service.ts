import { api } from "./api";

export type BudgetStatus = "DRAFT" | "CONFIRMED" | "REVISED" | "ARCHIVED";
export type BudgetLineType = "INCOME" | "EXPENSE";

export interface BudgetLine {
    id: string;
    type: BudgetLineType;
    budgetedAmount: number;
    actualAmount: number;
}

export interface Budget {
    id: string;
    name: string;
    periodStart: string;
    periodEnd: string;
    status: BudgetStatus;
    analyticalAccountId: string;
    version: number;
    revisionOfId?: string;
    createdAt: string;
    updatedAt: string;
    lines: BudgetLine[];
    analyticalAccount?: {
        id: string;
        name: string;
        type: string;
    };
    revisions?: Array<{
        id: string;
        version: number;
        status: BudgetStatus;
        createdAt: string;
    }>;
}

export interface CreateBudgetData {
    name: string;
    periodStart: string;
    periodEnd: string;
    analyticalAccountId: string;
    lines: Array<{
        type: BudgetLineType;
        budgetedAmount: number;
    }>;
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {
    status?: BudgetStatus;
}

export const budgetsService = {
    async list(status?: BudgetStatus): Promise<Budget[]> {
        const response = await api.get("/budgets", {
            params: status ? { status } : undefined,
        });
        return response.data.data;
    },

    async getById(id: string): Promise<Budget> {
        const response = await api.get(`/budgets/${id}`);
        return response.data.data;
    },

    async create(data: CreateBudgetData): Promise<Budget> {
        const response = await api.post("/budgets", data);
        return response.data.data;
    },

    async update(id: string, data: UpdateBudgetData): Promise<Budget> {
        const response = await api.put(`/budgets/${id}`, data);
        return response.data.data;
    },

    async confirm(id: string): Promise<Budget> {
        const response = await api.post(`/budgets/${id}/confirm`);
        return response.data.data;
    },

    async archive(id: string): Promise<Budget> {
        const response = await api.post(`/budgets/${id}/archive`);
        return response.data.data;
    },

    async revise(id: string, data: CreateBudgetData): Promise<Budget> {
        const response = await api.post(`/budgets/${id}/revise`, data);
        return response.data.data;
    },
};
