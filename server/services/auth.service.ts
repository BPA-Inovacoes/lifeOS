import { PrismaClient, UserRole } from "@prisma/client";
import { z } from "zod";

import { AppError } from "../middlewares/error.middleware";
import { hashPassword, verifyPassword } from "../utils/password";
import { createOpaqueToken, hashOpaqueToken } from "../utils/tokens";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Palavra-passe deve ter pelo menos 8 caracteres."),
  name: z.string().max(120).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Palavra-passe deve ter pelo menos 8 caracteres."),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Indica a palavra-passe actual."),
  newPassword: z
    .string()
    .min(8, "A nova palavra-passe deve ter pelo menos 8 caracteres."),
});

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  parseRegister(raw: unknown) {
    return registerSchema.parse(raw);
  }

  parseLogin(raw: unknown) {
    return loginSchema.parse(raw);
  }

  parseForgotPassword(raw: unknown) {
    return forgotPasswordSchema.parse(raw);
  }

  parseResetPassword(raw: unknown) {
    return resetPasswordSchema.parse(raw);
  }

  parseUpdateProfile(raw: unknown) {
    return updateProfileSchema.parse(raw);
  }

  parseChangePassword(raw: unknown) {
    return changePasswordSchema.parse(raw);
  }

  async register(payload: ReturnType<typeof registerSchema.parse>) {
    const existing = await this.prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() },
    });
    if (existing) {
      throw new AppError(409, {
        code: "CONFLICT",
        message: "Já existe uma conta com este email.",
      });
    }
    const passwordHash = await hashPassword(payload.password);
    const user = await this.prisma.user.create({
      data: {
        email: payload.email.toLowerCase(),
        passwordHash,
        name: payload.name,
        role: UserRole.USER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    return user;
  }

  async login(payload: ReturnType<typeof loginSchema.parse>) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() },
    });
    if (!user) {
      throw new AppError(401, {
        code: "UNAUTHORIZED",
        message: "Credenciais inválidas.",
      });
    }
    const ok = await verifyPassword(payload.password, user.passwordHash);
    if (!ok) {
      throw new AppError(401, {
        code: "UNAUTHORIZED",
        message: "Credenciais inválidas.",
      });
    }
    return user;
  }

  async forgotPassword(payload: ReturnType<typeof forgotPasswordSchema.parse>) {
    const email = payload.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { emailed: false };
    }

    const rawToken = createOpaqueToken();
    const tokenHash = hashOpaqueToken(rawToken);

    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      await tx.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        },
      });
    });

    const devToken =
      process.env.NODE_ENV !== "production" ? rawToken : undefined;

    return { emailed: true, devToken };
  }

  async resetPassword(payload: ReturnType<typeof resetPasswordSchema.parse>) {
    const tokenHash = hashOpaqueToken(payload.token);
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
    const now = new Date();
    if (
      !record ||
      record.usedAt ||
      record.expiresAt.getTime() <= now.getTime()
    ) {
      throw new AppError(400, {
        code: "VALIDATION_ERROR",
        message: "Token inválido ou expirado.",
      });
    }

    const passwordHash = await hashPassword(payload.password);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: now },
      }),
    ]);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Utilizador não encontrado.",
      });
    }
    return user;
  }

  async updateProfile(
    userId: string,
    payload: ReturnType<typeof updateProfileSchema.parse>
  ) {
    if (!payload.email && !payload.name) {
      throw new AppError(400, {
        code: "VALIDATION_ERROR",
        message: "Nada para atualizar.",
      });
    }

    if (payload.email) {
      const taken = await this.prisma.user.findFirst({
        where: {
          email: payload.email.toLowerCase(),
          NOT: { id: userId },
        },
      });
      if (taken) {
        throw new AppError(409, {
          code: "CONFLICT",
          message: "Email já utilizado.",
        });
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: payload.name,
        ...(payload.email
          ? { email: payload.email.toLowerCase() }
          : undefined),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    return user;
  }

  async changePassword(
    userId: string,
    payload: ReturnType<typeof changePasswordSchema.parse>
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Utilizador não encontrado.",
      });
    }

    const ok = await verifyPassword(payload.currentPassword, user.passwordHash);
    if (!ok) {
      throw new AppError(401, {
        code: "UNAUTHORIZED",
        message: "Palavra-passe actual incorrecta.",
      });
    }

    const passwordHash = await hashPassword(payload.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
