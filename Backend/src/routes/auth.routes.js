import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import {
  googleAuth,
  googleCallback,
  googleStatus,
} from "../controllers/google-auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";

const router = Router();

// Standard auth routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/google/status", googleStatus);

export default router;
