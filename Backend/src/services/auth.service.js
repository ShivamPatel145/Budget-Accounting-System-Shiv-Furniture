import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

class AuthService {
  async register(data) {
    const { name, loginId, email, password, role = "PORTAL" } = data;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ loginId }, { email }] },
    });

    if (existingUser) {
      throw new ApiError(
        409,
        "User with this Login ID or Email already exists",
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        loginId,
        email,
        passwordHash: hashedPassword,
        role,
      },
    });

    const tokens = this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login({ loginId, password }) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ loginId: loginId }, { email: loginId }],
      },
    });

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, "Invalid credentials");
    }

    const tokens = this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn },
    );
    const refreshToken = jwt.sign({ id: user.id }, env.refreshTokenSecret, {
      expiresIn: env.refreshTokenExpiresIn,
    });
    return { accessToken, refreshToken };
  }

  sanitizeUser(user) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

export const authService = new AuthService();
