const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* ─────────────────────────────────────────────
   Full catalogue from the official Precário PDF
   ───────────────────────────────────────────── */
const CATALOGUE = [
  {
    area: "Enfermaria",
    subcategories: [
      {
        name: "Consultas",
        services: [
          { name: "Consulta Normal (1.ª encontro)",         unit_price: 6000 },
          { name: "Consulta Especial",                      unit_price: 5000 },
          { name: "Consulta de Especialidade (Sem Marcação)", unit_price: 10000 },
          { name: "Consulta de Controlo",                   unit_price: 0 },
        ],
      },
      {
        name: "Emergência (Noturno)",
        services: [
          { name: "Consulta de Emergência",          unit_price: 15000 },
          { name: "Observação de Emergência (1h)",   unit_price: 20000 },
        ],
      },
      {
        name: "Administração de Fármacos",
        services: [
          { name: "Administração de Fármacos (IM)",        unit_price: 5000 },
          { name: "Administração de vacina (Tétano)",      unit_price: 5000 },
          { name: "Administração de vacina (Hepatite-B)",  unit_price: 7500 },
          { name: "Administração de Fármacos (IV)",        unit_price: 7500 },
        ],
      },
      {
        name: "Observação",
        services: [
          { name: "Observação 1h (Alfa)",  unit_price: 15000 },
          { name: "Observação 2h (Beta)",  unit_price: 20000 },
          { name: "Observação 3h (Gama)",  unit_price: 25000 },
          { name: "Observação 4h (Delta)", unit_price: 30000 },
        ],
      },
      {
        name: "Internamento",
        services: [
          { name: "Internamento 6h (Alfa)",  unit_price: 50000 },
          { name: "Internamento 12h (Beta)", unit_price: 75000 },
          { name: "Internamento 24h (Gama)", unit_price: 100000 },
        ],
      },
      {
        name: "Enfermaria",
        services: [
          { name: "Nebulização Simples",        unit_price: 6000 },
          { name: "Pequenas Cirurgias (Alfa)",  unit_price: 7500 },
          { name: "Pequenas Cirurgias (Beta)",  unit_price: 12500 },
          { name: "Pequenas Cirurgias (Gama)",  unit_price: 17500 },
        ],
      },
      {
        name: "Outros",
        services: [
          { name: "Justificativo Médico",                    unit_price: 2500 },
          { name: "Atestado Médico",                         unit_price: 3500 },
          { name: "Atestado Médico (Carta de Condução)",     unit_price: 5000 },
        ],
      },
    ],
  },

  {
    area: "Laboratório",
    subcategories: [
      {
        name: "Serologia",
        services: [
          { name: "VDRL",                    unit_price: 3500 },
          { name: "HIV",                     unit_price: 5000 },
          { name: "HCV",                     unit_price: 3500 },
          { name: "TASO",                    unit_price: 3500 },
          { name: "Fator Reumatoide",        unit_price: 3500 },
          { name: "PCR",                     unit_price: 3500 },
          { name: "Reacção Widal",           unit_price: 3500 },
          { name: "HCG (Teste de Gravidez)", unit_price: 3500 },
          { name: "HBS Ag",                  unit_price: 3500 },
          { name: "Dengue",                  unit_price: 5000 },
          { name: "Chicungunha",             unit_price: 7000 },
        ],
      },
      {
        name: "Hematologia",
        services: [
          { name: "V.S",               unit_price: 3500 },
          { name: "Grupo Sanguíneo",   unit_price: 3500 },
          { name: "Falciformação",     unit_price: 4000 },
          { name: "Hemograma Completo", unit_price: 8000 },
        ],
      },
      {
        name: "Parasitologia",
        services: [
          { name: "Urina",            unit_price: 3500 },
          { name: "Fezes",            unit_price: 4500 },
          { name: "Gota Espessa",     unit_price: 2000 },
          { name: "Espermograma",     unit_price: 7500 },
          { name: "Exudado Vaginal",  unit_price: 4500 },
        ],
      },
      {
        name: "Bioquímica",
        services: [
          { name: "Bilirrubina Total",   unit_price: 5000 },
          { name: "Bilirrubina Direta",  unit_price: 5000 },
          { name: "Creatinina",          unit_price: 5000 },
          { name: "Colesterol",          unit_price: 5000 },
          { name: "Ureia",               unit_price: 5000 },
          { name: "Ácido Úrico",         unit_price: 5000 },
          { name: "Glucose",             unit_price: 5000 },
          { name: "Glicemia",            unit_price: 5000 },
          { name: "TGO",                 unit_price: 5000 },
          { name: "TGP",                 unit_price: 5000 },
          { name: "TH+TC",               unit_price: 3500 },
          { name: "HDL",                 unit_price: 5000 },
          { name: "LDL",                 unit_price: 5000 },
          { name: "VLDL",                unit_price: 5000 },
          { name: "Triglicerídeos",      unit_price: 5000 },
        ],
      },
    ],
  },

  {
    area: "Estomatologia",
    subcategories: [
      {
        name: "Consultas",
        services: [
          { name: "1.ª Consulta",                          unit_price: 5000 },
          { name: "Consulta Normal (Marcada)",             unit_price: 6000 },
          { name: "Consulta Urgente (Sem Marcação)",       unit_price: 7500 },
        ],
      },
      {
        name: "Periodontia",
        services: [
          { name: "Destartarização",        unit_price: 7500 },
          { name: "Curetagem Subgengival",  unit_price: 10000 },
          { name: "Próflacia Simples",      unit_price: 12000 },
          { name: "Próflacia Completa",     unit_price: 15000 },
        ],
      },
      {
        name: "Dentisteria Operatória",
        services: [
          { name: "Clareamento com LED",                          unit_price: 70000 },
          { name: "Aplicação Selantes de Fissuras (por dente)",   unit_price: 7500 },
          { name: "Colagem de Fragmentos",                        unit_price: 15000 },
          { name: "Restauração 1 fase resina fotopolimerizada",   unit_price: 17000 },
          { name: "Exames Radiológicos (Estomatologia)",          unit_price: 20000 },
          { name: "Restauração 3 fases resina fotopolimerizada",  unit_price: 22000 },
          { name: "Restauração Temporária",                       unit_price: 15000 },
        ],
      },
      {
        name: "Endodontia",
        services: [
          { name: "Endodontia de Incisivo a Canino",          unit_price: 20000 },
          { name: "Endodontia de Pré-Molares",                unit_price: 25000 },
          { name: "Endodontia de Molares",                    unit_price: 30000 },
          { name: "Retratamento de Pré-Molares e Molares",    unit_price: 32000 },
          { name: "Retratamento de Incisivo e Caninos",       unit_price: 37000 },
        ],
      },
      {
        name: "Cirurgia Oral",
        services: [
          { name: "Extração (Raiz Residual)",                 unit_price: 15000 },
          { name: "Extração de Dentes Anteriores",            unit_price: 16500 },
          { name: "Extração de Pré-Molares",                  unit_price: 20000 },
          { name: "Extração de Molares e Inclusos (Ciso)",    unit_price: 27000 },
          { name: "Extração de Molares",                      unit_price: 25000 },
          { name: "Extração de Dentes Supranumerários",       unit_price: 27000 },
          { name: "Curetagem Cirúrgica",                      unit_price: 13000 },
          { name: "Remoção de Sutura",                        unit_price: 5000 },
          { name: "Cirurgia de Retalho (Extração)",           unit_price: 20000 },
        ],
      },
      {
        name: "Raio-X (Estomatologia)",
        services: [
          { name: "Raio-X (Estomatologia)", unit_price: 10000 },
        ],
      },
    ],
  },

  {
    area: "Radiologia",
    subcategories: [
      {
        name: "Exames Radiológicos",
        services: [
          { name: "Raio X do Tórax AP",               unit_price: 15000 },
          { name: "Raio X do Tórax AP + Perfil",      unit_price: 17000 },
          { name: "Raio X do Abdómen",                unit_price: 15000 },
          { name: "Raio X do Abdómen + Perfil",       unit_price: 17000 },
          { name: "Raio X do Crânio AP + Perfil",     unit_price: 20000 },
          { name: "Raio X do Braço",                  unit_price: 14000 },
          { name: "Raio X do Braço Axial",            unit_price: 14000 },
          { name: "Raio X do Antebraço AP + Perfil",  unit_price: 20000 },
          { name: "Raio X do Punho AP + Perfil",      unit_price: 17000 },
          { name: "Raio X da Mão AP + Perfil",        unit_price: 14000 },
          { name: "Raio X da Bacia (Pélvis)",         unit_price: 20000 },
          { name: "Raio X da Coluna Cervical",        unit_price: 18000 },
          { name: "Raio X da Coluna Dorsal (Torácica)", unit_price: 18000 },
          { name: "Raio X da Coluna Lombar",          unit_price: 18000 },
          { name: "Raio X da Coluna Total",           unit_price: 30000 },
          { name: "Raio X do Fémur AP + Perfil",      unit_price: 20000 },
          { name: "Raio X do Joelho AP + Perfil",     unit_price: 20000 },
          { name: "Raio X do Joelho Comparativo",     unit_price: 25000 },
          { name: "Raio X do Tornozelo AP + Perfil",  unit_price: 20000 },
          { name: "Raio X da Perna AP + Perfil",      unit_price: 18000 },
          { name: "Raio X do Pé AP + Perfil",         unit_price: 18000 },
          { name: "Raio X do Ombro",                  unit_price: 13000 },
        ],
      },
      {
        name: "Exames Especiais (Radiologia)",
        services: [
          { name: "Raio X Seios Perinasais",     unit_price: 23000 },
          { name: "Técnica de Cavu",             unit_price: 25000 },
          { name: "Técnica de Rótula",           unit_price: 22000 },
          { name: "Técnica de Rã",               unit_price: 27000 },
          { name: "Técnica de Joelho em Carga",  unit_price: 28000 },
        ],
      },
    ],
  },

  {
    area: "Ecografia & Especialidades",
    subcategories: [
      {
        name: "Eletrocardiograma",
        services: [
          { name: "Eletrocardiograma", unit_price: 10000 },
        ],
      },
      {
        name: "Ecografia",
        services: [
          { name: "Ecografia Pélvica",        unit_price: 10000 },
          { name: "Ecografia Obstétrica",     unit_price: 7500 },
          { name: "Ecografia Mamária",        unit_price: 20000 },
          { name: "Ecografia Testicular (1x)", unit_price: 12000 },
          { name: "Ecografia Testicular (2x)", unit_price: 25000 },
          { name: "Ecografia Partes Moles",   unit_price: 15000 },
          { name: "Ecografia Abdominal",      unit_price: 15000 },
          { name: "Ecografia Renal",          unit_price: 15000 },
          { name: "Ecografia Morfológica",    unit_price: 30000 },
          { name: "Ecografia Transvaginal",   unit_price: 12000 },
          { name: "Ecografia Endovaginal",    unit_price: 16000 },
          { name: "Ecografia Prostática",     unit_price: 15000 },
          { name: "Ecocardiograma",           unit_price: 25000 },
        ],
      },
      {
        name: "Especialidades",
        services: [
          { name: "Obstetrícia",    unit_price: 6000 },
          { name: "Ginecologia",    unit_price: 7500 },
          { name: "Pediatria",      unit_price: 5000 },
          { name: "Cardiologia",    unit_price: 15000 },
          { name: "Pré-Natal",      unit_price: 6000 },
          { name: "Dermatologia",   unit_price: 10000 },
        ],
      },
    ],
  },
];

