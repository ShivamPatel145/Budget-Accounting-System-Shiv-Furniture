import { api } from "./api";

export type SalesStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface SalesOrderLine {
    id: string;
    productId: string;
    analyticalAccountId?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    autoAssigned: boolean;
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

export interface SalesOrder {
    id: string;
    number: string;
    customerId: string;
    orderDate: string;
    status: SalesStatus;
    total: number;
    createdAt: string;
    updatedAt: string;
    customer?: {
        id: string;
        name: string;
        type: string;
    };
    lines: SalesOrderLine[];
    invoices?: Array<{
        id: string;
        number: string;
        status: string;
    }>;
}

export interface CreateSalesOrderLine {
    productId: string;
    quantity: number;
    unitPrice: number;
    analyticalAccountId?: string;
}

export interface CreateSalesOrderData {
    number: string;
    customerId: string;
    orderDate: string;
    status?: SalesStatus;
    lines: CreateSalesOrderLine[];
}

export interface UpdateSalesOrderData {
    customerId?: string;
    orderDate?: string;
    lines?: CreateSalesOrderLine[];
}

export const salesOrdersService = {
    async list(): Promise<SalesOrder[]> {
        const response = await api.get("/sales-orders");
        return response.data.data;
    },

    async getById(id: string): Promise<SalesOrder> {
        const response = await api.get(`/sales-orders/${id}`);
        return response.data.data;
    },

    async create(data: CreateSalesOrderData): Promise<SalesOrder> {
        const response = await api.post("/sales-orders", data);
        return response.data.data;
    },

    async update(id: string, data: UpdateSalesOrderData): Promise<SalesOrder> {
        const response = await api.put(`/sales-orders/${id}`, data);
        return response.data.data;
    },

    async confirm(id: string): Promise<SalesOrder> {
        const response = await api.post(`/sales-orders/${id}/confirm`);
        return response.data.data;
    },
};
