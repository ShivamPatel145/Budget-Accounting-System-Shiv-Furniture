import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { productService } from "../services/product.service.js";

export const listProducts = asyncHandler(async (req, res) => {
  const products = await productService.listProducts();
  res.json(new ApiResponse(200, products));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json(new ApiResponse(200, product));
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json(new ApiResponse(200, product, "Product updated successfully"));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully"));
});
