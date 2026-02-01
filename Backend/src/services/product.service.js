import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

class ProductService {
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
    return await prisma.product.create({
      data: {
        ...data,
        salesPrice: data.salesPrice || "0",
        purchasePrice: data.purchasePrice || "0",
      },
    });
  }

  async updateProduct(id, data) {
    await this.getProductById(id);
    return await prisma.product.update({
      where: { id },
      data,
    });
  }

  async deleteProduct(id) {
    await this.getProductById(id);
    await prisma.product.delete({ where: { id } });
  }
}

export const productService = new ProductService();
