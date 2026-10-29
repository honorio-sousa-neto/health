const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const protocols = [
  { name: "PVP",          value: 0  },
  { name: "Protocolo 0",  value: 20 },
  { name: "Protocolo 50", value: 17 },
  { name: "Protocolo 25", value: 15 },
  { name: "Protocolo 75", value: 12 },
  { name: "Parceria",     value: 10 },
];

async function main() {
  for (const p of protocols) {
    const existing = await prisma.protocol.findFirst({ where: { name: p.name } });
    if (existing) {
      await prisma.protocol.update({ where: { id: existing.id }, data: { value: p.value } });
      console.log(`Updated: ${p.name}`);
    } else {
      await prisma.protocol.create({ data: p });
      console.log(`Created: ${p.name}`);
    }
  }
}

module.exports = main;

// Só corre sozinho quando invocado directamente; via seed-all.js é apenas importado.
if (require.main === module) {
  main()
    .catch((e) => { console.error(e); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}
