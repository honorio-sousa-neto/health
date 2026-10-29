const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/*
  kind = "measure" → grandeza física com conversão (g, mL, m, …)
  kind = "count"   → unidade de contagem / forma de embalagem (comp, cáps, cx, …)

  factor = quantas unidades-base equivale 1 desta unidade
  Exemplo: 1 kg = 1000 g  →  factor = 1000  (base = g)
*/

const GROUPS = [
  {
    category: "peso",
    kind: "measure",
    units: [
      { name: "Grama",      abbreviation: "g",   factor: 1,          isBase: true },
      { name: "Miligrama",  abbreviation: "mg",  factor: 0.001                    },
      { name: "Micrograma", abbreviation: "µg",  factor: 0.000001                 },
      { name: "Quilograma", abbreviation: "kg",  factor: 1000                     },
    ],
  },
  {
    category: "volume",
    kind: "measure",
    units: [
      { name: "Mililitro",  abbreviation: "mL",  factor: 1,          isBase: true },
      { name: "Microlitro", abbreviation: "µL",  factor: 0.001                    },
      { name: "Decilitro",  abbreviation: "dL",  factor: 100                      },
      { name: "Litro",      abbreviation: "L",   factor: 1000                     },
    ],
  },
  {
    category: "comprimento",
    kind: "measure",
    units: [
      { name: "Metro",      abbreviation: "m",   factor: 1,          isBase: true },
      { name: "Milímetro",  abbreviation: "mm",  factor: 0.001                    },
      { name: "Centímetro", abbreviation: "cm",  factor: 0.01                     },
      { name: "Quilómetro", abbreviation: "km",  factor: 1000                     },
    ],
  },
  {
    category: "área",
    kind: "measure",
    units: [
      { name: "Metro quadrado",      abbreviation: "m²",  factor: 1,        isBase: true },
      { name: "Centímetro quadrado", abbreviation: "cm²", factor: 0.0001             },
      { name: "Milímetro quadrado",  abbreviation: "mm²", factor: 0.000001           },
    ],
  },
  {
    category: "quantidade",
    kind: "count",
    units: [
      { name: "Unidade",  abbreviation: "un",    factor: 1, isBase: true },
      { name: "Par",      abbreviation: "par",   factor: 2               },
      { name: "Caixa",    abbreviation: "cx",    factor: 1               },
      { name: "Rolo",     abbreviation: "rolo",  factor: 1               },
      { name: "Kit",      abbreviation: "kit",   factor: 1               },
      { name: "Teste",    abbreviation: "teste", factor: 1               },
    ],
  },
  {
    category: "forma farmacêutica",
    kind: "count",
    units: [
      { name: "Comprimido", abbreviation: "comp",  factor: 1, isBase: true },
      { name: "Cápsula",    abbreviation: "cáps",  factor: 1               },
      { name: "Ampola",     abbreviation: "amp",   factor: 1               },
      { name: "Frasco",     abbreviation: "fr",    factor: 1               },
      { name: "Tubo",       abbreviation: "tubo",  factor: 1               },
      { name: "Placa",      abbreviation: "placa", factor: 1               },
    ],
  },
];

async function seed() {
  console.log("🌱  A iniciar seed de unidades de medida…\n");

  for (const group of GROUPS) {
    const baseSpec = group.units.find((u) => u.isBase);

    const base = await prisma.unitOfMeasure.upsert({
      where:  { abbreviation: baseSpec.abbreviation },
      update: { name: baseSpec.name, category: group.category, kind: group.kind, factor: 1, baseUnitId: null },
      create: { name: baseSpec.name, abbreviation: baseSpec.abbreviation, category: group.category, kind: group.kind, factor: 1 },
    });

    console.log(`  [${group.kind}] ${group.category} — referência: ${base.name} (${base.abbreviation})`);

    for (const u of group.units) {
      if (u.isBase) continue;

      const record = await prisma.unitOfMeasure.upsert({
        where:  { abbreviation: u.abbreviation },
        update: { name: u.name, category: group.category, kind: group.kind, factor: u.factor, baseUnitId: base.id },
        create: { name: u.name, abbreviation: u.abbreviation, category: group.category, kind: group.kind, factor: u.factor, baseUnitId: base.id },
      });

      const conversion = group.kind === "measure"
        ? `×${u.factor} ${base.abbreviation}`
        : u.factor > 1 ? `= ${u.factor} ${base.abbreviation}` : "";

      console.log(`    → ${record.name} (${record.abbreviation}) ${conversion}`);
    }
    console.log();
  }

  console.log("✅  Seed concluído.");
}

module.exports = seed;

// Só corre sozinho quando invocado directamente; via seed-all.js é apenas importado.
if (require.main === module) {
  seed()
    .catch((e) => { console.error(e); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}
