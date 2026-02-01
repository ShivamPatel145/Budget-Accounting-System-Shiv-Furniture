import { prisma } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const ensureReferences = async ({
  analyticalAccountId,
  partnerId,
  productId,
}) => {
  const [account, partner, product] = await Promise.all([
    analyticalAccountId
      ? prisma.analyticalAccount.findUnique({
          where: { id: analyticalAccountId },
        })
      : null,
    partnerId ? prisma.contact.findUnique({ where: { id: partnerId } }) : null,
    productId ? prisma.product.findUnique({ where: { id: productId } }) : null,
  ]);

  if (analyticalAccountId && !account) {
    return { error: "Analytical account not found" };
  }
  if (partnerId && !partner) {
    return { error: "Partner not found" };
  }
  if (productId && !product) {
    return { error: "Product not found" };
  }

  return {};
};

export const listAutoModels = asyncHandler(async (req, res) => {
  const models = await prisma.autoAnalyticalModel.findMany({
    orderBy: [{ active: "desc" }, { priority: "asc" }, { createdAt: "desc" }],
    include: {
      analyticalAccount: true,
      partner: true,
      product: true,
    },
  });
  res.json({ data: models });
});

export const getAutoModel = asyncHandler(async (req, res) => {
  const model = await prisma.autoAnalyticalModel.findUnique({
    where: { id: req.params.id },
    include: {
      analyticalAccount: true,
      partner: true,
      product: true,
    },
  });
  if (!model) {
    return res
      .status(404)
      .json({ error: { message: "Auto analytical model not found" } });
  }
  res.json({ data: model });
});

export const createAutoModel = asyncHandler(async (req, res) => {
  const {
    name,
    partnerId,
    partnerTag,
    productId,
    productCategory,
    analyticalAccountId,
    priority = 100,
    active = true,
  } = req.body;

  if (!name || !analyticalAccountId) {
    return res
      .status(400)
      .json({
        error: { message: "Name and analyticalAccountId are required" },
      });
  }

  const { error } = await ensureReferences({
    analyticalAccountId,
    partnerId,
    productId,
  });
  if (error) {
    return res.status(400).json({ error: { message: error } });
  }

  const model = await prisma.autoAnalyticalModel.create({
    data: {
      name,
      partnerId,
      partnerTag,
      productId,
      productCategory,
      analyticalAccountId,
      priority,
      active,
    },
  });

  res.status(201).json({ data: model });
});

export const updateAutoModel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.autoAnalyticalModel.findUnique({
    where: { id },
  });
  if (!existing) {
    return res
      .status(404)
      .json({ error: { message: "Auto analytical model not found" } });
  }

  const { error } = await ensureReferences({
    analyticalAccountId:
      req.body.analyticalAccountId ?? existing.analyticalAccountId,
    partnerId: req.body.partnerId,
    productId: req.body.productId,
  });
  if (error) {
    return res.status(400).json({ error: { message: error } });
  }

  const model = await prisma.autoAnalyticalModel.update({
    where: { id },
    data: req.body,
  });
  res.json({ data: model });
});

export const deleteAutoModel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.autoAnalyticalModel.findUnique({
    where: { id },
  });
  if (!existing) {
    return res
      .status(404)
      .json({ error: { message: "Auto analytical model not found" } });
  }

  await prisma.autoAnalyticalModel.delete({ where: { id } });
  res.status(204).end();
});
