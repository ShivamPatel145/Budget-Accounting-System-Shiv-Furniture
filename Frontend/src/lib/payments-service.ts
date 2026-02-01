import { api } from "./api";

export type PaymentType = "BILL" | "INVOICE";
export type PaymentMethod = "CASH" | "BANK" | "CARD" | "UPI" | "RAZORPAY";
export type PaymentStatus = "INITIATED" | "PARTIAL" | "PAID" | "FAILED";

export interface Payment {
    id: string;
    number: string;
    paymentType: PaymentType;
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    paidAt?: string;
    referenceNotes?: string;
    vendorBillId?: string;
    customerInvoiceId?: string;
    createdAt: string;
    updatedAt: string;
    vendorBill?: {
        id: string;
        number: string;
        total: number;
        vendor?: {
            name: string;
        };
    };
    customerInvoice?: {
        id: string;
        number: string;
        total: number;
        customer?: {
            name: string;
        };
    };
}

export interface CreatePaymentData {
    number?: string;
    paymentType: PaymentType;
    method: PaymentMethod;
    amount: number;
    referenceNotes?: string;
    vendorBillId?: string;
    customerInvoiceId?: string;
}

export const paymentsService = {
    async list(): Promise<Payment[]> {
        const response = await api.get("/payments");
        return response.data.data;
    },

    async create(data: CreatePaymentData): Promise<Payment> {
        const response = await api.post("/payments", data);
        return response.data.data;
    },

    async downloadReceipt(id: string): Promise<Blob> {
        const response = await api.get(`/payments/${id}/receipt`, {
            responseType: "blob",
        });
        return response.data;
    },
};
