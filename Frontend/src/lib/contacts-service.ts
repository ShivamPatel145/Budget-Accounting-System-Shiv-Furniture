import { api } from "./api";

export type ContactType = "CUSTOMER" | "VENDOR" | "BOTH";

export interface Contact {
    id: string;
    name: string;
    type: ContactType;
    tags: string[];
    email?: string;
    phone?: string;
    imageUrl?: string;
    portalUserId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateContactData {
    name: string;
    type: ContactType;
    tags?: string[];
    email?: string;
    phone?: string;
    imageUrl?: string;
}

export interface UpdateContactData extends Partial<CreateContactData> { }

export const contactsService = {
    async list(): Promise<Contact[]> {
        const response = await api.get("/contacts");
        return response.data.data;
    },

    async getById(id: string): Promise<Contact> {
        const response = await api.get(`/contacts/${id}`);
        return response.data.data;
    },

    async create(data: CreateContactData): Promise<Contact> {
        const response = await api.post("/contacts", data);
        return response.data.data;
    },

    async update(id: string, data: UpdateContactData): Promise<Contact> {
        const response = await api.put(`/contacts/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/contacts/${id}`);
    },
};
