/**
 * Aplica a classificação revista (SERVICE / PRODUCT / CONSUMABLE) à base de dados.
 *
 *   npx ts-node scripts/aplicar-classificacao.ts            -> simulação (não grava)
 *   npx ts-node scripts/aplicar-classificacao.ts --apply    -> grava as alterações
 *
 * Lê o ficheiro classificacao-servicos.xlsx gerado por scripts/gerar-classificacao.ts.
 */
import ExcelJS from "exceljs";
import { prisma } from "../src/database/prisma";

const FILE =
  process.env.CLASSIFICACAO_FILE ??
  "/home/hon-rio-sousa/Development/Node/health/classificacao-servicos.xlsx";

const VALIDOS = new Set(["SERVICE", "PRODUCT", "CONSUMABLE"]);

async function main() {
  const apply = process.argv.includes("--apply");

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(FILE);
  const ws = wb.worksheets[0];

  const linhas: { id: string; nome: string; tipo: string }[] = [];
  const erros: string[] = [];

  for (let r = 3; r <= ws.rowCount; r++) {
    const id = String(ws.getCell(r, 1).value ?? "").trim();
    const nome = String(ws.getCell(r, 2).value ?? "").trim();
    const tipo = String(ws.getCell(r, 7).value ?? "").trim().toUpperCase();
    if (!id) continue;
    if (!VALIDOS.has(tipo)) {
      erros.push(`linha ${r}: "${nome}" tem tipo inválido "${tipo}"`);
      continue;
    }
    linhas.push({ id, nome, tipo });
  }

  if (erros.length) {
    console.error("Valores inválidos encontrados — nada foi alterado:");
    erros.forEach((e) => console.error("  " + e));
    process.exit(1);
  }

  const atuais = await prisma.service.findMany({
    where: { id: { in: linhas.map((l) => l.id) } },
    select: { id: true, name: true, type: true },
  });
  const mapa = new Map(atuais.map((s) => [s.id, s]));

  const ausentes = linhas.filter((l) => !mapa.has(l.id));
  if (ausentes.length) {
    console.error(`${ausentes.length} ID(s) do ficheiro não existem na base de dados:`);
    ausentes.slice(0, 10).forEach((a) => console.error(`  ${a.nome} (${a.id})`));
    process.exit(1);
  }

  const mudancas = linhas.filter((l) => mapa.get(l.id)!.type !== l.tipo);

  console.log(`Ficheiro: ${FILE}`);
  console.log(`Linhas lidas: ${linhas.length}`);
  console.log(`Alterações a aplicar: ${mudancas.length}\n`);

  const resumo: Record<string, number> = {};
  mudancas.forEach((m) => {
    const k = `${mapa.get(m.id)!.type} -> ${m.tipo}`;
    resumo[k] = (resumo[k] ?? 0) + 1;
  });
  Object.entries(resumo).forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));

  if (!mudancas.length) {
    console.log("\nNada a fazer.");
    await prisma.$disconnect();
    return;
  }

  if (!apply) {
    console.log("\nExemplos (10 primeiros):");
    mudancas.slice(0, 10).forEach((m) =>
      console.log(`  ${m.nome.slice(0, 45).padEnd(45)} ${mapa.get(m.id)!.type} -> ${m.tipo}`)
    );
    console.log("\n[SIMULAÇÃO] Nada foi gravado. Corre com --apply para aplicar.");
    await prisma.$disconnect();
    return;
  }

  await prisma.$transaction(
    mudancas.map((m) =>
      prisma.service.update({ where: { id: m.id }, data: { type: m.tipo as any } })
    )
  );

  const depois = await prisma.service.groupBy({ by: ["type"], _count: true });
  console.log("\n✅ Aplicado. Distribuição final:");
  depois.forEach((d) => console.log(`  ${d.type}: ${d._count}`));
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
