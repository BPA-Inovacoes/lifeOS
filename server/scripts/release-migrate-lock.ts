import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const PRISMA_LOCK_CLASSID = 72707369;

async function main() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DIRECT_URL ou DATABASE_URL em falta");

  const prisma = new PrismaClient({
    datasources: { db: { url } },
  });

  try {
    const holders = await prisma.$queryRaw<
      { pid: number; state: string; q: string }[]
    >`
      SELECT l.pid::int AS pid, a.state, left(coalesce(a.query, ''), 80) AS q
      FROM pg_locks l
      JOIN pg_stat_activity a ON a.pid = l.pid
      WHERE l.locktype = 'advisory'
        AND ((l.classid = 0 AND l.objid = ${PRISMA_LOCK_CLASSID})
          OR l.classid = ${PRISMA_LOCK_CLASSID})
    `;

    console.log("Sessões com lock Prisma:", holders);

    for (const row of holders) {
      await prisma.$executeRawUnsafe(`SELECT pg_terminate_backend(${row.pid})`);
      console.log(`Terminada sessão ${row.pid}`);
    }

    if (!holders.length) {
      console.log("Nenhum lock activo — podes correr migrate deploy.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
