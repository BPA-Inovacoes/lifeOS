import type { PrismaClient, WorkspaceRole } from "@prisma/client";

import { AppError } from "../middlewares/error.middleware";

const ROLE_RANK: Record<WorkspaceRole, number> = {
  VIEWER: 1,
  MEMBER: 2,
  ADMIN: 3,
  OWNER: 4,
};

export async function assertWorkspaceAccess(
  prisma: PrismaClient,
  userId: string,
  workspaceId: string,
  minRole: WorkspaceRole = "MEMBER"
) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, ownerId: true },
  });

  if (!workspace) {
    throw new AppError(404, {
      code: "NOT_FOUND",
      message: "Espaço não encontrado.",
    });
  }

  if (workspace.ownerId === userId) {
    return { workspaceId, role: "OWNER" as WorkspaceRole };
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId },
    },
  });

  if (!member) {
    throw new AppError(403, {
      code: "FORBIDDEN",
      message: "Sem acesso a este espaço.",
    });
  }

  if (ROLE_RANK[member.role] < ROLE_RANK[minRole]) {
    throw new AppError(403, {
      code: "FORBIDDEN",
      message: "Permissões insuficientes.",
    });
  }

  return { workspaceId, role: member.role };
}
