import { env } from "../utils/env";

const OPENAI_DEFAULT_BASE = "https://api.openai.com/v1";
const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";

const GROQ_DEFAULTS = {
  baseUrl: "https://api.groq.com/openai/v1",
  model: "llama-3.3-70b-versatile",
};

export type CaseLlmProvider = "openai" | "groq" | "custom";

export function caseLlmProvider(): CaseLlmProvider {
  return env.CASE_LLM_PROVIDER;
}

export function resolveCaseLlmEndpoint() {
  const provider = env.CASE_LLM_PROVIDER;
  const baseUrl =
    provider === "groq" && env.CASE_LLM_BASE_URL === OPENAI_DEFAULT_BASE
      ? GROQ_DEFAULTS.baseUrl
      : env.CASE_LLM_BASE_URL.replace(/\/$/, "");

  const model =
    provider === "groq" &&
    env.CASE_LLM_MODEL === OPENAI_DEFAULT_MODEL
      ? GROQ_DEFAULTS.model
      : env.CASE_LLM_MODEL;

  return { baseUrl, model, provider };
}
