import type { PrismaClient } from "@prisma/client";

import { HABIT_RPG_AREA_OPTIONS } from "../gamification/habit-areas";

const HABIT_AREA_PROP = "Área RPG";

/** Garante coluna «Área RPG» em bases Hábitos existentes. */
export async function ensureRpgProperties(prisma: PrismaClient) {
  const habitsDbs = await prisma.database.findMany({
    where: { template: "HABITS" },
    include: { properties: true },
  });

  for (const db of habitsDbs) {
    const areaProp = db.properties.find(
      (p) => p.name === HABIT_AREA_PROP || p.name === "Area RPG"
    );
    if (!areaProp) {
      const maxOrder = db.properties.reduce((m, p) => Math.max(m, p.sortOrder), -1);
      await prisma.databaseProperty.create({
        data: {
          databaseId: db.id,
          name: HABIT_AREA_PROP,
          type: "SELECT",
          sortOrder: maxOrder + 1,
          config: { options: [...HABIT_RPG_AREA_OPTIONS] },
        },
      });
      continue;
    }

    const config = (areaProp.config ?? {}) as { options?: string[] };
    const options = Array.isArray(config.options) ? [...config.options] : [];
    if (!options.includes("Finanças")) {
      await prisma.databaseProperty.update({
        where: { id: areaProp.id },
        data: {
          config: { options: [...options, "Finanças"] },
        },
      });
    }
  }
}
