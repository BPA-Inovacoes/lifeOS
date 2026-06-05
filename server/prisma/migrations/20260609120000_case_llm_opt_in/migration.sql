-- Opt-in explícito antes de enviar dados a um LLM externo (Groq, OpenAI, etc.)
ALTER TABLE "User" ADD COLUMN "caseLlmOptIn" BOOLEAN NOT NULL DEFAULT false;
