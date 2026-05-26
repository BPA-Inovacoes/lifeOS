import jwt from "jsonwebtoken";
import { env } from "./env";

export type JwtPayload = {
  sub: string;
};

export function signAccessToken(userId: string): string {
  const payload: JwtPayload = { sub: userId };
  const opts = {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions;
  return jwt.sign(payload, env.JWT_SECRET, opts);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
