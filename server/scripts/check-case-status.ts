import "dotenv/config";

import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findFirst({
      select: { id: true, email: true, caseLlmOptIn: true },
    });
    console.log("User:", user);

    const loginRes = await fetch("http://localhost:3333/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "xavier@bpa.com", password: "xavier123" }),
    });
    if (!loginRes.ok) {
      console.log("Login falhou:", loginRes.status, await loginRes.text());
      return;
    }
    const { token } = (await loginRes.json()) as { token: string };

    const statusRes = await fetch("http://localhost:3333/case/status", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Status HTTP:", statusRes.status);
    console.log("Status body:", await statusRes.text());
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
