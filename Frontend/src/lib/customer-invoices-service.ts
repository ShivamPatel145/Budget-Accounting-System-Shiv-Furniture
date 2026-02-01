import { api } from "./api";

export type InvoiceStatus = "DRAFT" | "CONFIRMED" | "PARTIAL" | "PAID" | "CANCELLED";

export interface CustomerInvoiceLine {
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

export interface CustomerInvoice {
    id: string;
    number: string;
    customerId: string;
    salesOrderId?: string;
    invoiceDate: string;
    dueDate?: string;
    status: InvoiceStatus;
    total: number;
    amountDue: number;
    qrCode?: string;
    createdAt: string;
    updatedAt: string;
    customer?: {
        id: string;
        name: string;
        type: string;
    };
    salesOrder?: {
        id: string;
        number: string;
    };
    lines: CustomerInvoiceLine[];
    payments?: Array<{
        id: string;
        number: string;
        amount: number;
        status: string;
    }>;
}

export interface CreateCustomerInvoiceLine {
    productId: string;
    quantity: number;
    unitPrice: number;
    analyticalAccountId?: string;
}

export interface CreateCustomerInvoiceData {
    number: string;
    customerId: string;
    invoiceDate: string;
    dueDate?: string;
    salesOrderId?: string;
    status?: InvoiceStatus;
    qrCode?: string;
    lines: CreateCustomerInvoiceLine[];
}

export interface UpdateCustomerInvoiceData {
    customerId?: string;
    invoiceDate?: string;
    dueDate?: string;
    salesOrderId?: string;
    qrCode?: string;
    lines?: CreateCustomerInvoiceLine[];
}

export const customerInvoicesService = {
    async list(): Promise<CustomerInvoice[]> {
        const response = await api.get("/customer-invoices");
        return response.data.data;
    },

    async getById(id: string): Promise<CustomerInvoice> {
        const response = await api.get(`/customer-invoices/${id}`);
        return response.data.data;
    },

    async create(data: CreateCustomerInvoiceData): Promise<CustomerInvoice> {
        const response = await api.post("/customer-invoices", data);
        return response.data.data;
    },

    async update(id: string, data: UpdateCustomerInvoiceData): Promise<CustomerInvoice> {
        const response = await api.put(`/customer-invoices/${id}`, data);
        return response.data.data;
    },

    async confirm(id: string): Promise<CustomerInvoice> {
        const response = await api.post(`/customer-invoices/${id}/confirm`);
        return response.data.data;
    },

    async downloadPdf(id: string): Promise<Blob> {
        const response = await api.get(`/customer-invoices/${id}/pdf`, {
            responseType: 'blob',
        });
        return response.data;
    },
};
