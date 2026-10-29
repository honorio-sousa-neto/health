/**
 * Gera o ficheiro de revisão das receitas (consumo padrão) da Estomatologia.
 *
 *   npx ts-node scripts/gerar-receitas-estomatologia.ts
 *
 * ATENÇÃO — importação parcial e deliberada.
 *
 * A folha da Estomatologia está degradada: cerca de metade dos procedimentos
 * têm células #NOME? (fórmulas com referências partidas), incluindo em linhas
 * de custo. Só são importados os procedimentos que cumprem as duas condições:
 *   (a) o custo indicado confere com a soma dos itens listados;
 *   (b) o nome corresponde inequivocamente a um serviço do sistema.
 *
 * Ficam de fora, por estarem partidos na folha:
 *   Extração de Pré-molares, Molares e Siso, Dentes Inclusos, Curetagem
 *   Cirúrgica, Remoção de Sutura, Tratamento de Canal 2ª e 3ª Sessão,
 *   Profilaxia em Dentes Decíduos.
 *
 * Ficam de fora, por não haver correspondência de nome no sistema:
 *   Profilaxia Profunda, Profilaxia Infantil, Restauração de Dentes
 *   Posteriores / Anteriores / Provisória / Decíduos, Extração de Dentes
 *   Decíduos, Tratamento de Canal 1ª Sessão (o sistema modela endodontia por
 *   dente — Incisivo/Pré-Molares/Molares — e não por sessão).
 */
import ExcelJS from "exceljs";
import { prisma } from "../src/database/prisma";

const OUT = "/home/hon-rio-sousa/Development/Node/health/receitas-estomatologia.xlsx";

type Consumivel = {
  nome: string;
  material: "reagent" | "consumable" | "equipment" | "epi" | "glassware" | "standardSolution";
  unidade: string;
  preco: number;
  novo: boolean;
  notas: string;
};

const CONSUMIVEIS: Consumivel[] = [
  // reaproveitados
  { nome: "Luvas de exame",          material: "epi",        unidade: "par", preco: 35,   novo: false, notas: "Catálogo a 35; esta folha varia entre 50, 150, 170 e 1 200 para o mesmo item" },
  { nome: "Máscara descartável",     material: "epi",        unidade: "un",  preco: 40,   novo: false, notas: "Catálogo a 40; folha varia entre 50, 100 e 150" },
  { nome: "Seringa descartável",     material: "consumable", unidade: "un",  preco: 50,   novo: false, notas: "" },
  { nome: "Compressas",              material: "consumable", unidade: "un",  preco: 195,  novo: false, notas: "" },
  { nome: "Iodopovidona (Betadine)", material: "consumable", unidade: "fr",  preco: 250,  novo: false, notas: "Catálogo a 250; folha indica 230" },
  { nome: "Bisturi",                 material: "consumable", unidade: "un",  preco: 12.43, novo: false, notas: "CONFLITO: folha indica 1 200; catálogo tem 12,43 (valor da Enfermaria, já assinalado como provável erro)" },
  // novos
  { nome: "Ponta destartarizadora",       material: "consumable", unidade: "un", preco: 500,   novo: true, notas: "" },
  { nome: "Sugador",                      material: "consumable", unidade: "un", preco: 120,   novo: true, notas: "" },
  { nome: "Babete",                       material: "consumable", unidade: "un", preco: 100.35, novo: true, notas: "" },
  { nome: "Copo descartável",             material: "consumable", unidade: "un", preco: 100,   novo: true, notas: "" },
  { nome: "Enxaguante bucal",             material: "consumable", unidade: "fr", preco: 150,   novo: true, notas: "" },
  { nome: "Escova de Robson",             material: "consumable", unidade: "un", preco: 500,   novo: true, notas: "" },
  { nome: "Pasta profilática",            material: "consumable", unidade: "un", preco: 50,    novo: true, notas: "" },
  { nome: "Ácido fosfórico",              material: "reagent",    unidade: "fr", preco: 170,   novo: true, notas: "" },
  { nome: "Bond (adesivo dentário)",      material: "reagent",    unidade: "fr", preco: 210,   novo: true, notas: "" },
  { nome: "Selante de fissuras",          material: "reagent",    unidade: "un", preco: 0,     novo: true, notas: "SEM PREÇO na folha — definir em Estoque" },
  { nome: "Rolete de algodão",            material: "consumable", unidade: "un", preco: 31.6,  novo: true, notas: "" },
  { nome: "Agulha gengival",              material: "consumable", unidade: "un", preco: 159,   novo: true, notas: "" },
  { nome: "Anestésico com vasoconstritor", material: "reagent",   unidade: "amp", preco: 800,  novo: true, notas: "" },
  { nome: "Anestésico sem vasoconstritor", material: "reagent",   unidade: "amp", preco: 500,  novo: true, notas: "" },
  { nome: "Resina composta A2",           material: "reagent",    unidade: "un", preco: 176,   novo: true, notas: "" },
  { nome: "Cimento obturador provisório", material: "reagent",    unidade: "un", preco: 0,     novo: true, notas: "SEM PREÇO na folha — definir em Estoque" },
  { nome: "Espátula de madeira",          material: "consumable", unidade: "un", preco: 100,   novo: true, notas: "" },
];

