import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

class ProductService {
  #sanitize(data) {
    return {
      name: data.name,
      category: data.category ?? null,
      salesPrice: data.salesPrice ?? "0",
      purchasePrice: data.purchasePrice ?? "0",
    };
  }

  async listProducts() {
    return await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  }

  async getProductById(id) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    return product;
  }

  async createProduct(data) {
    const payload = this.#sanitize(data);
    return await prisma.product.create({ data: payload });
  }

  async updateProduct(id, data) {
    await this.getProductById(id);
    const payload = this.#sanitize({ ...data });
    return await prisma.product.update({
      where: { id },
      data: payload,
    });
  }

  async deleteProduct(id) {
    await this.getProductById(id);
    await prisma.product.delete({ where: { id } });
  }
}

export const productService = new ProductService();
