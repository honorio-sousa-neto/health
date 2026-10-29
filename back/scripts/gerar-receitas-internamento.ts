/**
 * Gera o ficheiro de revisão das receitas (consumo padrão) do Internamento,
 * a partir da folha Enfermaria do Mapa de Rentabilidade/Custeio.
 *
 *   npx ts-node scripts/gerar-receitas-internamento.ts
 *
 * Aplica-se depois com scripts/aplicar-receitas.ts.
 *
 * Por agora só o Internamento 6h (Alfa). Beta (12h) e Gama (24h) existem no
 * sistema mas os valores resolvidos ainda não foram fornecidos.
 *
 * ── O que fica DE FORA e porquê ────────────────────────────────────────────
 *  1. Alimentação (pequeno-almoço, almoço, jantar, sopa, fruta, sumo, água —
 *     7 800, 25% do custo): é catering, não stock clínico. Nunca dá entrada em
 *     inventário, pelo que declará-la como consumo geraria saldos negativos
 *     permanentes. Continua a ser um custo real, mas de outra natureza.
 *  2. Lençóis, toalhas e chinelos: sem preço na folha e reutilizáveis
 *     (lavandaria), não consumíveis.
 *  3. EXAMES (Gota espessa, Serológico, Bioquímica, Hemograma): são serviços.
 *     O laboratório já declara o consumo dos seus reagentes ao realizá-los.
 *     Nota: "Serológico" aparece a 2 500 aqui e a 3 500 na Observação;
 *     "Bioquímica" a 3 500 aqui e a 4 500 na Observação.
 *  4. Avenças (7 500 = 15% do preço; na Observação era 10%): comissão do
 *     clínico, não material.
 *  5. Fármacos (Dipirona, Artemeter, Enalapril, Captopril, Buscopan,
 *     Diclofenac, Vitamina C, Vitamina B complexo, Neomicina): existem na
 *     Farmácia mas com preço de venda e em apresentações que a folha não
 *     desambigua. Pendentes de decisão, como nas folhas anteriores.
 */
import ExcelJS from "exceljs";
import { prisma } from "../src/database/prisma";

const OUT = "/home/hon-rio-sousa/Development/Node/health/receitas-internamento.xlsx";

type Consumivel = {
  nome: string;
  material: "reagent" | "consumable" | "equipment" | "epi" | "glassware" | "standardSolution";
  unidade: string;
  preco: number;
  novo: boolean;
  notas: string;
};

const CONSUMIVEIS: Consumivel[] = [
  // reaproveitados do catálogo
  { nome: "Máscara descartável",      material: "epi",        unidade: "un",  preco: 40,    novo: false, notas: "" },
  { nome: "Luvas de exame",           material: "epi",        unidade: "par", preco: 35,    novo: false, notas: "" },
  { nome: "Álcool (aplicação)",       material: "consumable", unidade: "un",  preco: 20,    novo: false, notas: "Catálogo a 20; esta folha indica 10" },
  { nome: "Algodão (aplicação)",      material: "consumable", unidade: "un",  preco: 20,    novo: false, notas: "" },
  { nome: "Soro fisiológico",         material: "consumable", unidade: "fr",  preco: 850,   novo: false, notas: "" },
  { nome: "Seringa descartável",      material: "consumable", unidade: "un",  preco: 50,    novo: false, notas: "" },
  { nome: "Sistema de soro",          material: "consumable", unidade: "un",  preco: 200,   novo: false, notas: "" },
  { nome: "Bránula",                  material: "consumable", unidade: "un",  preco: 145,   novo: false, notas: 'Grafado "Brandula" nesta folha' },
  { nome: "Agulha descartável",       material: "consumable", unidade: "un",  preco: 12.43, novo: false, notas: "" },
  { nome: "Água oxigenada",           material: "consumable", unidade: "fr",  preco: 35,    novo: false, notas: "CONFLITO: esta folha indica 620, a das Pequenas Cirurgias 35. Definir o preço real em Estoque" },
  { nome: "Compressas",               material: "consumable", unidade: "un",  preco: 195,   novo: false, notas: "" },
  { nome: "Ligadura",                 material: "consumable", unidade: "un",  preco: 195,   novo: false, notas: "" },
  { nome: "Bisturi",                  material: "consumable", unidade: "un",  preco: 12.43, novo: false, notas: "Preço idêntico ao da agulha (provável referência errada na folha)" },
  { nome: "Iodopovidona (Betadine)",  material: "consumable", unidade: "fr",  preco: 250,   novo: false, notas: "" },
  // novos
  { nome: "Borboleta",                material: "consumable", unidade: "un",  preco: 35,  novo: true, notas: 'Grafado "Borbuleta" na folha' },
  { nome: "Escova de dentes",         material: "consumable", unidade: "un",  preco: 150, novo: true, notas: "Utensílio de internamento" },
  { nome: "Pasta de dentes",          material: "consumable", unidade: "un",  preco: 200, novo: true, notas: "Utensílio de internamento" },
  { nome: "Sabonete",                 material: "consumable", unidade: "un",  preco: 200, novo: true, notas: "Utensílio de internamento" },
];

