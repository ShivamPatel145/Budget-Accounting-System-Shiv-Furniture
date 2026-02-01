import { api } from "./api";

export interface AutoAnalyticalModel {
    id: string;
    name: string;
    partnerId?: string;
    partnerTag?: string;
    productId?: string;
    productCategory?: string;
    analyticalAccountId: string;
    priority: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    partner?: {
        id: string;
        name: string;
        type: string;
    };
    product?: {
        id: string;
        name: string;
        category?: string;
    };
    analyticalAccount?: {
        id: string;
        name: string;
        type: string;
    };
}

export interface CreateAutoModelData {
    name: string;
    partnerId?: string;
    partnerTag?: string;
    productId?: string;
    productCategory?: string;
    analyticalAccountId: string;
    priority?: number;
    active?: boolean;
}

export interface UpdateAutoModelData extends Partial<CreateAutoModelData> {}

export const autoModelsService = {
    async list(): Promise<AutoAnalyticalModel[]> {
        const response = await api.get("/auto-analytical-models");
        return response.data.data;
    },

    async getById(id: string): Promise<AutoAnalyticalModel> {
        const response = await api.get(`/auto-analytical-models/${id}`);
        return response.data.data;
    },

    async create(data: CreateAutoModelData): Promise<AutoAnalyticalModel> {
        const response = await api.post("/auto-analytical-models", data);
        return response.data.data;
    },

    async update(id: string, data: UpdateAutoModelData): Promise<AutoAnalyticalModel> {
        const response = await api.put(`/auto-analytical-models/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/auto-analytical-models/${id}`);
    },
};
