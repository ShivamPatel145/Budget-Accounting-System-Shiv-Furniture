import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { salesOrderService } from "../services/salesOrder.service.js";

export const listSalesOrders = asyncHandler(async (req, res) => {
  const sos = await salesOrderService.listSalesOrders(req.user);
  res.json(new ApiResponse(200, sos));
});

export const getSalesOrder = asyncHandler(async (req, res) => {
  const so = await salesOrderService.getSalesOrderById(req.params.id);
  res.json(new ApiResponse(200, so));
});

export const createSalesOrder = asyncHandler(async (req, res) => {
  const so = await salesOrderService.createSalesOrder(req.body);
  res
    .status(201)
    .json(new ApiResponse(201, so, "Sales Order created successfully"));
});

export const updateSalesOrder = asyncHandler(async (req, res) => {
  const so = await salesOrderService.updateSalesOrder(req.params.id, req.body);
  res.json(new ApiResponse(200, so, "Sales Order updated successfully"));
});

export const confirmSalesOrder = asyncHandler(async (req, res) => {
  const so = await salesOrderService.confirmSalesOrder(req.params.id);
  res.json(new ApiResponse(200, so, "Sales Order confirmed successfully"));
});
