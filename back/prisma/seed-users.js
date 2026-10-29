const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "alfavida2025";

const users = [
  {
    name: "Administrador",
    username: "admin",
    email: "admin@alfavida.ao",
    phone: "900000001",
    role: "admin",
  },
  {
    name: "Recepcionista",
    username: "recepcao",
    email: "recepcao@alfavida.ao",
    phone: "900000002",
    role: "attendant",
  },
  {
    name: "Enfermeira",
    username: "enfermeira",
    email: "enfermeira@alfavida.ao",
    phone: "900000003",
    role: "nurse",
  },
  {
    name: "Médico",
    username: "medico",
    email: "medico@alfavida.ao",
    phone: "900000004",
    role: "doctor",
  },
  {
    name: "Analista Laboratório",
    username: "analista",
    email: "analista@alfavida.ao",
    phone: "900000005",
    role: "analyst",
  },
  {
    name: "Técnico Laboratório",
    username: "teclab",
    email: "teclab@alfavida.ao",
    phone: "900000006",
    role: "techLab",
  },
  {
    name: "Chefe Laboratório",
    username: "chefelab",
    email: "chefelab@alfavida.ao",
    phone: "900000007",
    role: "chiefLab",
  },
  {
    name: "Técnico Enfermaria",
    username: "tecenfermaria",
    email: "tecenfermaria@alfavida.ao",
    phone: "900000008",
    role: "techNursian",
  },
  {
    name: "Financeiro",
    username: "financeiro",
    email: "financeiro@alfavida.ao",
    phone: "900000009",
    role: "financial",
  },
];

async function main() {
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  console.log(`\nA criar ${users.length} utilizadores...\n`);

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: { ...user, password: hash },
    });
    console.log(`  ✓  ${user.role.padEnd(12)}  ${user.username}  (${user.name})`);
  }

  console.log(`\nConcluído. Password padrão: ${DEFAULT_PASSWORD}\n`);
}

module.exports = main;

// Só corre sozinho quando invocado directamente; via seed-all.js é apenas importado.
if (require.main === module) {
  main()
    .catch((e) => { console.error(e); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}
