import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure we load the key from the file, ignoring any stale shell vars
delete process.env.GEMINI_API_KEY;

// Explicitly load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().default('1d'),
    REFRESH_TOKEN_SECRET: z.string().min(1),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
    REDIS_URL: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    CORS_ORIGIN: z.string().default('*'),
});

// Validate environment variables
const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    process.exit(1);
}

export const env = {
    nodeEnv: result.data.NODE_ENV,
    port: result.data.PORT,
    logLevel: result.data.LOG_LEVEL,
    databaseUrl: result.data.DATABASE_URL,
    jwtSecret: result.data.JWT_SECRET,
    jwtExpiresIn: result.data.JWT_EXPIRES_IN,
    refreshTokenSecret: result.data.REFRESH_TOKEN_SECRET,
    refreshTokenExpiresIn: result.data.REFRESH_TOKEN_EXPIRES_IN,
    redisUrl: result.data.REDIS_URL,
    openaiApiKey: result.data.OPENAI_API_KEY,
    anthropicApiKey: result.data.ANTHROPIC_API_KEY,
    geminiApiKey: result.data.GEMINI_API_KEY,
    corsOrigin: result.data.CORS_ORIGIN,
};
