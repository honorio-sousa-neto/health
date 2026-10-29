/**
 * Aplica um ficheiro de receitas (consumo padrão) à base de dados.
 *
 *   npx ts-node scripts/aplicar-receitas.ts <ficheiro.xlsx>            -> simulação
 *   npx ts-node scripts/aplicar-receitas.ts <ficheiro.xlsx> --apply    -> grava
 *
 * Espera duas folhas:
 *   "Consumíveis": Nome | Tipo de material | Unidade | Preço | Rendimento | ...
 *   "Receitas":    Exame | ID do exame | Consumível | Qtd por exame | ...
 *
 * Os consumíveis são criados como type=CONSUMABLE na categoria Laboratório.
 * Correr duas vezes é seguro: os consumíveis são reaproveitados pelo nome e a
 * receita de cada exame é substituída, não acumulada.
 */
import ExcelJS from "exceljs";
import { prisma } from "../src/database/prisma";
import { MaterialOfServiceRepository } from "../src/repositories/material-service";

const MATERIAIS = new Set(["reagent", "consumable", "equipment", "epi", "glassware", "standardSolution"]);

async function main() {
  const ficheiro = process.argv[2];
  const apply = process.argv.includes("--apply");
  if (!ficheiro || ficheiro.startsWith("--")) {
    console.error("Uso: npx ts-node scripts/aplicar-receitas.ts <ficheiro.xlsx> [--apply]");
    process.exit(1);
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(ficheiro);
  const wsC = wb.getWorksheet("Consumíveis");
  const wsR = wb.getWorksheet("Receitas");
  if (!wsC || !wsR) {
    console.error('O ficheiro tem de conter as folhas "Consumíveis" e "Receitas".');
    process.exit(1);
  }

  // ── ler consumíveis ──
  type C = { nome: string; material: string; unidade: string; preco: number };
  const consumiveis: C[] = [];
  const erros: string[] = [];
  for (let r = 2; r <= wsC.rowCount; r++) {
    const nome = String(wsC.getCell(r, 1).value ?? "").trim();
    if (!nome) continue;
    const material = String(wsC.getCell(r, 2).value ?? "").trim();
    const unidade = String(wsC.getCell(r, 3).value ?? "").trim();
    const preco = Number(wsC.getCell(r, 4).value ?? 0);
    if (!MATERIAIS.has(material)) erros.push(`Consumíveis linha ${r}: tipo de material inválido "${material}"`);
    if (!(preco >= 0)) erros.push(`Consumíveis linha ${r}: preço inválido`);
    consumiveis.push({ nome, material, unidade, preco });
  }

  // ── ler receitas ──
  type L = { exame: string; exameId: string; consumivel: string; qtd: number };
  const linhas: L[] = [];
  for (let r = 2; r <= wsR.rowCount; r++) {
    const exameId = String(wsR.getCell(r, 2).value ?? "").trim();
    const consumivel = String(wsR.getCell(r, 3).value ?? "").trim();
    if (!exameId || !consumivel) continue;
    const qtd = Number(wsR.getCell(r, 4).value ?? 0);
    if (!(qtd > 0)) erros.push(`Receitas linha ${r}: quantidade inválida (${qtd})`);
    if (!consumiveis.some((c) => c.nome === consumivel))
      erros.push(`Receitas linha ${r}: consumível "${consumivel}" não consta da folha Consumíveis`);
    linhas.push({ exame: String(wsR.getCell(r, 1).value ?? "").trim(), exameId, consumivel, qtd });
  }

  // ── validar exames ──
  const idsExames = [...new Set(linhas.map((l) => l.exameId))];
  const existentes = await prisma.service.findMany({
    where: { id: { in: idsExames } }, select: { id: true, name: true },
  });
  const mapaExames = new Map(existentes.map((e) => [e.id, e.name]));
  for (const id of idsExames) if (!mapaExames.has(id)) erros.push(`Exame inexistente na base: ${id}`);

  if (erros.length) {
    console.error("Problemas encontrados — nada foi alterado:");
    erros.slice(0, 20).forEach((e) => console.error("  " + e));
    if (erros.length > 20) console.error(`  ... e mais ${erros.length - 20}`);
    process.exit(1);
  }

  // ── o que já existe ──
  const nomes = consumiveis.map((c) => c.nome);
  const jaExistem = await prisma.service.findMany({
    where: { name: { in: nomes }, deletedAt: null }, select: { id: true, name: true, type: true },
  });
  const porNome = new Map(jaExistem.map((s) => [s.name, s]));
  const aCriar = consumiveis.filter((c) => !porNome.has(c.nome));

  console.log(`Ficheiro: ${ficheiro}`);
  console.log(`Consumíveis no ficheiro: ${consumiveis.length}  (a criar: ${aCriar.length}, já existem: ${consumiveis.length - aCriar.length})`);
  console.log(`Exames com receita: ${idsExames.length}  |  linhas de receita: ${linhas.length}\n`);

  if (!apply) {
    if (aCriar.length) {
      console.log("Consumíveis a criar:");
      aCriar.forEach((c) => console.log(`  + ${c.nome.padEnd(34)} ${c.material.padEnd(12)} ${String(c.preco).padStart(9)} / ${c.unidade}`));
    }
    console.log("\nReceitas a aplicar:");
    for (const id of idsExames) {
      const itens = linhas.filter((l) => l.exameId === id);
      console.log(`  ${mapaExames.get(id)} — ${itens.length} itens`);
    }
    console.log("\n[SIMULAÇÃO] Nada foi gravado. Acrescenta --apply para aplicar.");
    await prisma.$disconnect();
    return;
  }

  // ── aplicar ──
  const cat = await prisma.category.findFirst({ where: { name: "Laboratório", categoryId: null, deletedAt: null } });
  if (!cat) throw new Error('Categoria "Laboratório" não encontrada.');
  const unidades = await prisma.unitOfMeasure.findMany({ select: { id: true, abbreviation: true } });
  const unidadeId = new Map(unidades.map((u) => [u.abbreviation, u.id]));

  const idPorNome = new Map<string, string>();
  for (const c of consumiveis) {
    const existente = porNome.get(c.nome);
    if (existente) {
      await prisma.service.update({
        where: { id: existente.id },
        data: {
          type: "CONSUMABLE",
          unit_price: c.preco,
          materialCategory: c.material as any,
          ...(unidadeId.has(c.unidade) ? { unitId: unidadeId.get(c.unidade) } : {}),
        },
      });
      idPorNome.set(c.nome, existente.id);
    } else {
      const novo = await prisma.service.create({
        data: {
          name: c.nome,
          type: "CONSUMABLE",
          unit_price: c.preco,
          materialCategory: c.material as any,
          categoryId: cat.id,
          ...(unidadeId.has(c.unidade) ? { unitId: unidadeId.get(c.unidade) } : {}),
        },
        select: { id: true },
      });
      idPorNome.set(c.nome, novo.id);
    }
  }

  const repo = new MaterialOfServiceRepository();
  for (const id of idsExames) {
    const itens = linhas
      .filter((l) => l.exameId === id)
      .map((l) => ({ consumableId: idPorNome.get(l.consumivel)!, quantity: l.qtd }));
    await repo.replaceForService(id, itens);
  }

  const totalConsumiveis = await prisma.service.count({ where: { type: "CONSUMABLE", deletedAt: null } });
  const totalReceitas = await prisma.materialOfService.count();
  console.log("✅ Aplicado.");
  console.log(`   Consumíveis na base: ${totalConsumiveis}`);
  console.log(`   Linhas de receita na base: ${totalReceitas}`);
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