/* ────────────────────────────────────────
   Helpers
   ──────────────────────────────────────── */
async function findOrCreateCategory(name, parentId = null) {
  const existing = await prisma.category.findFirst({
    where: { name, categoryId: parentId ?? null },
  });
  if (existing) return existing;
  return prisma.category.create({ data: { name, categoryId: parentId } });
}

async function findOrCreateService(name, categoryId, unit_price) {
  const existing = await prisma.service.findFirst({
    where: { name, categoryId },
  });
  if (existing) {
    return { record: existing, created: false };
  }
  const record = await prisma.service.create({
    data: { name, categoryId, unit_price, type: "PRODUCT", status: "AVAILABLE" },
  });
  return { record, created: true };
}

/* ────────────────────────────────────────
   Main
   ──────────────────────────────────────── */
async function main() {
  let totalCategories = 0;
  let totalServices = 0;

  for (const area of CATALOGUE) {
    const parent = await findOrCreateCategory(area.area);
    const isNew = !(await prisma.category.findFirst({ where: { name: area.area } })) === false;
    console.log(`\n▸ ${area.area}`);

    for (const sub of area.subcategories) {
      const subCat = await findOrCreateCategory(sub.name, parent.id);
      console.log(`  ├─ ${sub.name}`);

      for (const svc of sub.services) {
        const { record, created } = await findOrCreateService(svc.name, subCat.id, svc.unit_price);
        if (created) {
          totalServices++;
          console.log(`  │   ✓ ${svc.name}  (${svc.unit_price.toLocaleString()} Kz)`);
        } else {
          console.log(`  │   · ${svc.name}  [já existe]`);
        }
      }
    }

    totalCategories++;
  }

  console.log(`\n✅  Concluído — ${totalCategories} áreas processadas, ${totalServices} serviços criados.\n`);
}

module.exports = main;

// Só corre sozinho quando invocado directamente; via seed-all.js é apenas importado.
if (require.main === module) {
  main()
    .catch((e) => { console.error(e); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}
