const { PrismaClient } = require('@prisma/client');
const whales = require('./public/whales.json');
const prisma = new PrismaClient();

async function main() {
  for (const w of whales) {
    await prisma.whale.upsert({
      where: { address: w.address },
      update: {},
      create: {
        address: w.address,
        label: w.label,
        category: w.category || null,
        tags: w.tags || []
      }
    });
  }
  console.log('Seeded whales!');
}
main().finally(() => prisma.$disconnect());
