const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const insurances = [
  { name: "ENSA – Empresa Nacional de Seguros de Angola", nif: "5000012345", phone: "222 394 000", address: "Rua Rainha Ginga, 83, Luanda" },
  { name: "AAA Seguros",                                  nif: "5000023456", phone: "222 611 200", address: "Av. 4 de Fevereiro, 75, Luanda" },
  { name: "Global Seguros",                               nif: "5000034567", phone: "222 448 100", address: "Av. Comandante Gika, 12, Luanda" },
  { name: "Nossa Seguros",                                nif: "5000045678", phone: "222 337 500", address: "Rua Amilcar Cabral, 31, Luanda" },
  { name: "Garantia Seguros",                             nif: "5000056789", phone: "222 309 700", address: "Largo 4 de Fevereiro, 3, Luanda" },
  { name: "Prudential Angola",                            nif: "5000067890", phone: "222 501 300", address: "Rua Major Kanhangulo, 290, Luanda" },
  { name: "Fidelidade Angola",                            nif: "5000078901", phone: "222 622 400", address: "Av. Norton de Matos, 110, Luanda" },
  { name: "Allianz Angola",                               nif: "5000089012", phone: "222 554 600", address: "Av. 21 de Janeiro, 45, Luanda" },
  { name: "SIM – Seguros Integrados de Moçâmedes",        nif: "5000090123", phone: "261 220 800", address: "Rua da Independência, 7, Namibe" },
  { name: "Angoseguros",                                  nif: "5000101234", phone: "222 713 200", address: "Rua Friedrich Engels, 92, Luanda" },
  { name: "Tranquilidade Angola",                         nif: "5000112345", phone: "222 480 900", address: "Av. Ho Chi Minh, 55, Luanda" },
  { name: "ZEMA Seguros",                                 nif: "5000123456", phone: "222 391 100", address: "Rua Joaquim Kapango, 18, Luanda" },
];

async function main() {
  for (const ins of insurances) {
    const existing = await prisma.insurance.findFirst({ where: { nif: ins.nif } });
    if (existing) {
      await prisma.insurance.update({ where: { id: existing.id }, data: ins });
      console.log(`Updated: ${ins.name}`);
    } else {
      await prisma.insurance.create({ data: ins });
      console.log(`Created: ${ins.name}`);
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
