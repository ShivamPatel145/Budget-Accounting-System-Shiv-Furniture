import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { purchaseOrderService } from "../services/purchaseOrder.service.js";

export const listPurchaseOrders = asyncHandler(async (req, res) => {
  const pos = await purchaseOrderService.getPurchaseOrders(req.user);
  res.json(new ApiResponse(200, pos));
});

export const getPurchaseOrder = asyncHandler(async (req, res) => {
  const po = await purchaseOrderService.getPurchaseOrderById(req.params.id);
  res.json(new ApiResponse(200, po));
});

export const createPurchaseOrder = asyncHandler(async (req, res) => {
  const po = await purchaseOrderService.createPurchaseOrder(req.body);
  res
    .status(201)
    .json(new ApiResponse(201, po, "Purchase Order created successfully"));
});

export const updatePurchaseOrder = asyncHandler(async (req, res) => {
  const po = await purchaseOrderService.updatePurchaseOrder(
    req.params.id,
    req.body,
  );
  res.json(new ApiResponse(200, po, "Purchase Order updated successfully"));
});

export const confirmPurchaseOrder = asyncHandler(async (req, res) => {
  const po = await purchaseOrderService.confirmPurchaseOrder(req.params.id);
  res.json(new ApiResponse(200, po, "Purchase Order confirmed successfully"));
});
