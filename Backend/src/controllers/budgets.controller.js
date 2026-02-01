import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { budgetService } from "../services/budget.service.js";

export const listBudgets = asyncHandler(async (req, res) => {
  const budgets = await budgetService.listBudgets(req.query.status);
  res.json(new ApiResponse(200, budgets));
});

export const getBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.getBudgetById(req.params.id);
  res.json(new ApiResponse(200, budget));
});

export const createBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.createBudget(req.body);
  res
    .status(201)
    .json(new ApiResponse(201, budget, "Budget created successfully"));
});

export const updateBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.updateBudget(req.params.id, req.body);
  res.json(new ApiResponse(200, budget, "Budget updated successfully"));
});

export const confirmBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.confirmBudget(req.params.id);
  res.json(new ApiResponse(200, budget, "Budget confirmed"));
});

export const archiveBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.archiveBudget(req.params.id);
  res.json(new ApiResponse(200, budget, "Budget archived"));
});

export const reviseBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.reviseBudget(req.params.id, req.body);
  res
    .status(201)
    .json(new ApiResponse(201, budget, "Budget revised successfully"));
});
