import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.databaseUrl,
    },
  },
  log: env.nodeEnv === "development" ? ["error", "warn"] : ["error"],
});

export const connectDb = async () => {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Database connection failed:", error);
    throw error;
  }
};

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
