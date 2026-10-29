/**
 * Gera o ficheiro de revisão das receitas de Hematologia, Parasitologia e
 * Bioquímica, a partir da folha Custeio Laboratório do Mapa de Rentabilidade.
 *
 *   npx ts-node scripts/gerar-receitas-lab-restante.ts
 *
 * Aplica-se depois com scripts/aplicar-receitas.ts.
 *
 * ── Fica DE FORA e porquê ──────────────────────────────────────────────────
 * Reagentes a granel sem rendimento conhecido: GIEMSA (500ml), óleo de imersão
 * (2 gotas/paciente de um frasco de 500ml), soro fisiológico em gotas, RINSE
 * (20L), Diluente (20L), Lyser (500ml), EZ Cleaning (100ml), rolo de papel e
 * os reagentes de bioquímica (500ml). A folha somava o preço da embalagem
 * inteira por exame — o mesmo erro do Grupo Sanguíneo. Importá-los à
 * embalagem falsearia o consumo; à fracção exigiria rendimentos que a folha
 * não dá. Ficam pendentes.
 *
 * Excepção: os reagentes Anti-A/B/AB/D do Grupo Sanguíneo TÊM rendimento na
 * folha ("50 pacientes") e entram como fracção 1/50 = 0,02 — o mesmo modelo
 * do Widal.
 *
 * Sem custeio na folha (ficam sem receita): TH+TC, Triglicerídeos, Ureia.
 */
import ExcelJS from "exceljs";
import { prisma } from "../src/database/prisma";

const OUT = "/home/hon-rio-sousa/Development/Node/health/receitas-lab-restante.xlsx";

type Consumivel = {
  nome: string;
  material: "reagent" | "consumable" | "equipment" | "epi" | "glassware" | "standardSolution";
  unidade: string;
  preco: number;
  rendimento: number;
  novo: boolean;
  notas: string;
};

const CONSUMIVEIS: Consumivel[] = [
  // reaproveitados
  { nome: "Seringa descartável",  material: "consumable", unidade: "un",  preco: 50,  rendimento: 1, novo: false, notas: "" },
  { nome: "Luvas de exame",       material: "epi",        unidade: "par", preco: 35,  rendimento: 1, novo: false, notas: "" },
  { nome: "Álcool (aplicação)",   material: "consumable", unidade: "un",  preco: 20,  rendimento: 1, novo: false, notas: "" },
  { nome: "Algodão (aplicação)",  material: "consumable", unidade: "un",  preco: 20,  rendimento: 1, novo: false, notas: "" },
  { nome: "Ponta amarela",        material: "consumable", unidade: "un",  preco: 60,  rendimento: 1, novo: false, notas: "" },
  // novos
  { nome: "Tubo com anticoagulante", material: "glassware", unidade: "tubo", preco: 220, rendimento: 1, novo: true, notas: "V.S indica 220; Hemograma indica 360 para o mesmo item — adoptado 220, corrigir em Estoque se for outro tubo" },
  { nome: "Reagente Anti-A (10 mL)",  material: "reagent", unidade: "fr", preco: 165, rendimento: 50, novo: true, notas: "Folha diz 50 pacientes/frasco — fracção 0,02, como o Widal" },
  { nome: "Reagente Anti-B (10 mL)",  material: "reagent", unidade: "fr", preco: 165, rendimento: 50, novo: true, notas: "idem" },
  { nome: "Reagente Anti-AB (10 mL)", material: "reagent", unidade: "fr", preco: 165, rendimento: 50, novo: true, notas: "idem" },
  { nome: "Reagente Anti-D (10 mL)",  material: "reagent", unidade: "fr", preco: 165, rendimento: 50, novo: true, notas: "idem" },
  { nome: "Lamela",               material: "glassware",  unidade: "un",  preco: 50,  rendimento: 1, novo: true, notas: "" },
  { nome: "Lâmina de vidro",      material: "glassware",  unidade: "un",  preco: 0,   rendimento: 1, novo: true, notas: "SEM PREÇO na folha — definir em Estoque" },
  { nome: "Vela",                 material: "consumable", unidade: "un",  preco: 100, rendimento: 1, novo: true, notas: "Falciformação (selagem)" },
  { nome: "Lanceta",              material: "consumable", unidade: "un",  preco: 480, rendimento: 1, novo: true, notas: "" },
  { nome: "Água destilada",       material: "consumable", unidade: "un",  preco: 25,  rendimento: 1, novo: true, notas: "TGP indica 5; adoptado 25 (restantes exames)" },
  { nome: "Frasco colector",      material: "consumable", unidade: "un",  preco: 210, rendimento: 1, novo: true, notas: "Fezes indica 210; Urina/Espermograma 270 — adoptado 210" },
  { nome: "Fita reativa",         material: "consumable", unidade: "un",  preco: 175, rendimento: 1, novo: true, notas: "" },
  { nome: "Zaragatoa",            material: "consumable", unidade: "un",  preco: 250, rendimento: 1, novo: true, notas: "" },
  { nome: "Tubo de ensaio",       material: "glassware",  unidade: "tubo", preco: 220, rendimento: 1, novo: true, notas: "" },
  { nome: "Ponta azul",           material: "consumable", unidade: "un",  preco: 60,  rendimento: 1, novo: true, notas: "Só na Bilirrubina Total" },
];

