/**
 * Gera o ficheiro de revisão das receitas (consumo padrão) da Ecografia.
 *
 *   npx ts-node scripts/gerar-receitas-ecografia.ts
 *
 * Aplica-se depois com scripts/aplicar-receitas.ts.
 *
 * Base comum a todas as ecografias: Luvas + Rolo de papel + Guardanapos + Gel.
 * Alguns acrescentam Máscara; as Morfológicas acrescentam Espéculo. A
 * Ginecologia tem estrutura própria (papel descartável em vez de guardanapos).
 * Ecógrafo e Marquesa são equipamento — ficam de fora.
 *
 * ── Fica DE FORA ───────────────────────────────────────────────────────────
 *  Avença (35% do preço; 40% no Electrocardiograma): comissão do clínico, não
 *  material. Nota: a Ecografia Transvaginal é a única das 16 sem avença na
 *  folha — é o que explica os seus 82% de margem contra 47% de serviços
 *  equivalentes ao mesmo preço.
 *
 * ── Preços que divergem do catálogo (mantidos os do catálogo) ──────────────
 *  Luvas 33,50 nesta folha vs 35 no catálogo (lab/enfermaria/radiologia).
 *  Máscara 25 nesta folha vs 40 no catálogo.
 *  Guardanapos oscila entre 15 e 25 dentro da própria folha; adoptado 15 (12
 *  dos 16 exames).
 */
import ExcelJS from "exceljs";
import { prisma } from "../src/database/prisma";

const OUT = "/home/hon-rio-sousa/Development/Node/health/receitas-ecografia.xlsx";

type Consumivel = {
  nome: string;
  material: "reagent" | "consumable" | "equipment" | "epi" | "glassware" | "standardSolution";
  unidade: string;
  preco: number;
  novo: boolean;
  notas: string;
};

const CONSUMIVEIS: Consumivel[] = [
  { nome: "Luvas de exame",      material: "epi",        unidade: "par",  preco: 35,   novo: false, notas: "Catálogo a 35; esta folha indica 33,50" },
  { nome: "Máscara descartável", material: "epi",        unidade: "un",   preco: 40,   novo: false, notas: "Catálogo a 40; esta folha indica 25" },
  { nome: "Rolo de papel",       material: "consumable", unidade: "rolo", preco: 980,  novo: true,  notas: "" },
  { nome: "Guardanapos",         material: "consumable", unidade: "un",   preco: 15,   novo: true,  notas: "Folha oscila entre 15 e 25; adoptado 15 (12 dos 16)" },
  { nome: "Gel de ecografia",    material: "consumable", unidade: "fr",   preco: 225,  novo: true,  notas: "" },
  { nome: "Espéculo",            material: "consumable", unidade: "un",   preco: 1000, novo: true,  notas: "Só nas Morfológicas" },
  { nome: "Papel descartável",   material: "consumable", unidade: "un",   preco: 2500, novo: true,  notas: "Só na Ginecologia; já é custo por utilização (100 000 / 40)" },
];

/** nome no sistema -> { máscara?, espéculo?, ginecologia? } */
const RECEITAS: Record<string, { mascara?: boolean; especulo?: boolean; gineco?: boolean }> = {
  "Ecografia Pélvica":         { mascara: true },
  "Eletrocardiograma":         { mascara: true },
  "Ecografia Prostática":      { mascara: true },
  "Ecocardiograma":            { mascara: true },
  "Ecografia Obstétrica":      {},
  "Ecografia Mamária":         {},
  "Ecografia Partes Moles":    {},
  "Ecografia Renal":           {},
  "Ecografia Abdominal":       {},
  "Ecografia Transvaginal":    {},
  // A folha custeia "Morfológica 1º" e "2º Semestre"; o sistema tem uma só
  // Morfológica. Os consumíveis são idênticos nas duas (só a avença difere),
  // pelo que a receita é a mesma independentemente da variante.
  "Ecografia Morfológica":     { especulo: true },
  // A folha custeia uma "Ecografia Testicular"; o sistema separa 1x e 2x.
  // Os materiais são os mesmos (base), muda apenas o número de incidências.
  "Ecografia Testicular (1x)": {},
  "Ecografia Testicular (2x)": {},
  "Ginecologia":               { gineco: true },
};

/** Custeados na folha mas inexistentes no catálogo do sistema */
const SEM_SERVICO = ["Ecografia Tiróide", "Ecografia Joelho", "Ecografia Ombro"];

const MANUTENCAO = 1481.48;
const round = (n: number, c = 2) => Number(n.toFixed(c));

