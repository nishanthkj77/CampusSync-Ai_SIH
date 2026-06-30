 import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_SECRET: z.string().min(10, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("1d"),

  AI_ENGINE_DIR: z.string().default("../ai-engine"),
  AI_ENGINE_PYTHON_COMMAND: z.string().default("python"),
  AI_ENGINE_TIMEOUT_MS: z.coerce.number().default(120000)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;