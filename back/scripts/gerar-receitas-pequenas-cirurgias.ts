/**
 * Gera o ficheiro de revisão das receitas (consumo padrão) das Pequenas
 * Cirurgias, a partir da folha Enfermaria do Mapa de Rentabilidade/Custeio.
 *
 *   npx ts-node scripts/gerar-receitas-pequenas-cirurgias.ts
 *
 * Aplica-se depois com scripts/aplicar-receitas.ts.
 *
 * ── O que fica DE FORA e porquê ────────────────────────────────────────────
 *  1. Neomicina/Pomada: é um produto da Farmácia (existe como "Neomicina 15 g")
 *     e na folha está sem preço (0), pelo que não contribui para o custo.
 *     Segue a mesma decisão dos restantes fármacos: pendente de escolha da
 *     apresentação e da fracção de embalagem.
 *  2. Gota espessa (só na Gama): é um exame, não um material. O laboratório já
 *     declara o consumo dos seus reagentes ao realizá-lo — incluí-lo aqui
 *     contaria duas vezes. Nota: aparece a 1 000 aqui e a 1 500 na Observação,
 *     na mesma folha.
 *
 * ── Reaproveitamento do catálogo ───────────────────────────────────────────
 *  "Adesivo Perfurado" é ligado ao "Adesivo" já existente (mesmo preço, 32; a
 *  folha da Observação grafava-o "Adisivo"). Evita duplicar stock do mesmo item.
 */
import ExcelJS from "exceljs";
import { prisma } from "../src/database/prisma";

const OUT = "/home/hon-rio-sousa/Development/Node/health/receitas-pequenas-cirurgias.xlsx";

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
  { nome: "Máscara descartável", material: "epi",        unidade: "un",  preco: 40,  novo: false, notas: "Já existe no catálogo" },
  { nome: "Luvas de exame",      material: "epi",        unidade: "par", preco: 35,  novo: false, notas: "Já existe no catálogo" },
  { nome: "Álcool (aplicação)",  material: "consumable", unidade: "un",  preco: 20,  novo: false, notas: "Catálogo a 20; esta folha indicava 10" },
  { nome: "Algodão (aplicação)", material: "consumable", unidade: "un",  preco: 20,  novo: false, notas: "Já existe no catálogo" },
  { nome: "Adesivo",             material: "consumable", unidade: "un",  preco: 32,  novo: false, notas: 'Folha diz "Adesivo Perfurado" (mesmo preço) — reaproveitado' },
  { nome: "Seringa descartável", material: "consumable", unidade: "un",  preco: 50,  novo: false, notas: "Já existe no catálogo" },
  { nome: "Soro fisiológico",    material: "consumable", unidade: "fr",  preco: 850, novo: false, notas: "Já existe no catálogo" },
  // novos
  { nome: "Água oxigenada",           material: "consumable", unidade: "fr", preco: 35,    novo: true, notas: "" },
  { nome: "Compressas",               material: "consumable", unidade: "un", preco: 195,   novo: true, notas: "" },
  { nome: "Iodopovidona (Betadine)",  material: "consumable", unidade: "fr", preco: 250,   novo: true, notas: "" },
  { nome: "Bisturi",                  material: "consumable", unidade: "un", preco: 12.43, novo: true, notas: "Preço idêntico ao da agulha — na folha original era uma referência à célula da agulha (ver resumo)" },
  { nome: "Solução de Dec",           material: "consumable", unidade: "fr", preco: 100,   novo: true, notas: "" },
  { nome: "Ligadura",                 material: "consumable", unidade: "un", preco: 195,   novo: true, notas: 'Folha diz "Ligadura/Compressa" com o preço das Compressas (ver resumo)' },
];

// Todos os materiais escalam pelo mesmo factor (= dias de duração)
const MATERIAIS = CONSUMIVEIS.map((c) => c.nome);

const RECEITAS: Record<string, number> = {
  "Pequenas Cirurgias (Alfa)": 1, // 1 dia
  "Pequenas Cirurgias (Beta)": 3, // 3 dias
  "Pequenas Cirurgias (Gama)": 7, // 7 dias
};

const MANUTENCAO = 1818.18;
const round = (n: number, c = 2) => Number(n.toFixed(c));

async function main() {
  const servicos = await prisma.service.findMany({
    where: { deletedAt: null, name: { contains: "Pequenas Cirurgias", mode: "insensitive" } },
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
    [28, 18, 11, 12, 13, 11, 70]);
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
    [28, 38, 28, 15, 15]);

  let linha = 2;
  const resumo: any[] = [];

  for (const s of servicos) {
    const fator = RECEITAS[s.name];
    if (!fator) continue;
    let custo = 0;
    for (const nome of MATERIAIS) {
      const c = precoDe.get(nome)!;
      const valor = c.preco * fator;
      custo += valor;
      wsR.getCell(linha, 1).value = s.name;
      wsR.getCell(linha, 2).value = s.id;
      wsR.getCell(linha, 3).value = nome;
      wsR.getCell(linha, 4).value = fator;
      wsR.getCell(linha, 5).value = round(valor);
      wsR.getCell(linha, 2).font = { size: 8, color: { argb: "FF999999" } };
      wsR.getCell(linha, 5).numFmt = "#,##0.00";
      linha++;
    }
    const preco = s.unit_price ?? 0;
    resumo.push({ nome: s.name, preco, fator, custo: round(custo), margem: round(preco - custo - MANUTENCAO) });
  }

  await wb.xlsx.writeFile(OUT);

  console.log("Gerado:", OUT);
  console.log(`Consumíveis: ${CONSUMIVEIS.length} (novos: ${CONSUMIVEIS.filter(c=>c.novo).length}) | Serviços: ${resumo.length}\n`);
  console.log("SERVIÇO".padEnd(28) + "PREÇO".padStart(8) + "×".padStart(4) + "MATERIAIS".padStart(12) + "MARGEM".padStart(12) + "   %");
  console.log("-".repeat(74));
  resumo.forEach((r) =>
    console.log(
      r.nome.padEnd(28) + String(r.preco).padStart(8) + String(r.fator).padStart(4) +
      r.custo.toFixed(2).padStart(12) + r.margem.toFixed(2).padStart(12) +
      String(Math.round((r.margem / r.preco) * 100)).padStart(4) + "%"
    )
  );
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