// Os três internamentos têm gastáveis idênticos — tudo a quantidade 1.
// Na folha só exames, alimentação e avenças escalam com a duração; os
// materiais não, nem de 6h para 24h. Importado como está (ver nota no resumo).
const RECEITAS: Record<string, number> = {
  "Internamento 6h (Alfa)":  1,
  "Internamento 12h (Beta)": 1,
  "Internamento 24h (Gama)": 1,
};

const MANUTENCAO = 1818.18;
const round = (n: number, c = 2) => Number(n.toFixed(c));

async function main() {
  const servicos = await prisma.service.findMany({
    where: { deletedAt: null, name: { contains: "Internamento", mode: "insensitive" } },
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
    [28, 18, 11, 12, 13, 11, 82]);
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
    if (c.notas.startsWith("CONFLITO")) wsC.getCell(r, 7).font = { size: 9, bold: true, color: { argb: "FFC53030" } };
  });

  const wsR = wb.addWorksheet("Receitas");
  cabecalho(wsR, ["Exame", "ID do exame", "Consumível", "Qtd por exame", "Custo da linha"],
    [28, 38, 28, 15, 15]);

  let linha = 2;
  const resumo: any[] = [];

  for (const s of servicos) {
    const fator = RECEITAS[s.name];
    if (!fator) continue;
    let custo = 0;
    for (const c of CONSUMIVEIS) {
      const valor = c.preco * fator;
      custo += valor;
      wsR.getCell(linha, 1).value = s.name;
      wsR.getCell(linha, 2).value = s.id;
      wsR.getCell(linha, 3).value = c.nome;
      wsR.getCell(linha, 4).value = fator;
      wsR.getCell(linha, 5).value = round(valor);
      wsR.getCell(linha, 2).font = { size: 8, color: { argb: "FF999999" } };
      wsR.getCell(linha, 5).numFmt = "#,##0.00";
      linha++;
    }
    const preco = s.unit_price ?? 0;
    resumo.push({ nome: s.name, preco, custo: round(custo) });
  }

  await wb.xlsx.writeFile(OUT);

  console.log("Gerado:", OUT);
  console.log(`Consumíveis: ${CONSUMIVEIS.length} (novos: ${CONSUMIVEIS.filter(c=>c.novo).length}) | Serviços: ${resumo.length}`);
  const naoImportados = servicos.filter((s) => !RECEITAS[s.name]).map((s) => s.name);
  if (naoImportados.length) console.log(`Sem receita (valores por fornecer): ${naoImportados.join(", ")}`);
  console.log();
  console.log("SERVIÇO".padEnd(26) + "PREÇO".padStart(9) + "MATERIAIS".padStart(12) + "   (sem fármacos, exames, alimentação nem avenças)");
  console.log("-".repeat(80));
  resumo.forEach((r) => console.log(r.nome.padEnd(26) + String(r.preco).padStart(9) + r.custo.toFixed(2).padStart(12)));
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
