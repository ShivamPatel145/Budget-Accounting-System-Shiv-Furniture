import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { authService } from "../services/auth.service.js";
import { prisma } from "../config/db.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:3000/api/auth/google/callback";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

/**
 * Generate Google OAuth URL
 * GET /api/auth/google
 */
export const googleAuth = asyncHandler(async (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    throw new ApiError(
      500,
      "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in environment variables.",
    );
  }

  const scope = encodeURIComponent("openid email profile");
  const state = Math.random().toString(36).substring(7);

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&state=${state}` +
    `&access_type=offline` +
    `&prompt=consent`;

  res.redirect(authUrl);
});

/**
 * Google OAuth Callback
 * GET /api/auth/google/callback
 */
export const googleCallback = asyncHandler(async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(
      `${FRONTEND_URL}/login?error=${encodeURIComponent(error)}`,
    );
  }

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Token exchange error:", tokenData);
      return res.redirect(`${FRONTEND_URL}/login?error=token_error`);
    }

    // Get user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    );

    const googleUser = await userInfoResponse.json();

    if (!googleUser.email) {
      return res.redirect(`${FRONTEND_URL}/login?error=no_email`);
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { email: googleUser.email },
    });

    if (!user) {
      // Create new user with Google data
      const loginId = googleUser.email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .substring(0, 12);

      // Check if loginId already exists and make it unique if needed
      let uniqueLoginId = loginId;
      let counter = 1;
      while (
        await prisma.user.findFirst({ where: { loginId: uniqueLoginId } })
      ) {
        uniqueLoginId = `${loginId.substring(0, 9)}${counter}`;
        counter++;
      }

      user = await prisma.user.create({
        data: {
          name: googleUser.name || googleUser.email.split("@")[0],
          email: googleUser.email,
          loginId: uniqueLoginId,
          passwordHash: "", // No password for OAuth users
          role: "ADMIN", // Default role for Google sign-in
          googleId: googleUser.id,
          avatarUrl: googleUser.picture,
        },
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.id,
          avatarUrl: user.avatarUrl || googleUser.picture,
        },
      });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn },
    );

    const refreshToken = jwt.sign({ id: user.id }, env.refreshTokenSecret, {
      expiresIn: env.refreshTokenExpiresIn,
    });

    // Redirect to frontend with tokens
    const redirectUrl =
      `${FRONTEND_URL}/auth/callback?` +
      `accessToken=${accessToken}` +
      `&refreshToken=${refreshToken}` +
      `&userId=${user.id}` +
      `&userName=${encodeURIComponent(user.name)}` +
      `&userEmail=${encodeURIComponent(user.email)}` +
      `&userRole=${user.role}` +
      `&loginId=${user.loginId}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
});

/**
 * Get Google OAuth status/config
 * GET /api/auth/google/status
 */
export const googleStatus = asyncHandler(async (req, res) => {
  res.json(
    new ApiResponse(
      200,
      {
        enabled: !!GOOGLE_CLIENT_ID,
        configured: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
      },
      "Google OAuth status",
    ),
  );
});
