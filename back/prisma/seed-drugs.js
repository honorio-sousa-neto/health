const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* ─────────────────────────────────────────────
   Catálogo de Medicamentos (Comprimidos, Xaropes & Pomadas)
   ───────────────────────────────────────────── */
const CATALOGUE = [
  {
    area: "Enfermaria",
    subcategories: [
      {
        name: "Outros",
        services: [
          { name: "Materiais Comuns", unit_price: 500 },
        ],
      },
    ],
  },
  {
    area: "Farmácia",
    subcategories: [
      {
        name: "Comprimidos",
        services: [
          { name: "UNIPRIL 25 - CAPTOPRIL 25 MG COMP",               unit_price: 500 },
          { name: "ACEMOL 500MG COMP 10X10 (PARACETAMOL)",            unit_price: 500 },
          { name: "Luther 24 COMP (ARTEMETER)",                       unit_price: 2000 },
          { name: "Albendazol 400 mg - Capsula de 20 Comp",           unit_price: 500 },
          { name: "Amoxaciclina 250mg - Capsula de 10 Comp",          unit_price: 500 },
          { name: "Amoxaciclina 500mg - Capsula de 10 Comp",          unit_price: 500 },
          { name: "Ciproflaxacina – 500mg - Capsula de 10 Comp",      unit_price: 1500 },
          { name: "Vitamina C 500mg",                                 unit_price: 500 },
          { name: "Davimeth 20/120mg - COARTEN",                      unit_price: 1000 },
          { name: "Davimeth 80/480mg - COARTEN",                      unit_price: 1000 },
          { name: "Metronidazol 500mg",                               unit_price: 500 },
          { name: "Metronidazol 250mg",                               unit_price: 500 },
          { name: "Ibuprofeno 200mg comprimido",                      unit_price: 500 },
          { name: "Ibuprofeno 400mg comprimido",                      unit_price: 1000 },
          { name: "Nolotil comp",                                     unit_price: 2500 },
          { name: "Multivitamina",                                    unit_price: 500 },
          { name: "Vitamina b complexo",                              unit_price: 500 },
          { name: "Vitamina B6",                                      unit_price: 500 },
          { name: "Acido fólico 5 mg",                                unit_price: 500 },
          { name: "Clorfenaramina",                                   unit_price: 500 },
          { name: "Neurobion comp",                                   unit_price: 500 },
          { name: "Hidrocortiazida 25mg",                             unit_price: 500 },
          { name: "Mexagripe",                                        unit_price: 1000 },
          { name: "Azitromicina 500mg",                               unit_price: 1500 },
          { name: "Clavamox 625mg",                                   unit_price: 5000 },
          { name: "Claritromecina",                                   unit_price: 2500 },
          { name: "Sulfato de Zinco",                                 unit_price: 500 },
          { name: "Metronidazol Óvulos",                              unit_price: 1000 },
          { name: "BUSCOCINE 10MG COMPR (HIOSCINA BUTYBROMIDE) 10X10/ CAIX", unit_price: 500 },
          { name: "AUGMENTIN 500MG + 125MG 14 COMP",                  unit_price: 4000 },
          { name: "UNIPRAZOLE 20 - OMEPRAZOLE 20MG CAPS (10X10)",     unit_price: 500 },
          { name: "NOVASPRIN BP 100MG COMP (ASPIRINA)",                unit_price: 500 },
          { name: "LEVOQUE 750 MG COMP (LEVOFLOXACINA)",              unit_price: 500 },
          { name: "Co-trimoxazol",                                     unit_price: 500 },
          { name: "Doxacicliina",                                      unit_price: 500 },
          { name: "Dipirona 500 mg",                                   unit_price: 500 },
          { name: "Enalapril 20 mg",                                   unit_price: 500 },
          { name: "Enalapril 10mg",                                    unit_price: 500 },
          { name: "Cimetidina",                                        unit_price: 1000 },
          { name: "cefalexina 500mg",                                  unit_price: 1500 },
          { name: "Losartan 50mg+ Hidrocortizida 12,5mg",              unit_price: 500 },
          { name: "Metocloparamida 10mg",                              unit_price: 500 },
          { name: "Amilodopina 10 mg",                                 unit_price: 500 },
          { name: "BIO-RITMO 10ML BEBÍVEIS",                           unit_price: 1000 },
          { name: "Metformina 500mg",                                  unit_price: 500 },
          { name: "Furesemida 40 mg",                                  unit_price: 500 },
          { name: "Metformina 1000mg",                                 unit_price: 500 },
          { name: "UNICLAV 1000MG (Amoxicilina + Ácido Clavulânico)",  unit_price: 2500 },
          { name: "Losartan 50mg",                                     unit_price: 500 },
          { name: "Vastro Sistente (Bissacudil)",                      unit_price: 500 },
          { name: "Nitrofurantoína 100mg",                             unit_price: 500 },
          { name: "Anaflan 500mg",                                     unit_price: 500 },
          { name: "Vuradantina 100mg",                                 unit_price: 500 },
          { name: "Ferro + Ácido fólico",                              unit_price: 500 },
          { name: "Ardomente 250mg ou Aldonext",                       unit_price: 500 },
          { name: "Clarinex",                                          unit_price: 500 },
          { name: "Cloridrato de Amitriflina 25mg",                    unit_price: 500 },
          { name: "Vaginext",                                          unit_price: 500 },
        ],
      },
      {
        name: "Xarope",
        services: [
          { name: "Ibuprofeno Xarope",                                unit_price: 1500 },
          { name: "Mebendazol xarope",                                unit_price: 1500 },
          { name: "Metronidazol Xarope",                              unit_price: 1500 },
          { name: "Amoxacilina 250mg xarope",                         unit_price: 1500 },
          { name: "Paracetamol 125mg",                                unit_price: 1500 },
          { name: "Multivitamina Xarope",                             unit_price: 1500 },
          { name: "Albendazol Xarope 200mg/5ml",                      unit_price: 1500 },
          { name: "Vitamina C Xarope",                                unit_price: 1500 },
          { name: "Complexo B Xarope",                                unit_price: 1500 },
          { name: "Agumentim",                                        unit_price: 1500 },
          { name: "Bromexina Expectorante Adulto",                     unit_price: 1500 },
          { name: "Bissolvon Linctus Criança 0,8mg/ml 200ml Xarope",  unit_price: 12000 },
          { name: "Bissolvon Linctus Adulto 1,6mg/ml 200ml Xarope",   unit_price: 14000 },
          { name: "Metocloparamida xarope",                            unit_price: 1500 },
          { name: "Sangrez",                                           unit_price: 1500 },
          { name: "Kaucure 100mg",                                     unit_price: 1500 },
          { name: "Clorafinicol 125mg",                                unit_price: 1500 },
          { name: "Clavamox 250+62,5mg/5ml Oral",                      unit_price: 10000 },
          { name: "Clavamox 125+31,25mg/5ml Oral",                     unit_price: 6000 },
          { name: "Ambroxol Xarope 30mg/5ml Adulto",                   unit_price: 1500 },
          { name: "Ambroxol Xarope 15mg/5ml Criança",                  unit_price: 1500 },
          { name: "Ambroxol Xarope 3mg/ml (Broncosil) 200ml",         unit_price: 5000 },
          { name: "Amroxol Xarope 6mg/ml (Broconsil) 200 ml",         unit_price: 5000 },
          { name: "Ciprofloxacina 250 mg - Sabor Morango",             unit_price: 1500 },
          { name: "Ciprofloxacina 250 mg - Sabor Laranja",             unit_price: 1500 },
          { name: "Bromexina Criança 4mg/5ml",                         unit_price: 1500 },
        ],
      },
      {
        name: "Injetáveis",
        services: [
          // ── Alfa → 500 Kz ───────────────────────────────────────────────────
          { name: "METOCLOPRAMIDA 10MG/2ML INJEÇÃO 100 AMPOLAS/ CAIXA",     unit_price: 500, classificacao: "Alfa" },
          { name: "DEXAMETASONA 4MG/ML INJEÇÃO 100 ampolas",                unit_price: 500, classificacao: "Alfa" },
          { name: "GENTAMICINA 80 MG/2ML INJEÇÃO (100 AMPOLAS/ CAIXA)",     unit_price: 500, classificacao: "Alfa" },
          { name: "Máscara de Nebulização",                                 unit_price: 500, classificacao: "Alfa" },
          { name: "DICLOFENACO 75/3ML",                                     unit_price: 500, classificacao: "Alfa" },
          { name: "Luther 20 MG /ML INJEÇAO (ARTEMETER) - COARTEN",        unit_price: 500, classificacao: "Alfa" },
          { name: "START 60 MG INJEÇÃO ARTESUNATO (1 ampola/caixinha)",     unit_price: 500, classificacao: "Alfa" },
          { name: "VITAMINA B COMPLEXO",                                    unit_price: 500, classificacao: "Alfa" },
          { name: "VITAMINA-C",                                             unit_price: 500, classificacao: "Alfa" },
          { name: "BUSCOPAN 10 MG",                                         unit_price: 500, classificacao: "Alfa" },
          { name: "VITAMINA B12 (CIANOCOBALINA) 100 ampolas",               unit_price: 500, classificacao: "Alfa" },
          { name: "Luther 80 MG/ ML INJEÇÃO (ARTEMETER) - COARTEN",        unit_price: 500, classificacao: "Alfa" },
          { name: "SUPOSITÓRIO 125ml",                                      unit_price: 500, classificacao: "Alfa" },
          { name: "PENICILINA CRISTALINA 1MEGA INJEÇÃO 50 FRASCOS/ CAIXA", unit_price: 500, classificacao: "Alfa" },
          { name: "PENICILINA BENZATINICA - 50 AMPOLAS",                    unit_price: 500, classificacao: "Alfa" },
          { name: "TRAMADOL Injetavél 10 mg",                               unit_price: 500, classificacao: "Alfa" },
          { name: "CLINDAMICINA 150MG/1ML",                                 unit_price: 500, classificacao: "Alfa" },
          { name: "AMOXICILINA 1GM INJEÇÃO",                                unit_price: 500, classificacao: "Alfa" },
          { name: "START 120 MG INJEÇÃO ARTESUNATO (2 ampola/caixinha)",    unit_price: 500, classificacao: "Alfa" },
          { name: "FUROSEMIDA 20 MG",                                       unit_price: 500, classificacao: "Alfa" },
          { name: "CIMITIDINA 200 MG",                                      unit_price: 500, classificacao: "Alfa" },
          { name: "OMeprazol Injetavel",                                    unit_price: 500, classificacao: "Alfa" },
          { name: "START 180 MG INJEÇÃO ARTESUNATO (3 ampola/caixinha)",    unit_price: 500, classificacao: "Alfa" },
          { name: "HIDROCORTIZONA",                                         unit_price: 500, classificacao: "Alfa" },
          { name: "VITAMNA B6 100MG",                                       unit_price: 500, classificacao: "Alfa" },
          { name: "Aminofilina",                                            unit_price: 500, classificacao: "Alfa" },
          // ── Beta → 1000 Kz ──────────────────────────────────────────────────
          { name: "TRICHOCEFT 1 GM INJEÇÃO (CEFTRIAXONA)",                 unit_price: 1000, classificacao: "Beta" },
          { name: "DIPIRONA 2,5g/5ml sol injet 50 Ampolas (METAMIZOL)",    unit_price: 1000, classificacao: "Beta" },
          { name: "DIAZENPAN 10 MG",                                        unit_price: 1000, classificacao: "Beta" },
          { name: "LIDOCAINA",                                              unit_price: 1000, classificacao: "Beta" },
          { name: "Sabotamol",                                              unit_price: 1000, classificacao: "Beta" },
          { name: "CIPROFLOXACINA 200mg",                                   unit_price: 1000, classificacao: "Beta" },
          { name: "METRONIDAZOL 500mg",                                     unit_price: 1000, classificacao: "Beta" },
          { name: "START 240 MG INJEÇÃO ARTESUNATO (3 ampola/caixinha)",   unit_price: 1000, classificacao: "Beta" },
          { name: "TROBISEN-SPECTIOMICINA 2mg",                             unit_price: 1000, classificacao: "Beta" },
          // ── Gama → 1500 Kz ──────────────────────────────────────────────────
          { name: "LACTATO RINGER 500ML",                                   unit_price: 1500, classificacao: "Gama" },
          { name: "CLORETO DE SODIO 500ML",                                 unit_price: 1500, classificacao: "Gama" },
          { name: "DESTROSE 5% 500ml",                                      unit_price: 1500, classificacao: "Gama" },
          { name: "START 150 MG INJEÇÃO ARTESUNATO (3ampola/caixinha)",    unit_price: 1500, classificacao: "Gama" },
        ],
      },
      {
        name: "Pomadas",
        services: [
          { name: "Neomicina 15 g",                                    unit_price: 500 },
          { name: "Hidrocortizona",                                    unit_price: 500 },
          { name: "Ácido Benzoico",                                    unit_price: 6000 },
          { name: "Dexametazona",                                      unit_price: 1000 },
          { name: "Criseoforvina",                                     unit_price: 5000 },
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

/**
 * Doses por embalagem vendável, extraídas do NOME (ex.: "Capsula de 20 Comp" -> 20;
 * "10X10" -> 10 comprimidos por cartela). Formas líquidas/injetáveis ficam null
 * (vendem-se por frasco/ampola, 1:1). Alinhado com
 * scripts/preencher-unidades-embalagem.ts.
 */
function parsePackSize(name) {
  const s = String(name || "");
  if (/(xarope|susp|soluç|gotas|inje|injec|amp\b|ampola|ml\b|bebÍvel|bebivel|linctus)/i.test(s)) return null;
  const nxm = s.match(/\b(\d+)\s*[xX]\s*(\d+)\b/);
  if (nxm) return Number(nxm[2]);
  const m = s.match(/(\d+)\s*(?:comprimidos?|comp|cáps(?:ulas?)?|caps)\b/i);
  if (m && !/\d+\s*(mg|ml|g|mcg|µg)/i.test(m[0])) {
    const q = Number(m[1]);
    if (q >= 2 && q <= 1000) return q;
  }
  return null;
}

async function findOrCreateService(name, categoryId, unit_price, extras = {}) {
  const existing = await prisma.service.findFirst({
    where: { name, categoryId },
  });
  if (existing) {
    return { record: existing, created: false };
  }
  const record = await prisma.service.create({
    data: { name, categoryId, unit_price, type: "PRODUCT", status: "AVAILABLE", ...extras },
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
    console.log(`\n▸ ${area.area}`);

    for (const sub of area.subcategories) {
      const subCat = await findOrCreateCategory(sub.name, parent.id);
      console.log(`  ├─ ${sub.name}`);

      for (const svc of sub.services) {
        const { sale_price, classificacao, unit_price, name } = svc;
        const extras = {};
        if (sale_price   !== undefined) extras.sale_price    = sale_price;
        if (classificacao !== undefined) extras.classificacao = classificacao;
        const perPackage = parsePackSize(name);
        if (perPackage) extras.unitsPerPackage = perPackage;
        const { record, created } = await findOrCreateService(name, subCat.id, unit_price, extras);
        if (created) {
          totalServices++;
          const tag = classificacao ? ` [${classificacao}]` : "";
          console.log(`  │   ✓ ${name}  (${unit_price.toLocaleString()} Kz)${tag}`);
        } else {
          console.log(`  │   · ${name}  [já existe]`);
        }
      }
    }

    totalCategories++;
  }

  console.log(`\n✅  Concluído — ${totalCategories} áreas processadas, ${totalServices} medicamentos criados.\n`);
}

module.exports = main;

// Só corre sozinho quando invocado directamente; via seed-all.js é apenas importado.
if (require.main === module) {
  main()
    .catch((e) => { console.error(e); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}