const COLHEITA = ["Seringa descartável", "Luvas de exame", "Álcool (aplicação)", "Algodão (aplicação)"];
const BIOQUIMICA_BASE = ["Ponta amarela", "Tubo de ensaio", ...COLHEITA, "Água destilada"];

/** nome no sistema -> lista de { nome, qtd } */
const RECEITAS: Record<string, { nome: string; qtd?: number }[]> = {
  // ── Hematologia ──
  "V.S":                [...COLHEITA.map((n) => ({ nome: n })), { nome: "Tubo com anticoagulante" }],
  "Grupo Sanguíneo":    [...COLHEITA.map((n) => ({ nome: n })),
    { nome: "Reagente Anti-A (10 mL)", qtd: 0.02 }, { nome: "Reagente Anti-B (10 mL)", qtd: 0.02 },
    { nome: "Reagente Anti-AB (10 mL)", qtd: 0.02 }, { nome: "Reagente Anti-D (10 mL)", qtd: 0.02 }],
  "Falciformação":      [...COLHEITA.map((n) => ({ nome: n })), { nome: "Lamela" }, { nome: "Vela" }],
  "Hemograma Completo": [...COLHEITA.map((n) => ({ nome: n })), { nome: "Tubo com anticoagulante" }],
  // ── Parasitologia ──
  "Gota Espessa":    [{ nome: "Lanceta" }, { nome: "Luvas de exame" }, { nome: "Álcool (aplicação)" },
                      { nome: "Algodão (aplicação)" }, { nome: "Água destilada" }, { nome: "Lâmina de vidro" }],
  "Fezes":           [{ nome: "Frasco colector" }, { nome: "Luvas de exame" }, { nome: "Álcool (aplicação)" }, { nome: "Algodão (aplicação)" }],
  "Urina":           [{ nome: "Lamela" }, { nome: "Luvas de exame" }, { nome: "Fita reativa" }, { nome: "Frasco colector" }],
  "Espermograma":    [{ nome: "Lamela" }, { nome: "Luvas de exame" }, { nome: "Fita reativa" },
                      { nome: "Álcool (aplicação)" }, { nome: "Ponta amarela" }, { nome: "Frasco colector" }],
  "Exudado Vaginal": [{ nome: "Lamela" }, { nome: "Luvas de exame" }, { nome: "Zaragatoa" }],
  // ── Bioquímica (base comum; reagentes 500ml pendentes) ──
  "Bilirrubina Total":  [...BIOQUIMICA_BASE.map((n) => ({ nome: n })), { nome: "Ponta azul" }],
  "Bilirrubina Direta": BIOQUIMICA_BASE.map((n) => ({ nome: n })),
  "Colesterol":         BIOQUIMICA_BASE.map((n) => ({ nome: n })),
  "HDL":                BIOQUIMICA_BASE.map((n) => ({ nome: n })),
  "LDL":                BIOQUIMICA_BASE.map((n) => ({ nome: n })),
  "VLDL":               BIOQUIMICA_BASE.map((n) => ({ nome: n })),
  "Ácido Úrico":        BIOQUIMICA_BASE.map((n) => ({ nome: n })),
  "Creatinina":         BIOQUIMICA_BASE.map((n) => ({ nome: n })),
  "Glucose":            BIOQUIMICA_BASE.map((n) => ({ nome: n })),
  "Glicemia":           BIOQUIMICA_BASE.map((n) => ({ nome: n })), // mesmo exame que Glucose no catálogo
  "TGO":                BIOQUIMICA_BASE.map((n) => ({ nome: n })),
  "TGP":                BIOQUIMICA_BASE.map((n) => ({ nome: n })),
};

