import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/users.controller.js";
import { validate } from "../middlewares/validate.js";
import { createUserSchema } from "../validations/auth.validation.js";

const router = Router();

// Apply authenticate to all user routes
router.use(authenticate);

// All user management routes require ADMIN role - apply per route
router.get("/users", authorize("ADMIN"), listUsers);
router.get("/users/:id", authorize("ADMIN"), getUser);
router.post("/users", authorize("ADMIN"), validate(createUserSchema), createUser);
router.put("/users/:id", authorize("ADMIN"), updateUser);
router.delete("/users/:id", authorize("ADMIN"), deleteUser);

export default router;