/** nome no sistema -> itens (quantidade 1 em todos) */
const RECEITAS: Record<string, string[]> = {
  // custo na folha: 1 170,35 — confere
  "Destartarização": [
    "Ponta destartarizadora", "Sugador", "Babete", "Máscara descartável",
    "Copo descartável", "Enxaguante bucal", "Luvas de exame",
  ],
  // "Profilaxia Completa" na folha — custo 1 220,35, confere
  "Próflacia Completa": [
    "Escova de Robson", "Sugador", "Babete", "Máscara descartável",
    "Copo descartável", "Enxaguante bucal", "Luvas de exame", "Pasta profilática",
  ],
  // custo na folha: 931,95 — confere
  "Aplicação Selantes de Fissuras (por dente)": [
    "Ácido fosfórico", "Babete", "Selante de fissuras", "Bond (adesivo dentário)",
    "Copo descartável", "Enxaguante bucal", "Sugador", "Máscara descartável",
    "Rolete de algodão",
  ],
  // "Extratação de Raiz Residual" — custo 3 080,35, confere
  "Extração (Raiz Residual)": [
    "Agulha gengival", "Anestésico com vasoconstritor", "Cimento obturador provisório",
    "Babete", "Iodopovidona (Betadine)", "Bisturi", "Compressas", "Sugador",
    "Máscara descartável", "Resina composta A2", "Seringa descartável",
  ],
  // custo na folha: 3 485,35 — confere (preço difere: 22 000 na folha, 25 000 no sistema)
  "Extração de Molares": [
    "Agulha gengival", "Anestésico com vasoconstritor", "Anestésico sem vasoconstritor",
    "Babete", "Iodopovidona (Betadine)", "Bisturi", "Copo descartável",
    "Máscara descartável", "Resina composta A2", "Seringa descartável", "Sugador",
  ],
  // "Consulta C/ Marcação" — custo 400,00, confere (a folha não indica preço)
  "Consulta Normal (Marcada)": [
    "Espátula de madeira", "Luvas de exame", "Máscara descartável",
  ],
};

const MANUTENCAO = 1714.29;
const round = (n: number, c = 2) => Number(n.toFixed(c));

async function main() {
  const servicos = await prisma.service.findMany({
    where: { deletedAt: null, category: { category: { name: "Estomatologia" } } },
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
    [32, 18, 11, 12, 13, 11, 88]);
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
    const vermelho = c.notas.startsWith("CONFLITO") || c.notas.startsWith("SEM PREÇO");
    wsC.getCell(r, 7).font = vermelho
      ? { size: 9, bold: true, color: { argb: "FFC53030" } }
      : { size: 9, italic: true, color: { argb: "FF777777" } };
  });

  const wsR = wb.addWorksheet("Receitas");
  cabecalho(wsR, ["Exame", "ID do exame", "Consumível", "Qtd por exame", "Custo da linha"],
    [42, 38, 32, 15, 15]);

  let linha = 2;
  const resumo: any[] = [];

  for (const s of servicos) {
    const itens = RECEITAS[s.name];
    if (!itens) continue;
    let custo = 0;
    for (const nome of itens) {
      const c = precoDe.get(nome)!;
      custo += c.preco;
      wsR.getCell(linha, 1).value = s.name;
      wsR.getCell(linha, 2).value = s.id;
      wsR.getCell(linha, 3).value = nome;
      wsR.getCell(linha, 4).value = 1;
      wsR.getCell(linha, 5).value = round(c.preco);
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
  console.log(`Consumíveis: ${CONSUMIVEIS.length} (novos: ${CONSUMIVEIS.filter(c=>c.novo).length}) | Procedimentos importados: ${resumo.length} de 29 no sistema\n`);
  console.log("PROCEDIMENTO".padEnd(42) + "PREÇO".padStart(8) + "CUSTO".padStart(11) + "MARGEM".padStart(12) + "    %");
  console.log("-".repeat(78));
  resumo.forEach((r) =>
    console.log(r.nome.padEnd(42) + String(r.preco).padStart(8) + r.custo.toFixed(2).padStart(11) +
      r.margem.toFixed(2).padStart(12) + String(r.pct).padStart(5) + "%")
  );
  const semReceita = servicos.filter((s) => !RECEITAS[s.name]).length;
  console.log(`\nSem consumo padrão: ${semReceita} procedimentos (folha partida ou sem correspondência de nome)`);
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
