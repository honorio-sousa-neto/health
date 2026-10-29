/**
 * Gera o ficheiro de revisão das receitas (consumo padrão) da Radiologia.
 *
 *   npx ts-node scripts/gerar-receitas-radiologia.ts
 *
 * Aplica-se depois com scripts/aplicar-receitas.ts.
 *
 * Estrutura uniforme: todos os exames consomem Luvas + Álcool + Algodão +
 * Películas (o número varia) + Bata descartável. O único equipamento é a
 * Cassete (IP), que não é consumível e fica de fora.
 *
 * Nota: o álcool aparece aqui a 20, coincidindo com o catálogo (a folha da
 * Enfermaria indicava 10) — sem conflito nesta importação.
 */
import ExcelJS from "exceljs";
import { prisma } from "../src/database/prisma";

const OUT = "/home/hon-rio-sousa/Development/Node/health/receitas-radiologia.xlsx";

type Consumivel = {
  nome: string;
  material: "reagent" | "consumable" | "equipment" | "epi" | "glassware" | "standardSolution";
  unidade: string;
  preco: number;
  novo: boolean;
  notas: string;
};

const CONSUMIVEIS: Consumivel[] = [
  { nome: "Luvas de exame",         material: "epi",        unidade: "par", preco: 35,   novo: false, notas: "" },
  { nome: "Álcool (aplicação)",     material: "consumable", unidade: "un",  preco: 20,   novo: false, notas: "Coincide com o catálogo" },
  { nome: "Algodão (aplicação)",    material: "consumable", unidade: "un",  preco: 20,   novo: false, notas: "" },
  { nome: "Película radiográfica",  material: "consumable", unidade: "un",  preco: 3125, novo: true,  notas: 'Técnica de Joelho em Carga usava 2 251,78 na folha; adoptado 3 125 (25 dos 26 exames)' },
  { nome: "Bata descartável",       material: "epi",        unidade: "un",  preco: 1100, novo: true,  notas: "" },
];

/** nome no sistema -> { películas, bata } */
const RECEITAS: Record<string, { pel: number; bata: number }> = {
  "Raio X do Tórax AP":                 { pel: 1, bata: 1 },
  "Raio X do Tórax AP + Perfil":        { pel: 2, bata: 1 },
  "Raio X do Crânio AP + Perfil":       { pel: 2, bata: 0 }, // bata em falta na folha
  "Raio X do Abdómen":                  { pel: 1, bata: 1 },
  "Raio X do Abdómen + Perfil":         { pel: 2, bata: 1 },
  "Raio X do Punho AP + Perfil":        { pel: 2, bata: 1 },
  "Raio X da Coluna Lombar":            { pel: 2, bata: 1 },
  "Raio X da Coluna Total":             { pel: 6, bata: 1 },
  "Raio X do Fémur AP + Perfil":        { pel: 2, bata: 1 },
  "Raio X do Braço Axial":              { pel: 2, bata: 1 },
  "Raio X do Antebraço AP + Perfil":    { pel: 2, bata: 1 },
  "Raio X do Joelho Comparativo":       { pel: 2, bata: 1 },
  "Raio X do Tornozelo AP + Perfil":    { pel: 2, bata: 1 },
  "Raio X da Mão AP + Perfil":          { pel: 2, bata: 1 },
  "Raio X do Pé AP + Perfil":           { pel: 2, bata: 1 },
  "Raio X da Coluna Cervical":          { pel: 2, bata: 1 },
  "Raio X da Bacia (Pélvis)":           { pel: 4, bata: 1 },
  "Raio X do Ombro":                    { pel: 4, bata: 1 },
  "Raio X do Braço":                    { pel: 4, bata: 1 },
  "Raio X da Coluna Dorsal (Torácica)": { pel: 4, bata: 1 },
  "Técnica de Rótula":                  { pel: 2, bata: 1 },
  "Raio X do Joelho AP + Perfil":       { pel: 4, bata: 1 },
  "Raio X Seios Perinasais":            { pel: 4, bata: 1 },
  "Técnica de Joelho em Carga":         { pel: 2, bata: 0 }, // bata em falta na folha
  "Técnica de Cavu":                    { pel: 4, bata: 1 },
  "Técnica de Rã":                      { pel: 4, bata: 1 },
};

const MANUTENCAO = 1481.48;
const round = (n: number, c = 2) => Number(n.toFixed(c));

async function main() {
  const servicos = await prisma.service.findMany({
    where: { deletedAt: null, category: { category: { name: "Radiologia" } } },
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
    [26, 18, 11, 12, 13, 11, 74]);
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
    [38, 38, 26, 15, 15]);

  let linha = 2;
  const resumo: any[] = [];

  for (const s of servicos) {
    const rc = RECEITAS[s.name];
    if (!rc) continue;
    const itens = [
      { nome: "Luvas de exame", qtd: 1 },
      { nome: "Álcool (aplicação)", qtd: 1 },
      { nome: "Algodão (aplicação)", qtd: 1 },
      { nome: "Película radiográfica", qtd: rc.pel },
      ...(rc.bata ? [{ nome: "Bata descartável", qtd: rc.bata }] : []),
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
    resumo.push({ nome: s.name, preco, pel: rc.pel, custo: round(custo), margem: round(margem),
      pct: preco ? Math.round((margem / preco) * 100) : 0 });
  }

  await wb.xlsx.writeFile(OUT);

  console.log("Gerado:", OUT);
  const semReceita = servicos.filter((s) => !RECEITAS[s.name]).map((s) => s.name);
  console.log(`Consumíveis: ${CONSUMIVEIS.length} (novos: ${CONSUMIVEIS.filter(c=>c.novo).length}) | Exames: ${resumo.length}`);
  if (semReceita.length) console.log(`Sem custeio na folha: ${semReceita.join(", ")}`);
  console.log();
  console.log("EXAME".padEnd(38) + "PREÇO".padStart(8) + "PEL".padStart(5) + "CUSTO".padStart(11) + "MARGEM".padStart(12) + "    %");
  console.log("-".repeat(78));
  resumo.sort((a, b) => a.margem - b.margem).forEach((r) =>
    console.log(
      r.nome.padEnd(38) + String(r.preco).padStart(8) + String(r.pel).padStart(5) +
      r.custo.toFixed(2).padStart(11) + r.margem.toFixed(2).padStart(12) +
      String(r.pct).padStart(5) + "%" + (r.margem < 0 ? "  <-- NEGATIVA" : "")
    )
  );
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
