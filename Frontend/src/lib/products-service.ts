import { api } from "./api";

export interface Product {
    id: string;
    name: string;
    category?: string;
    salesPrice: number;
    purchasePrice: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductData {
    name: string;
    category?: string;
    salesPrice: number;
    purchasePrice: number;
}

export interface UpdateProductData extends Partial<CreateProductData> { }

export const productsService = {
    async list(): Promise<Product[]> {
        const response = await api.get("/products");
        return response.data.data;
    },

    async getById(id: string): Promise<Product> {
        const response = await api.get(`/products/${id}`);
        return response.data.data;
    },

    async create(data: CreateProductData): Promise<Product> {
        const response = await api.post("/products", data);
        return response.data.data;
    },

    async update(id: string, data: UpdateProductData): Promise<Product> {
        const response = await api.put(`/products/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/products/${id}`);
    },
};
