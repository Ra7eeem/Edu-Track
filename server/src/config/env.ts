import dotenv from "dotenv";
import { z } from "zod";

// Load .env file (local dev). On Vercel env vars are injected by the platform.
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // On Vercel only /tmp is writable — default to /tmp/uploads
  UPLOAD_DIR: z.string().default("/tmp/uploads"),
  MAX_FILE_SIZE: z.coerce.number().default(5242880),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(10),

  CORS_ORIGIN: z.string().default("*"),

  LOG_LEVEL: z
    .enum(["error", "warn", "info", "debug", "verbose"])
    .default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Log clearly but NEVER call process.exit() — that crashes the
  // serverless function before Express can return a meaningful error.
  console.error("❌ Invalid / missing environment variables:");
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));

  // Throw so the error surfaces in Vercel's function logs
  throw new Error(
    "Server misconfiguration — check environment variables in Vercel Dashboard.\n" +
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
  );
}

export const env = parsed.data;
export type Env = typeof env;
