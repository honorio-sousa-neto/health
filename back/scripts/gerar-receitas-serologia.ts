/**
 * Gera o ficheiro de revisão das receitas (consumo padrão) da Serologia,
 * a partir do Mapa de Rentabilidade/Custeio.
 *
 *   npx ts-node scripts/gerar-receitas-serologia.ts
 *
 * Produz receitas-serologia.xlsx com duas folhas:
 *   - Consumíveis: catálogo a criar (nome, tipo, unidade, preço, rendimento)
 *   - Receitas:    quanto cada exame consome de cada consumível
 *
 * Decisões tomadas sobre o mapa original (ver coluna "Notas"):
 *  1. Preço de embalagem passa a rendimento: onde o mapa indicava "25 testes" ou
 *     "26 pacientes" mas somava o pacote inteiro, o consumível fica com o preço
 *     do pacote e a receita consome a fracção (1/25 = 0,04). É o modelo correcto
 *     para stock — compra-se a caixa, gasta-se uma fracção por exame.
 *  2. Catálogo normalizado: Álcool, Tubo seco e Algodão passam a ter um preço
 *     único e a constar de TODOS os exames de colheita. No mapa o álcool tinha
 *     três preços (10/15/20) e o tubo/algodão faltavam em vários exames que,
 *     na prática, colhem sangue.
 */
import ExcelJS from "exceljs";
import { prisma } from "../src/database/prisma";

const OUT = "/home/hon-rio-sousa/Development/Node/health/receitas-serologia.xlsx";

type Consumivel = {
  nome: string;
  material: "reagent" | "consumable" | "equipment" | "epi" | "glassware" | "standardSolution";
  unidade: string;
  preco: number;
  rendimento: number;
  notas: string;
};

// ── Catálogo ────────────────────────────────────────────────────────────────
const PARTILHADOS: Consumivel[] = [
  { nome: "Tubo seco",           material: "glassware",  unidade: "tubo",  preco: 220, rendimento: 1, notas: "Uniformizado: passa a constar dos 12 exames (colheita de 5 ml)" },
  { nome: "Ponta amarela",       material: "consumable", unidade: "un",    preco: 60,  rendimento: 1, notas: "" },
  { nome: "Seringa descartável", material: "consumable", unidade: "un",    preco: 50,  rendimento: 1, notas: "" },
  { nome: "Luvas de exame",      material: "epi",        unidade: "par",   preco: 35,  rendimento: 1, notas: "" },
  { nome: "Álcool (aplicação)",  material: "consumable", unidade: "un",    preco: 20,  rendimento: 1, notas: "Mapa tinha 10/15/20 para o mesmo item; adoptado o valor mais recente" },
  { nome: "Algodão (aplicação)", material: "consumable", unidade: "un",    preco: 20,  rendimento: 1, notas: "Uniformizado: passa a constar de todos os exames de colheita" },
];

const TESTES: Consumivel[] = [
  { nome: "Teste VDRL",                     material: "reagent", unidade: "teste", preco: 530,  rendimento: 1,  notas: "" },
  { nome: "Teste HIV",                      material: "reagent", unidade: "teste", preco: 1420, rendimento: 1,  notas: "" },
  { nome: "Teste HCV",                      material: "reagent", unidade: "teste", preco: 530,  rendimento: 1,  notas: "" },
  { nome: "Teste TASO (caixa 25)",          material: "reagent", unidade: "cx",    preco: 530,  rendimento: 25, notas: "Mapa somava a caixa inteira por exame" },
  { nome: "Teste Fator Reumatoide (cx 25)", material: "reagent", unidade: "cx",    preco: 530,  rendimento: 25, notas: "Mapa somava a caixa inteira por exame" },
  { nome: "Teste PCR (caixa 25)",           material: "reagent", unidade: "cx",    preco: 600,  rendimento: 25, notas: "Mapa somava a caixa inteira por exame" },
  { nome: "Reagente Widal Anti-H 5 mL",     material: "reagent", unidade: "fr",    preco: 220,  rendimento: 26, notas: "Mapa somava o frasco inteiro (dizia 26 pacientes)" },
  { nome: "Reagente Widal Anti-O 5 mL",     material: "reagent", unidade: "fr",    preco: 220,  rendimento: 26, notas: "Mapa somava o frasco inteiro (dizia 26 pacientes)" },
  { nome: "Teste HCG (gravidez)",           material: "reagent", unidade: "teste", preco: 530,  rendimento: 1,  notas: "" },
  { nome: "Teste HBS Ag",                   material: "reagent", unidade: "teste", preco: 600,  rendimento: 1,  notas: "" },
  { nome: "Teste Dengue",                   material: "reagent", unidade: "teste", preco: 1200, rendimento: 1,  notas: "" },
  { nome: "Teste Chicungunha",              material: "reagent", unidade: "teste", preco: 1200, rendimento: 1,  notas: "" },
];

// nome no sistema -> { teste específico, nº de pontas amarelas }
const RECEITAS: Record<string, { testes: string[]; pontas?: number }> = {
  "VDRL":                    { testes: ["Teste VDRL"] },
  "HIV":                     { testes: ["Teste HIV"] },
  "HCV":                     { testes: ["Teste HCV"] },
  "TASO":                    { testes: ["Teste TASO (caixa 25)"] },
  "Fator Reumatoide":        { testes: ["Teste Fator Reumatoide (cx 25)"] },
  "PCR":                     { testes: ["Teste PCR (caixa 25)"] },
  "Reacção Widal":           { testes: ["Reagente Widal Anti-H 5 mL", "Reagente Widal Anti-O 5 mL"] },
  "HCG (Teste de Gravidez)": { testes: ["Teste HCG (gravidez)"] },
  "HBS Ag":                  { testes: ["Teste HBS Ag"] },
  "Dengue":                  { testes: ["Teste Dengue"] },
  "Chicungunha":             { testes: ["Teste Chicungunha"] },
};

