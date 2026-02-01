import { api } from "./api";

export type AnalyticalType = "DEPARTMENT" | "SESSION" | "EVENT" | "PROJECT" | "OTHER";

export interface AnalyticalAccount {
    id: string;
    name: string;
    type: AnalyticalType;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAnalyticalAccountData {
    name: string;
    type: AnalyticalType;
}

export interface UpdateAnalyticalAccountData extends Partial<CreateAnalyticalAccountData> { }

export const analyticalService = {
    async list(): Promise<AnalyticalAccount[]> {
        const response = await api.get("/analytical-accounts");
        return response.data.data;
    },

    async getById(id: string): Promise<AnalyticalAccount> {
        const response = await api.get(`/analytical-accounts/${id}`);
        return response.data.data;
    },

    async create(data: CreateAnalyticalAccountData): Promise<AnalyticalAccount> {
        const response = await api.post("/analytical-accounts", data);
        return response.data.data;
    },

    async update(id: string, data: UpdateAnalyticalAccountData): Promise<AnalyticalAccount> {
        const response = await api.put(`/analytical-accounts/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/analytical-accounts/${id}`);
    },
};
