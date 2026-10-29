/**
 * Gera o ficheiro de revisão das receitas (consumo padrão) das Observações,
 * a partir da folha Enfermaria do Mapa de Rentabilidade/Custeio.
 *
 *   npx ts-node scripts/gerar-receitas-observacao.ts
 *
 * Produz receitas-observacao.xlsx no mesmo formato do da serologia, para ser
 * aplicado com scripts/aplicar-receitas.ts.
 *
 * ── O que fica DE FORA e porquê ────────────────────────────────────────────
 *  1. Bloco EXAMES (Gota espessa, Widal, Serológico, Bioquímica, Hemograma):
 *     são serviços, não materiais. O laboratório já declara o consumo dos seus
 *     próprios reagentes ao realizar cada exame — incluí-los aqui contaria o
 *     consumo duas vezes. Além disso "Serológico" e "Bioquímica" são nomes de
 *     categoria, não de exames concretos.
 *  2. Avenças (10% do preço em todos): é comissão do clínico, não material.
 *     O modelo de consumo padrão só cobre stock.
 *  3. Fármacos (Dipirona, Artemeter, Diclofenac, Vitaminas, Paracetamol,
 *     Coartem): existem no catálogo da Farmácia, mas com o preço de VENDA e em
 *     apresentações que a folha não desambigua (Artemeter 20 ou 80 mg?, dose
 *     avulsa vs caixa de 50 ampolas). Ligá-los a adivinhar produziria deduções
 *     erradas de medicação. Ficam pendentes de decisão.
 */
import ExcelJS from "exceljs";
import { prisma } from "../src/database/prisma";

const OUT = "/home/hon-rio-sousa/Development/Node/health/receitas-observacao.xlsx";

type Consumivel = {
  nome: string;
  material: "reagent" | "consumable" | "equipment" | "epi" | "glassware" | "standardSolution";
  unidade: string;
  preco: number;
  novo: boolean;
  notas: string;
};

const CONSUMIVEIS: Consumivel[] = [
  // já criados na importação da serologia — mantidos com o preço actual do catálogo
  { nome: "Luvas de exame",      material: "epi",        unidade: "par", preco: 35, novo: false, notas: "Já existe no catálogo" },
  { nome: "Álcool (aplicação)",  material: "consumable", unidade: "un",  preco: 20, novo: false, notas: "Já existe a 20; esta folha indicava 10 (ver nota no resumo)" },
  { nome: "Algodão (aplicação)", material: "consumable", unidade: "un",  preco: 20, novo: false, notas: "Já existe no catálogo" },
  { nome: "Seringa descartável", material: "consumable", unidade: "un",  preco: 50, novo: false, notas: "Já existe no catálogo" },
  // novos
  { nome: "Máscara descartável", material: "epi",        unidade: "un",  preco: 40,    novo: true, notas: "" },
  { nome: "Agulha descartável",  material: "consumable", unidade: "un",  preco: 12.43, novo: true, notas: "" },
  { nome: "Soro fisiológico",    material: "consumable", unidade: "fr",  preco: 850,   novo: true, notas: "" },
  { nome: "Sistema de soro",     material: "consumable", unidade: "un",  preco: 200,   novo: true, notas: "" },
  { nome: "Bránula",             material: "consumable", unidade: "un",  preco: 145,   novo: true, notas: "Grafado \"Branula\" na folha" },
  { nome: "Adesivo",             material: "consumable", unidade: "un",  preco: 32,    novo: true, notas: "Grafado \"Adisivo\" na folha" },
];

// nome do serviço no sistema -> quantidades por material
const RECEITAS: Record<string, Record<string, number>> = {
  "Observação 1h (Alfa)":  { base: 1, seringa: 1 },
  "Observação 2h (Beta)":  { base: 2, seringa: 2 },
  "Observação 3h (Gama)":  { base: 3, seringa: 2 },
  "Observação 4h (Delta)": { base: 3, seringa: 2 },
};

const MATERIAIS_BASE = [
  "Máscara descartável", "Luvas de exame", "Álcool (aplicação)", "Algodão (aplicação)",
  "Agulha descartável", "Soro fisiológico", "Sistema de soro", "Bránula", "Adesivo",
];

const MANUTENCAO = 1818.18;
const round = (n: number, c = 2) => Number(n.toFixed(c));

async function main() {
  const servicos = await prisma.service.findMany({
    where: { deletedAt: null, category: { name: "Observação" } },
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
    [26, 18, 11, 12, 13, 9, 56]);
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
    [26, 38, 26, 15, 15]);

  let linha = 2;
  const resumo: any[] = [];

  for (const s of servicos) {
    const rc = RECEITAS[s.name];
    if (!rc) continue;
    const itens = [
      ...MATERIAIS_BASE.map((n) => ({ nome: n, qtd: rc.base })),
      { nome: "Seringa descartável", qtd: rc.seringa },
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
    resumo.push({ nome: s.name, preco: s.unit_price ?? 0, custo: round(custo) });
  }

  await wb.xlsx.writeFile(OUT);

  console.log("Gerado:", OUT);
  console.log(`Consumíveis: ${CONSUMIVEIS.length} (novos: ${CONSUMIVEIS.filter(c=>c.novo).length}) | Serviços: ${resumo.length}\n`);
  console.log("SERVIÇO".padEnd(24) + "PREÇO".padStart(9) + "MATERIAIS".padStart(12) + "  (só materiais — sem fármacos, exames nem avenças)");
  console.log("-".repeat(82));
  resumo.forEach((r) =>
    console.log(r.nome.padEnd(24) + String(r.preco).padStart(9) + r.custo.toFixed(2).padStart(12))
  );
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
