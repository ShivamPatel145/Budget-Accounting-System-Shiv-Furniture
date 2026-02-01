import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { connectDb, prisma } from "./config/db.js";
import { logger } from "./utils/logger.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import contactRoutes from "./routes/contacts.routes.js";
import productRoutes from "./routes/products.routes.js";
import analyticalRoutes from "./routes/analytical.routes.js";
import autoModelRoutes from "./routes/autoModels.routes.js";
import budgetRoutes from "./routes/budgets.routes.js";
import purchaseOrderRoutes from "./routes/purchaseOrders.routes.js";
import vendorBillRoutes from "./routes/vendorBills.routes.js";
import paymentRoutes from "./routes/payments.routes.js";
import salesOrderRoutes from "./routes/salesOrders.routes.js";
import customerInvoiceRoutes from "./routes/customerInvoices.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import aiRoutes from "./routes/ai.routes.js";

import rateLimit from "express-rate-limit";
import compression from "compression";

const app = express();

app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration - allow multiple origins in development
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:8080",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:5173",
      env.corsOrigin,
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin) || env.corsOrigin === "*") {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));
app.use(express.json());

// Request logging (can be moved to a separate file later)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", contactRoutes);
app.use("/api", productRoutes);
app.use("/api", analyticalRoutes);
app.use("/api", autoModelRoutes);
app.use("/api", budgetRoutes);
app.use("/api", purchaseOrderRoutes);
app.use("/api", vendorBillRoutes);
app.use("/api", paymentRoutes);
app.use("/api", salesOrderRoutes);
app.use("/api", customerInvoiceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDb();
    const server = app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port}`);
    });

    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received, closing server...");
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
};

start();
