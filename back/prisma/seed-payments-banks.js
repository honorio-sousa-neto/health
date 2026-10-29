const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const payments = [
  { name: "Dinheiro",               code: "D"  },
  { name: "Transferência Bancária", code: "TB" },
  { name: "Multicaixa Express",     code: "MC" },
  { name: "Cartão de Débito",       code: "CD" },
  { name: "Cheque",                 code: "CH" },
  { name: "TPA",                    code: "TP" },
];

const banks = [
  { name: "BAI – Banco Angolano de Investimentos",  iban: "AO06 0040 0000 0000 0000 1011 1", number: "40000000001" },
  { name: "BFA – Banco de Fomento Angola",          iban: "AO06 0050 0000 0000 0000 1012 3", number: "50000000002" },
  { name: "BPC – Banco de Poupança e Crédito",      iban: "AO06 0038 0000 0000 0000 1013 5", number: "38000000003" },
  { name: "BCA – Banco Comercial Angolano",         iban: "AO06 0055 0000 0000 0000 1014 7", number: "55000000004" },
  { name: "Atlântico – Banco Millennium Atlântico", iban: "AO06 0006 0000 0000 0000 1015 9", number: "60000000005" },
  { name: "BIC – Banco BIC",                        iban: "AO06 0025 0000 0000 0000 1016 1", number: "25000000006" },
  { name: "SOL – Banco Sol",                        iban: "AO06 0049 0000 0000 0000 1017 3", number: "49000000007" },
  { name: "KEVE – Banco Keve",                      iban: "AO06 0057 0000 0000 0000 1018 5", number: "57000000008" },
];

async function main() {
  console.log("── Formas de pagamento ──");
  for (const p of payments) {
    const existing = await prisma.payment.findFirst({ where: { code: p.code } });
    if (existing) {
      await prisma.payment.update({ where: { id: existing.id }, data: { name: p.name } });
      console.log(`  Updated: ${p.name} (${p.code})`);
    } else {
      await prisma.payment.create({ data: p });
      console.log(`  Created: ${p.name} (${p.code})`);
    }
  }

  console.log("── Contas bancárias ──");
  for (const b of banks) {
    const existing = await prisma.bankAccount.findFirst({ where: { name: b.name } });
    if (existing) {
      await prisma.bankAccount.update({ where: { id: existing.id }, data: { iban: b.iban, number: b.number } });
      console.log(`  Updated: ${b.name}`);
    } else {
      await prisma.bankAccount.create({ data: b });
      console.log(`  Created: ${b.name}`);
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
