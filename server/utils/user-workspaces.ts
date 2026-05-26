import type { PrismaClient } from "@prisma/client";

export async function workspaceIdsForUser(prisma: PrismaClient, userId: string) {
  const owned = await prisma.workspace.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });
  const member = await prisma.workspaceMember.findMany({
    where: { userId },
    select: { workspaceId: true },
  });
  const ids = new Set<string>();
  for (const w of owned) ids.add(w.id);
  for (const m of member) ids.add(m.workspaceId);
  return [...ids];
}
