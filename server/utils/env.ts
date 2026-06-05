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
  /** API key OpenAI-compatível para Case (opcional — sem chave usa coach local). */
  CASE_LLM_API_KEY: z.string().optional(),
  /** Preset: groq aplica URL/modelo por defeito se não sobrescreveres BASE_URL/MODEL. */
  CASE_LLM_PROVIDER: z.enum(["openai", "groq", "custom"]).default("custom"),
  CASE_LLM_MODEL: z.string().default("gpt-4o-mini"),
  CASE_LLM_BASE_URL: z.string().default("https://api.openai.com/v1"),
});

export const env = envSchema.parse(process.env);
