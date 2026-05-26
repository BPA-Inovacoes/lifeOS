import crypto from "crypto";

export function hashOpaqueToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function createOpaqueToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
