import { api } from "./api";

export type BillStatus = "DRAFT" | "CONFIRMED" | "PARTIAL" | "PAID" | "CANCELLED";

export interface VendorBillLine {
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

export interface VendorBill {
    id: string;
    number: string;
    vendorId: string;
    purchaseOrderId?: string;
    billDate: string;
    dueDate?: string;
    status: BillStatus;
    total: number;
    amountDue: number;
    createdAt: string;
    updatedAt: string;
    vendor?: {
        id: string;
        name: string;
        type: string;
    };
    purchaseOrder?: {
        id: string;
        number: string;
    };
    lines: VendorBillLine[];
    payments?: Array<{
        id: string;
        number: string;
        amount: number;
        status: string;
    }>;
}

export interface CreateVendorBillLine {
    productId: string;
    quantity: number;
    unitPrice: number;
    analyticalAccountId?: string;
}

export interface CreateVendorBillData {
    number: string;
    vendorId: string;
    billDate: string;
    dueDate?: string;
    purchaseOrderId?: string;
    status?: BillStatus;
    lines: CreateVendorBillLine[];
}

export interface UpdateVendorBillData {
    vendorId?: string;
    billDate?: string;
    dueDate?: string;
    purchaseOrderId?: string;
    lines?: CreateVendorBillLine[];
}

export const vendorBillsService = {
    async list(): Promise<VendorBill[]> {
        const response = await api.get("/vendor-bills");
        return response.data.data;
    },

    async getById(id: string): Promise<VendorBill> {
        const response = await api.get(`/vendor-bills/${id}`);
        return response.data.data;
    },

    async create(data: CreateVendorBillData): Promise<VendorBill> {
        const response = await api.post("/vendor-bills", data);
        return response.data.data;
    },

    async update(id: string, data: UpdateVendorBillData): Promise<VendorBill> {
        const response = await api.put(`/vendor-bills/${id}`, data);
        return response.data.data;
    },

    async confirm(id: string): Promise<VendorBill> {
        const response = await api.post(`/vendor-bills/${id}/confirm`);
        return response.data.data;
    },
};
