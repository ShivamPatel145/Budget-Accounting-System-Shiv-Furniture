import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { vendorBillService } from "../services/vendorBill.service.js";

export const listVendorBills = asyncHandler(async (req, res) => {
  const bills = await vendorBillService.listVendorBills(req.user);
  res.json(new ApiResponse(200, bills));
});

export const getVendorBill = asyncHandler(async (req, res) => {
  const bill = await vendorBillService.getVendorBillById(req.params.id);
  res.json(new ApiResponse(200, bill));
});

export const createVendorBill = asyncHandler(async (req, res) => {
  const bill = await vendorBillService.createVendorBill(req.body);
  res
    .status(201)
    .json(new ApiResponse(201, bill, "Vendor Bill created successfully"));
});

export const updateVendorBill = asyncHandler(async (req, res) => {
  const bill = await vendorBillService.updateVendorBill(
    req.params.id,
    req.body,
  );
  res.json(new ApiResponse(200, bill, "Vendor Bill updated successfully"));
});

export const confirmVendorBill = asyncHandler(async (req, res) => {
  const bill = await vendorBillService.confirmVendorBill(req.params.id);
  res.json(new ApiResponse(200, bill, "Vendor Bill confirmed successfully"));
});
