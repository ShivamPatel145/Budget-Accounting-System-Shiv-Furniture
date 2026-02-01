import { Router } from "express";
import { prisma } from "../config/db.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.get("/health/db", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    next(err);
  }
});

// Debug endpoint to check token info
router.get("/health/me", authenticate, (req, res) => {
  res.json({ 
    status: "ok", 
    user: req.user,
    message: "Token is valid"
  });
});

export default router;
