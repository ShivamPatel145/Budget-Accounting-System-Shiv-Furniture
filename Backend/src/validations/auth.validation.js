import { z } from "zod";

// Password must be 8+ chars with uppercase, lowercase, and special character
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character",
  );

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    loginId: z
      .string()
      .min(6, "Login ID must be between 6-12 characters")
      .max(12, "Login ID must be between 6-12 characters"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    role: z.enum(["ADMIN", "PORTAL"]).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    loginId: z.string().min(1, "Login ID is required"),
    password: z.string().min(1, "Password is required"),
  }),
});

// Schema for admin creating users
export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    loginId: z
      .string()
      .min(6, "Login ID must be between 6-12 characters")
      .max(12, "Login ID must be between 6-12 characters"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    role: z.enum(["ADMIN", "PORTAL"]),
  }),
});
