import { prisma } from "../config/db.js";

export const loadActiveAutoModels = () =>
  prisma.autoAnalyticalModel.findMany({
    where: { active: true },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });

export const resolveAnalyticalAccount = ({
  models = [],
  partnerId,
  partnerTags = [],
  productId,
  productCategory,
}) => {
  const match = models.find((model) => {
    if (model.partnerId && model.partnerId !== partnerId) return false;
    if (model.partnerTag && !partnerTags.includes(model.partnerTag))
      return false;
    if (model.productId && model.productId !== productId) return false;
    if (model.productCategory && model.productCategory !== productCategory)
      return false;
    return true;
  });

  return match ? match.analyticalAccountId : null;
};
