import { api } from "./api";

export type PurchaseStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface PurchaseOrderLine {
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

export interface PurchaseOrder {
    id: string;
    number: string;
    vendorId: string;
    orderDate: string;
    status: PurchaseStatus;
    total: number;
    createdAt: string;
    updatedAt: string;
    vendor?: {
        id: string;
        name: string;
        type: string;
    };
    lines: PurchaseOrderLine[];
    vendorBills?: Array<{
        id: string;
        number: string;
        status: string;
    }>;
}

export interface CreatePurchaseOrderLine {
    productId: string;
    quantity: number;
    unitPrice: number;
    analyticalAccountId?: string;
}

export interface CreatePurchaseOrderData {
    number: string;
    vendorId: string;
    orderDate: string;
    status?: PurchaseStatus;
    lines: CreatePurchaseOrderLine[];
}

export interface UpdatePurchaseOrderData {
    vendorId?: string;
    orderDate?: string;
    lines?: CreatePurchaseOrderLine[];
}

export const purchaseOrdersService = {
    async list(): Promise<PurchaseOrder[]> {
        const response = await api.get("/purchase-orders");
        return response.data.data;
    },

    async getById(id: string): Promise<PurchaseOrder> {
        const response = await api.get(`/purchase-orders/${id}`);
        return response.data.data;
    },

    async create(data: CreatePurchaseOrderData): Promise<PurchaseOrder> {
        const response = await api.post("/purchase-orders", data);
        return response.data.data;
    },

    async update(id: string, data: UpdatePurchaseOrderData): Promise<PurchaseOrder> {
        const response = await api.put(`/purchase-orders/${id}`, data);
        return response.data.data;
    },

    async confirm(id: string): Promise<PurchaseOrder> {
        const response = await api.post(`/purchase-orders/${id}/confirm`);
        return response.data.data;
    },
};
