import dotenv from "dotenv";

dotenv.config();

const required = (value, name) => {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
};

console.log(
  "JWT_SECRET loaded (length):",
  process.env.JWT_SECRET?.length || 0,
  "Start:",
  process.env.JWT_SECRET?.slice(0, 2),
);

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  logLevel: process.env.LOG_LEVEL || "info",
  databaseUrl: required(process.env.DATABASE_URL, "DATABASE_URL"),
  jwtSecret: required(process.env.JWT_SECRET, "JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  refreshTokenSecret: required(
    process.env.REFRESH_TOKEN_SECRET,
    "REFRESH_TOKEN_SECRET",
  ),
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  redisUrl: process.env.REDIS_URL,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  openaiKey: process.env.OPENAI_API_KEY,
  anthropicKey: process.env.ANTHROPIC_API_KEY,
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/api/auth/google/callback",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:8080",
};
