import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

class ContactService {
  async listContacts() {
    return await prisma.contact.findMany({ orderBy: { createdAt: "desc" } });
  }

  async getContactById(id) {
    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) {
      throw new ApiError(404, "Contact not found");
    }
    return contact;
  }

  async createContact(data) {
    const { name, type } = data;
    if (!name || !type) {
      throw new ApiError(400, "Name and type are required");
    }

    return await prisma.contact.create({
      data,
    });
  }

  async updateContact(id, data) {
    await this.getContactById(id);
    return await prisma.contact.update({
      where: { id },
      data,
    });
  }

  async deleteContact(id) {
    await this.getContactById(id);
    await prisma.contact.delete({ where: { id } });
  }
}

export const contactService = new ContactService();