const round = (n: number, c = 6) => Number(n.toFixed(c));

async function main() {
  const servicos = await prisma.service.findMany({
    where: { deletedAt: null, category: { name: { in: ["Hematologia", "Parasitologia", "Bioquímica"] } } },
    select: { id: true, name: true, unit_price: true, category: { select: { name: true } } },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
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
    [28, 18, 11, 12, 13, 11, 84]);
  CONSUMIVEIS.forEach((c, i) => {
    const r = i + 2;
    wsC.getCell(r, 1).value = c.nome;
    wsC.getCell(r, 2).value = c.material;
    wsC.getCell(r, 3).value = c.unidade;
    wsC.getCell(r, 4).value = c.preco;
    wsC.getCell(r, 5).value = c.rendimento;
    wsC.getCell(r, 6).value = c.novo ? "novo" : "existente";
    wsC.getCell(r, 7).value = c.notas;
    wsC.getCell(r, 4).numFmt = "#,##0.00";
    if (c.rendimento > 1) wsC.getCell(r, 5).font = { bold: true, color: { argb: "FFC05621" } };
    const vermelho = c.notas.startsWith("SEM PREÇO");
    wsC.getCell(r, 7).font = vermelho
      ? { size: 9, bold: true, color: { argb: "FFC53030" } }
      : { size: 9, italic: true, color: { argb: "FF777777" } };
  });

  const wsR = wb.addWorksheet("Receitas");
  cabecalho(wsR, ["Exame", "ID do exame", "Consumível", "Qtd por exame", "Custo da linha"],
    [26, 38, 28, 15, 15]);

  let linha = 2;
  const resumo: any[] = [];

  for (const s of servicos) {
    const receita = RECEITAS[s.name];
    if (!receita) continue;
    let custo = 0;
    for (const it of receita) {
      const c = precoDe.get(it.nome)!;
      const qtd = it.qtd ?? 1;
      const valor = c.preco * qtd;
      custo += valor;
      wsR.getCell(linha, 1).value = s.name;
      wsR.getCell(linha, 2).value = s.id;
      wsR.getCell(linha, 3).value = it.nome;
      wsR.getCell(linha, 4).value = round(qtd);
      wsR.getCell(linha, 5).value = round(valor, 2);
      wsR.getCell(linha, 2).font = { size: 8, color: { argb: "FF999999" } };
      wsR.getCell(linha, 5).numFmt = "#,##0.00";
      linha++;
    }
    resumo.push({ cat: s.category?.name, nome: s.name, preco: s.unit_price ?? 0, custo: round(custo, 2), itens: receita.length });
  }

  await wb.xlsx.writeFile(OUT);

  console.log("Gerado:", OUT);
  console.log(`Consumíveis: ${CONSUMIVEIS.length} (novos: ${CONSUMIVEIS.filter((c) => c.novo).length}) | Exames: ${resumo.length}`);
  const semReceita = servicos.filter((s) => !RECEITAS[s.name]).map((s) => s.name);
  if (semReceita.length) console.log(`Sem custeio na folha: ${semReceita.join(", ")}`);
  console.log();
  console.log("EXAME".padEnd(26) + "ÁREA".padEnd(15) + "PREÇO".padStart(7) + "ITENS".padStart(7) + "MATERIAIS".padStart(11) + "   (reagentes a granel pendentes)");
  console.log("-".repeat(78));
  resumo.forEach((r) =>
    console.log(r.nome.padEnd(26) + String(r.cat).padEnd(15) + String(r.preco).padStart(7) + String(r.itens).padStart(7) + r.custo.toFixed(2).padStart(11))
  );
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
