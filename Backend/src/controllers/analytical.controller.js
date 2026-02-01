import { prisma } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listAnalyticalAccounts = asyncHandler(async (req, res) => {
  const records = await prisma.analyticalAccount.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json({ data: records });
});

export const getAnalyticalAccount = asyncHandler(async (req, res) => {
  const record = await prisma.analyticalAccount.findUnique({
    where: { id: req.params.id },
  });
  if (!record) {
    return res
      .status(404)
      .json({ error: { message: "Analytical account not found" } });
  }
  res.json({ data: record });
});

export const createAnalyticalAccount = asyncHandler(async (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) {
    return res
      .status(400)
      .json({ error: { message: "Name and type are required" } });
  }

  const record = await prisma.analyticalAccount.create({
    data: { name, type },
  });
  res.status(201).json({ data: record });
});

export const updateAnalyticalAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.analyticalAccount.findUnique({ where: { id } });
  if (!existing) {
    return res
      .status(404)
      .json({ error: { message: "Analytical account not found" } });
  }

  const record = await prisma.analyticalAccount.update({
    where: { id },
    data: req.body,
  });
  res.json({ data: record });
});

export const deleteAnalyticalAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.analyticalAccount.findUnique({ where: { id } });
  if (!existing) {
    return res
      .status(404)
      .json({ error: { message: "Analytical account not found" } });
  }

  await prisma.analyticalAccount.delete({ where: { id } });
  res.status(204).end();
});
