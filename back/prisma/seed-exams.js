/**
 * seed-exams.js
 * Configures structured result forms (subItens) for laboratory exam services.
 * Run with: node prisma/seed-exams.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* ── Field definitions per service name ── */
const EXAM_CONFIGS = [

  /* ── Gota Espessa ── */
  {
    serviceName: "Gota Espessa",
    subItens: [
      { input: "TEXT", label: "Resultado", unit: "P/mm³ de sangue" },
    ],
  },

  /* ── Urina ── */
  {
    serviceName: "Urina",
    subItens: [
      { input: "SECTION", label: "Exame Macroscópico" },
      { input: "SELECT",  label: "Odor",    options: ["Caraterístico", "Sui generis", "Amoniacal", "Fétido"] },
      { input: "SELECT",  label: "Cor",     options: ["Incolor", "Amarelo Claro", "Amarelo âmbar", "Marrom", "Avermelhado", "Alaranjado"] },
      { input: "SELECT",  label: "Aspecto", options: ["Límpido", "Ligeiro turvo", "Turvo", "Quiloso"] },

      { input: "SECTION", label: "Exame Químico" },
      { input: "SELECT",  label: "Leucócito",      options: ["Negativo (-)", "15 ±", "70 (+)", "125 (++)", "500 (+++)"] },
      { input: "SELECT",  label: "Nitrito",         options: ["Negativo (-)", "Positivo (+)"] },
      { input: "SELECT",  label: "Urobilinogênio",  options: ["0.2 mg/dl", "1 mg/dl", "2 mg/dl", "4 mg/dl", "8 mg/dl", "12 mg/dl"] },
      { input: "SELECT",  label: "Proteína",        options: ["Negativo (-)", "15 mg/dl", "30 mg/dl (+)", "100 mg/dl (++)", "300 mg/dl (+++)", "2000 mg/dl (++++)" ] },
      { input: "SELECT",  label: "PH",              options: ["5.0", "6.0", "6.5", "7.0", "7.5", "8.0", "9.0"] },
      { input: "SELECT",  label: "Sangue",          options: ["Negativo (-)", "Traços ±", "(+)", "(++)", "(+++)", "(++++)"] },
      { input: "SELECT",  label: "Densidade",       options: ["1000", "1.005", "1.010", "1.015", "1.020", "1.025", "1.030"] },
      { input: "SELECT",  label: "Cetonas",         options: ["Negativo (-)", "Positivo (+)", "Positivo (++)", "Positivo (+++)", "Positivo (++++)"] },
      { input: "SELECT",  label: "Bilirrubina",     options: ["Negativo (-)", "Positivo (+)", "Positivo (++)", "Positivo (+++)"] },
      { input: "SELECT",  label: "Glucose",         options: ["Negativo (-)", "Positivo (+)", "Positivo (++)", "Positivo (+++)", "Positivo (++++)"] },

      { input: "SECTION", label: "Exame Microscópico" },
      { input: "SELECT",  label: "Leucócitos",        options: ["Raros", "Alguns", "Numerosos", "Muitos"] },
      { input: "SELECT",  label: "Bactérias",          options: ["Raros", "Alguns", "Numerosos", "Muitos"] },
      { input: "SELECT",  label: "Células Epiteliais", options: ["Raros", "Alguns", "Numerosos", "Muitos"] },
      { input: "TEXT",    label: "Cilindro" },
      { input: "TEXT",    label: "Cristais" },
      { input: "SELECT",  label: "Eritrócitos", options: ["Raros", "Alguns", "Numerosos", "Muitos"] },
      { input: "TEXT",    label: "Parasita" },
    ],
  },

  /* ── Exudado Vaginal ── */
  {
    serviceName: "Exudado Vaginal",
    subItens: [
      { input: "SECTION", label: "Exame Macroscópico" },
      { input: "SELECT",  label: "Cor do muco",   options: ["Clara", "Esbranquiçada", "Amarelada", "Esverdeada", "Acastanhada", "Sanguinolenta"] },
      { input: "SELECT",  label: "Odor",          options: ["Normal", "Fétido", "Amoniacal", "Pútrido"] },
      { input: "SELECT",  label: "Consistência",  options: ["Fluída", "Espessa", "Grumosa"] },
      { input: "SELECT",  label: "Quantidade",    options: ["Escassa", "Moderada", "Abundante"] },
      { input: "TEXT",    label: "PH Vaginal" },

      { input: "SECTION", label: "Exame Microscópico" },
      { input: "SELECT",  label: "Leucócitos",        options: ["Raros", "Alguns", "Numerosos", "Muitos"] },
      { input: "SELECT",  label: "Bactérias",          options: ["Raros", "Alguns", "Numerosos", "Muitos"] },
      { input: "SELECT",  label: "Células Epiteliais", options: ["Raros", "Alguns", "Numerosos", "Muitos"] },
      { input: "TEXT",    label: "Parasita" },
      { input: "TEXT",    label: "Fungo" },
    ],
  },

  /* ── Fezes ── */
  {
    serviceName: "Fezes",
    subItens: [
      { input: "SECTION", label: "Avaliação Macroscópica" },
      { input: "SELECT",  label: "Consistência",       options: ["Sólida", "Semi-sólida", "Pastosa", "Aquosa"] },
      { input: "SELECT",  label: "Cor",                options: ["Marrom", "Esverdeada", "Amarelada", "Preta"] },
      { input: "SELECT",  label: "Presença de sangue", options: ["Não", "Sim"] },
      { input: "SELECT",  label: "Presença de Muco",   options: ["Não", "Sim"] },
      { input: "SELECT",  label: "Odor",               options: ["Caraterístico (Normal)", "Fétido (Anormal)"] },

      { input: "SECTION", label: "Avaliação Microscópica" },
      { input: "SELECT",  label: "Leucócitos",  options: ["Raros", "Alguns", "Numerosos", "Muitos"] },
      { input: "SELECT",  label: "Eritrócitos", options: ["Raros", "Alguns", "Numerosos", "Muitos"] },
      { input: "TEXT",    label: "Parasita" },
      { input: "SELECT",  label: "Protozoário", options: ["Ausente", "Cistos", "Trofozoíto"] },
      { input: "SELECT",  label: "Helminto",    options: ["Ausente", "Larvas", "Ovos"] },
    ],
  },

  /* ── Hematologia ── */
  {
    serviceName: "V.S",
    subItens: [
      { input: "TEXT", label: "VS", reference: "30", unit: "mm/h" },
    ],
  },
  {
    serviceName: "Falciformação",
    subItens: [
      { input: "TEXT", label: "Resultado" },
    ],
  },
  {
    serviceName: "Grupo Sanguíneo",
    subItens: [
      { input: "SELECT", label: "Grupo Sanguíneo", options: ["ARh(+)", "ARh(-)", "BRh(+)", "BRh(-)", "ABRh(+)", "ABRh(-)", "ORh(-)", "ORh(+)"] },
    ],
  },
  {
    serviceName: "Hemograma Completo",
    subItens: [
      { input: "TEXT", label: "Leucócitos",   reference: "4.000 – 11.000", unit: "µ/L" },
      { input: "TEXT", label: "Lymph#",       reference: "0.8 – 4.0",      unit: "mm³" },
      { input: "TEXT", label: "Gran#",        reference: "2.0 – 7.0",      unit: "mm³" },
      { input: "TEXT", label: "Mistos#",      reference: "0.1 – 1.5",      unit: "mm³" },
      { input: "TEXT", label: "Eritrócitos",  reference: "3.500 – 5.000",  unit: "µ/L" },
      { input: "TEXT", label: "Hemoglobina",  reference: "12.0 – 16.0",    unit: "g/dl" },
      { input: "TEXT", label: "Hematócrito",  reference: "35 – 54%",       unit: "%" },
      { input: "TEXT", label: "VCM",          reference: "80.0 – 100",     unit: "fL" },
      { input: "TEXT", label: "HCM",          reference: "27.0 – 32.0",    unit: "pg" },
      { input: "TEXT", label: "CHCM",         reference: "32.0 – 36.0",    unit: "g/dL" },
      { input: "TEXT", label: "RDW",          reference: "10.0 – 16.0",    unit: "%" },
      { input: "TEXT", label: "Plaquetas",    reference: "150.000 – 450.000", unit: "µ/L" },
      { input: "TEXT", label: "VPM",          reference: "6.5 – 12.0",     unit: "fL" },
      { input: "TEXT", label: "PDW",          reference: "9.0 – 17.0",     unit: "" },
      { input: "TEXT", label: "PCT",          reference: "108 – 282",      unit: "%" },
    ],
  },

  /* ── TH+TC (Tempo de Hemorragia + Coagulação) ── */
  {
    serviceName: "TH+TC",
    subItens: [
      { input: "TEXT", label: "Tempo de hemorragia", reference: "< 5",  unit: "Minutos" },
      { input: "TEXT", label: "Tempo de coagulação", reference: "< 10", unit: "Minutos" },
    ],
  },

  /* ── Serologia — Positivo / Negativo ── */
  ...["VDRL", "HIV", "HCV", "HBS Ag", "HCG (Teste de Gravidez)", "Dengue", "Chicungunha"].map((serviceName) => ({
    serviceName,
    subItens: [
      { input: "SELECT", label: "Resultado", options: ["Negativo (-)", "Positivo (+)"] },
    ],
  })),

  /* ── Serologia — Reactivo / Não Reactivo ── */
  ...["TASO", "Fator Reumatoide", "PCR"].map((serviceName) => ({
    serviceName,
    subItens: [
      { input: "SELECT", label: "Resultado", options: ["Não Reactivo (-)", "Reactivo (+)"] },
    ],
  })),

  /* ── Reacção Widal ── */
  {
    serviceName: "Reacção Widal",
    subItens: [
      { input: "TEXT", label: "Anti – O" },
      { input: "TEXT", label: "Anti – H" },
    ],
  },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const cfg of EXAM_CONFIGS) {
    const service = await prisma.service.findFirst({
      where: { name: cfg.serviceName, deletedAt: null },
    });

    if (!service) {
      console.warn(`  ⚠  Serviço não encontrado: "${cfg.serviceName}"`);
      continue;
    }

    const existing = await prisma.exam.findUnique({ where: { serviceId: service.id } });

    if (existing) {
      /* Update subItens in case the config changed */
      await prisma.exam.update({
        where: { id: existing.id },
        data:  { subItens: cfg.subItens },
      });
      console.log(`  ↻  Actualizado: "${cfg.serviceName}"`);
      skipped++;
    } else {
      await prisma.exam.create({
        data: {
          name:      service.name,
          isHeader:  false,
          input:     "TEXT",
          subItens:  cfg.subItens,
          serviceId: service.id,
        },
      });
      console.log(`  ✓  Criado: "${cfg.serviceName}" (${cfg.subItens.filter((f) => f.input !== "SECTION").length} campos)`);
      created++;
    }
  }

  console.log(`\nConcluído: ${created} criados, ${skipped} actualizados.`);
}

module.exports = main;

// Só corre sozinho quando invocado directamente; via seed-all.js é apenas importado.
if (require.main === module) {
  main()
    .catch((e) => { console.error(e); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}
