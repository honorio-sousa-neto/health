/**
 * Seed completo — ponto de entrada único.
 *
 *   node prisma/seed-all.js                 tudo
 *   node prisma/seed-all.js --skip-users    sem os utilizadores por omissão
 *   node prisma/seed-all.js --only=units,services
 *   node prisma/seed-all.js --list          mostra as etapas e sai
 *
 * A ordem é significativa: unidades antes dos serviços (os serviços referem
 * unidades de medida), serviços e medicamentos antes do consumo padrão (as
 * receitas resolvem os serviços por nome).
 *
 * Todas as etapas são idempotentes — o seed pode correr as vezes que forem
 * precisas sem duplicar nada.
 *
 * NÃO inclui prisma/seed.js nem prisma/create-test-user.js: o primeiro importa
 * clientes, faturas e empresas de demonstração; o segundo cria um utilizador de
 * teste. Nenhum dos dois pertence a uma base de produção.
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ETAPAS = [
  { chave: "units",         titulo: "Unidades de medida",        mod: "./seed-units" },
  { chave: "services",      titulo: "Categorias e serviços",     mod: "./seed-services" },
  { chave: "drugs",         titulo: "Farmácia (medicamentos)",   mod: "./seed-drugs" },
  { chave: "exams",         titulo: "Formulários de exames",     mod: "./seed-exams" },
  { chave: "protocols",     titulo: "Protocolos",                mod: "./seed-protocols" },
  { chave: "insurances",    titulo: "Seguradoras",               mod: "./seed-insurances" },
  { chave: "payments",      titulo: "Pagamentos e bancos",       mod: "./seed-payments-banks" },
  { chave: "users",         titulo: "Utilizadores por omissão",  mod: "./seed-users", aviso: true },
  { chave: "consumo",       titulo: "Consumo padrão",            mod: "./seed-consumo-padrao" },
];

const args = process.argv.slice(2);
const temFlag = (f) => args.includes(f);
const valorFlag = (f) => {
  const a = args.find((x) => x.startsWith(f + "="));
  return a ? a.slice(f.length + 1) : null;
};

function etapasAConsiderar() {
  const only = valorFlag("--only");
  let lista = ETAPAS;
  if (only) {
    const chaves = only.split(",").map((s) => s.trim()).filter(Boolean);
    const invalidas = chaves.filter((c) => !ETAPAS.some((e) => e.chave === c));
    if (invalidas.length) {
      console.error(`Etapa(s) desconhecida(s): ${invalidas.join(", ")}`);
      console.error(`Disponíveis: ${ETAPAS.map((e) => e.chave).join(", ")}`);
      process.exit(1);
    }
    lista = ETAPAS.filter((e) => chaves.includes(e.chave));
  }
  for (const e of ETAPAS) {
    if (temFlag(`--skip-${e.chave}`)) lista = lista.filter((x) => x.chave !== e.chave);
  }
  return lista;
}

async function main() {
  if (temFlag("--list")) {
    console.log("Etapas do seed, por ordem de execução:\n");
    ETAPAS.forEach((e, i) => console.log(`  ${String(i + 1).padStart(2)}. ${e.chave.padEnd(12)} ${e.titulo}`));
    console.log("\nUse --only=a,b  ou  --skip-<chave>");
    return;
  }

  const etapas = etapasAConsiderar();
  const inicio = Date.now();
  const falhas = [];

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  SEED — ${etapas.length} etapa(s)`);
  console.log(`${"=".repeat(60)}`);

  for (let i = 0; i < etapas.length; i++) {
    const e = etapas[i];
    console.log(`\n[${i + 1}/${etapas.length}] ${e.titulo}`);
    console.log("-".repeat(60));
    const t0 = Date.now();
    try {
      const fn = require(e.mod);
      if (typeof fn !== "function") throw new Error(`${e.mod} não exporta uma função`);
      await fn();
      console.log(`    (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    } catch (err) {
      falhas.push({ etapa: e.titulo, erro: err.message });
      console.error(`    ✗ FALHOU: ${err.message}`);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  if (falhas.length) {
    console.log(`  CONCLUÍDO COM ${falhas.length} FALHA(S) em ${((Date.now() - inicio) / 1000).toFixed(1)}s`);
    falhas.forEach((f) => console.log(`    ✗ ${f.etapa}: ${f.erro}`));
  } else {
    console.log(`  ✅ SEED COMPLETO em ${((Date.now() - inicio) / 1000).toFixed(1)}s`);
  }
  console.log(`${"=".repeat(60)}`);

  if (etapas.some((e) => e.aviso) && !falhas.length) {
    console.log("\n⚠️  Foram criados utilizadores com a password padrão.");
    console.log("   Altere-a antes de expor o sistema.\n");
  }

  if (falhas.length) process.exitCode = 1;
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
