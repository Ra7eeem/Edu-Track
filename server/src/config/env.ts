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
  JWT_EXPIRES_IN: z.string().default("60d"),

  // On Vercel only /tmp is writable — default to /tmp/uploads
  UPLOAD_DIR: z.string().default("/tmp/uploads"),
  MAX_FILE_SIZE: z.coerce.number().default(5242880),

  // Rate limiting
  // General (IP-based, bot protection): 5000 req / 15 min — covers classrooms on shared Wi-Fi.
  // User (user ID-based, fairness):      800  req / 15 min — keyed per authenticated user.
  // Auth (IP-based, brute-force guard):   20  failed attempts / 15 min.
  RATE_LIMIT_WINDOW_MS:  z.coerce.number().default(900_000), // 15 min
  RATE_LIMIT_MAX:        z.coerce.number().default(5_000),
  USER_RATE_LIMIT_MAX:   z.coerce.number().default(800),
  AUTH_RATE_LIMIT_MAX:   z.coerce.number().default(20),

  // Upstash Redis — shared rate-limit store across Vercel serverless instances.
  // Without this every instance has its own counter (unreliable on serverless).
  // Get these from https://console.upstash.com → create a Redis DB → REST API.
  // Leave unset to fall back to in-memory (local dev only).
  UPSTASH_REDIS_REST_URL:   z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

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