const MANUTENCAO = 1875;

// Margens tal como constam no mapa, para comparação
const MAPA_MARGEM: Record<string, { custo: number; margem: number }> = {
  "VDRL": { custo: 925, margem: 700 },
  "HIV": { custo: 1815, margem: 1310 },
  "HCV": { custo: 905, margem: 720 },
  "TASO": { custo: 685, margem: 940 },
  "Fator Reumatoide": { custo: 910, margem: 715 },
  "PCR": { custo: 760, margem: 865 },
  "Reacção Widal": { custo: 620, margem: 505 },
  "HCG (Teste de Gravidez)": { custo: 710, margem: 915 },
  "HBS Ag": { custo: 765, margem: 860 },
  "Dengue": { custo: 1365, margem: 1760 },
  "Chicungunha": { custo: 1365, margem: 3760 },
};

const round = (n: number, c = 6) => Number(n.toFixed(c));

async function main() {
  const exames = await prisma.service.findMany({
    where: { deletedAt: null, category: { name: "Serologia" } },
    select: { id: true, name: true, unit_price: true },
    orderBy: { name: "asc" },
  });

  const todos = [...PARTILHADOS, ...TESTES];
  const precoDe = new Map(todos.map((c) => [c.nome, c]));

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

  // ── Folha 1: consumíveis ──
  const wsC = wb.addWorksheet("Consumíveis");
  cabecalho(wsC,
    ["Nome", "Tipo de material", "Unidade", "Preço", "Rendimento", "Custo unitário", "Notas"],
    [34, 18, 11, 12, 13, 15, 62]);
  todos.forEach((c, i) => {
    const r = i + 2;
    wsC.getCell(r, 1).value = c.nome;
    wsC.getCell(r, 2).value = c.material;
    wsC.getCell(r, 3).value = c.unidade;
    wsC.getCell(r, 4).value = c.preco;
    wsC.getCell(r, 5).value = c.rendimento;
    wsC.getCell(r, 6).value = round(c.preco / c.rendimento, 2);
    wsC.getCell(r, 7).value = c.notas;
    wsC.getCell(r, 4).numFmt = "#,##0.00";
    wsC.getCell(r, 6).numFmt = "#,##0.00";
    if (c.rendimento > 1) wsC.getCell(r, 5).font = { bold: true, color: { argb: "FFC05621" } };
    wsC.getCell(r, 7).font = { size: 9, italic: true, color: { argb: "FF777777" } };
  });

  // ── Folha 2: receitas ──
  const wsR = wb.addWorksheet("Receitas");
  cabecalho(wsR,
    ["Exame", "ID do exame", "Consumível", "Qtd por exame", "Custo da linha"],
    [30, 38, 34, 15, 15]);

  let linha = 2;
  const resumo: any[] = [];

  for (const ex of exames) {
    const receita = RECEITAS[ex.name];
    if (!receita) continue;

    const itens: { nome: string; qtd: number }[] = [
      { nome: "Tubo seco", qtd: 1 },
      { nome: "Ponta amarela", qtd: receita.pontas ?? 1 },
      { nome: "Seringa descartável", qtd: 1 },
      { nome: "Luvas de exame", qtd: 1 },
      { nome: "Álcool (aplicação)", qtd: 1 },
      { nome: "Algodão (aplicação)", qtd: 1 },
      ...receita.testes.map((t) => {
        const c = precoDe.get(t)!;
        return { nome: t, qtd: round(1 / c.rendimento) };
      }),
    ];

    let custo = 0;
    for (const it of itens) {
      const c = precoDe.get(it.nome)!;
      const valor = c.preco * it.qtd;
      custo += valor;
      wsR.getCell(linha, 1).value = ex.name;
      wsR.getCell(linha, 2).value = ex.id;
      wsR.getCell(linha, 3).value = it.nome;
      wsR.getCell(linha, 4).value = it.qtd;
      wsR.getCell(linha, 5).value = round(valor, 2);
      wsR.getCell(linha, 2).font = { size: 8, color: { argb: "FF999999" } };
      wsR.getCell(linha, 5).numFmt = "#,##0.00";
      linha++;
    }

    const preco = ex.unit_price ?? 0;
    const margem = preco - custo - MANUTENCAO;
    resumo.push({
      exame: ex.name, preco,
      custoNovo: round(custo, 2), margemNova: round(margem, 2),
      pctNova: preco ? Math.round((margem / preco) * 100) : 0,
      mapa: MAPA_MARGEM[ex.name],
    });
  }

  await wb.xlsx.writeFile(OUT);

  console.log("Gerado:", OUT);
  console.log(`Consumíveis a criar: ${todos.length} | Exames com receita: ${resumo.length}\n`);
  console.log("EXAME".padEnd(26) + "PREÇO".padStart(8) + "CUSTO".padStart(10) + "MARGEM".padStart(11) + "  %" + "     (mapa: margem / %)");
  console.log("-".repeat(88));
  for (const r of resumo) {
    const m = r.mapa;
    const antes = m ? `${m.margem} / ${Math.round((m.margem / r.preco) * 100)}%` : "—";
    console.log(
      r.exame.padEnd(26) +
      String(r.preco).padStart(8) +
      r.custoNovo.toFixed(2).padStart(10) +
      r.margemNova.toFixed(2).padStart(11) +
      String(r.pctNova).padStart(4) + "%" +
      "     " + antes
    );
  }
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