async function main() {
  const servicos = await prisma.service.findMany({
    where: { deletedAt: null, category: { category: { name: { startsWith: "Ecografia" } } } },
    select: { id: true, name: true, unit_price: true },
    orderBy: { name: "asc" },
  });

  const precoDe = new Map(CONSUMIVEIS.map((c) => [c.nome, c]));
  const wb = new ExcelJS.Workbook();
  const HEAD = "FFE8EEF7";
  const cabecalho = (ws: ExcelJS.Worksheet, cols: string[], larguras: number[]) => {
    cols.forEach((h, i) => {
      const cell = ws.getCell(1, i + 1);
      cell.value = h;
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEAD } };
    });
    larguras.forEach((w, i) => (ws.getColumn(i + 1).width = w));
    ws.views = [{ state: "frozen", ySplit: 1 }];
  };

  const wsC = wb.addWorksheet("Consumíveis");
  cabecalho(wsC, ["Nome", "Tipo de material", "Unidade", "Preço", "Rendimento", "Novo?", "Notas"],
    [24, 18, 11, 12, 13, 11, 66]);
  CONSUMIVEIS.forEach((c, i) => {
    const r = i + 2;
    wsC.getCell(r, 1).value = c.nome;
    wsC.getCell(r, 2).value = c.material;
    wsC.getCell(r, 3).value = c.unidade;
    wsC.getCell(r, 4).value = c.preco;
    wsC.getCell(r, 5).value = 1;
    wsC.getCell(r, 6).value = c.novo ? "novo" : "existente";
    wsC.getCell(r, 7).value = c.notas;
    wsC.getCell(r, 4).numFmt = "#,##0.00";
    wsC.getCell(r, 7).font = { size: 9, italic: true, color: { argb: "FF777777" } };
  });

  const wsR = wb.addWorksheet("Receitas");
  cabecalho(wsR, ["Exame", "ID do exame", "Consumível", "Qtd por exame", "Custo da linha"],
    [30, 38, 24, 15, 15]);

  let linha = 2;
  const resumo: any[] = [];

  for (const s of servicos) {
    const rc = RECEITAS[s.name];
    if (!rc) continue;
    const itens = rc.gineco
      ? [
          { nome: "Luvas de exame", qtd: 1 },
          { nome: "Gel de ecografia", qtd: 1 },
          { nome: "Papel descartável", qtd: 1 },
          { nome: "Rolo de papel", qtd: 1 },
        ]
      : [
          { nome: "Luvas de exame", qtd: 1 },
          { nome: "Rolo de papel", qtd: 1 },
          { nome: "Guardanapos", qtd: 1 },
          { nome: "Gel de ecografia", qtd: 1 },
          ...(rc.mascara ? [{ nome: "Máscara descartável", qtd: 1 }] : []),
          ...(rc.especulo ? [{ nome: "Espéculo", qtd: 1 }] : []),
        ];

    let custo = 0;
    for (const it of itens) {
      const c = precoDe.get(it.nome)!;
      const valor = c.preco * it.qtd;
      custo += valor;
      wsR.getCell(linha, 1).value = s.name;
      wsR.getCell(linha, 2).value = s.id;
      wsR.getCell(linha, 3).value = it.nome;
      wsR.getCell(linha, 4).value = it.qtd;
      wsR.getCell(linha, 5).value = round(valor);
      wsR.getCell(linha, 2).font = { size: 8, color: { argb: "FF999999" } };
      wsR.getCell(linha, 5).numFmt = "#,##0.00";
      linha++;
    }
    const preco = s.unit_price ?? 0;
    const margem = preco - custo - MANUTENCAO;
    resumo.push({ nome: s.name, preco, custo: round(custo), margem: round(margem),
      pct: preco ? Math.round((margem / preco) * 100) : 0 });
  }

  await wb.xlsx.writeFile(OUT);

  console.log("Gerado:", OUT);
  console.log(`Consumíveis: ${CONSUMIVEIS.length} (novos: ${CONSUMIVEIS.filter(c=>c.novo).length}) | Exames: ${resumo.length}`);
  console.log(`\nCusteados na folha mas SEM serviço no sistema: ${SEM_SERVICO.join(", ")}`);
  const semCusteio = servicos.filter((s) => !RECEITAS[s.name]).map((s) => s.name);
  if (semCusteio.length) console.log(`No sistema mas SEM custeio na folha: ${semCusteio.join(", ")}`);
  console.log();
  console.log("EXAME".padEnd(30) + "PREÇO".padStart(8) + "CUSTO".padStart(11) + "MARGEM".padStart(12) + "    %");
  console.log("-".repeat(66));
  resumo.sort((a, b) => a.margem - b.margem).forEach((r) =>
    console.log(r.nome.padEnd(30) + String(r.preco).padStart(8) + r.custo.toFixed(2).padStart(11) +
      r.margem.toFixed(2).padStart(12) + String(r.pct).padStart(5) + "%")
  );
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
