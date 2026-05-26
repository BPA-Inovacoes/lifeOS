import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16, "JWT_SECRET deve ter pelo menos 16 caracteres"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(3333),
  CLIENT_ORIGIN: z.string().optional(),
  /** "false" desactiva linhas de exemplo e XP demo no seed */
  SEED_DEMO: z
    .string()
    .optional()
    .transform((v) => v !== "false" && v !== "0"),
});

export const env = envSchema.parse(process.env);
