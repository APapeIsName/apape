import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { id: "ai-system-user-apape" },
    update: {},
    create: {
      id: "ai-system-user-apape",
      email: "ai@apape.internal",
      name: "AI Assistant",
      role: "USER",
    },
  });
  console.log("AI system user seeded:", user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
