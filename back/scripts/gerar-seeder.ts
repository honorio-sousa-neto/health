/**
 * Compila o seeder do consumo padrão a partir do estado actual da base de dados.
 *
 *   npx ts-node scripts/gerar-seeder.ts
 *
 * Lê os consumíveis e as receitas já validados e escreve
 * prisma/seed-consumo-padrao.js — auto-suficiente, sem depender dos ficheiros
 * Excel nem de IDs desta base (os serviços são resolvidos por nome).
 */
import fs from "fs";
import { prisma } from "../src/database/prisma";

const OUT = "/home/hon-rio-sousa/Development/Node/health/back/prisma/seed-consumo-padrao.js";

const js = (v: unknown) => JSON.stringify(v);

async function main() {
  // ── consumíveis ──
  const consumiveis = await prisma.service.findMany({
    where: { type: "CONSUMABLE", deletedAt: null },
    select: {
      name: true, unit_price: true, materialCategory: true,
      unit: { select: { abbreviation: true } },
    },
    orderBy: { name: "asc" },
  });

  // ── receitas, agrupadas por nome de serviço ──
  const linhas = await prisma.materialOfService.findMany({
    include: {
      service: { select: { name: true } },
      consumable: { select: { name: true } },
    },
  });

  const porServico = new Map<string, { c: string; q: number }[]>();
  for (const l of linhas) {
    const nome = l.service.name;
    if (!porServico.has(nome)) porServico.set(nome, []);
    porServico.get(nome)!.push({ c: l.consumable.name, q: Number(l.quantity) });
  }
  const receitas = [...porServico.entries()]
    .map(([servico, itens]) => ({ servico, itens: itens.sort((a, b) => a.c.localeCompare(b.c, "pt")) }))
    .sort((a, b) => a.servico.localeCompare(b.servico, "pt"));

  const totalLinhas = receitas.reduce((n, r) => n + r.itens.length, 0);

  const conteudo = `/**
 * Seed do consumo padrão (receitas de consumíveis por serviço).
 *
 *   node prisma/seed-consumo-padrao.js                    aplica tudo
 *   node prisma/seed-consumo-padrao.js --dry-run          simula
 *   node prisma/seed-consumo-padrao.js --skip-classificacao
 *
 * Idempotente: pode correr as vezes que forem precisas. Os consumíveis são
 * reaproveitados pelo nome e as receitas substituídas, nunca acumuladas.
 *
 * Os serviços são resolvidos por NOME, não por ID — o seeder funciona em
 * qualquer base, desde que os serviços já existam (correr depois de
 * seed-services.js).
 *
 * GERADO por scripts/gerar-seeder.ts a partir de dados já validados contra o
 * Mapa de Rentabilidade/Custeio. Para actualizar: altere as receitas na
 * aplicação e volte a correr o gerador.
 *
 * Cobertura: ${receitas.length} serviços, ${consumiveis.length} consumíveis, ${totalLinhas} linhas.
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_CLASSIFICACAO = process.argv.includes("--skip-classificacao");

/**
 * Classificação por categoria-raiz:
 *   Farmácia            -> PRODUCT     (vendáveis, com stock)
 *   Laboratório (raiz)  -> CONSUMABLE  (reagentes e materiais)
 *   restantes           -> SERVICE
 * As subcategorias do Laboratório (Bioquímica, Serologia, ...) são exames,
 * logo SERVICE.
 */
function classificar(raiz, temSubcategoria) {
  const r = (raiz || "").toLowerCase();
  if (r.startsWith("farm")) return "PRODUCT";
  if (r.startsWith("laborat") && !temSubcategoria) return "CONSUMABLE";
  return "SERVICE";
}

/** Catálogo de consumíveis. */
const CONSUMIVEIS = [
${consumiveis
  .map(
    (c) =>
      `  { nome: ${js(c.name)}, preco: ${c.unit_price ?? 0}, material: ${js(
        c.materialCategory ?? "consumable"
      )}, unidade: ${js(c.unit?.abbreviation ?? "un")} },`
  )
  .join("\n")}
];

/** Receitas: quanto cada serviço consome de cada consumível. */
const RECEITAS = [
${receitas
  .map(
    (r) =>
      `  { servico: ${js(r.servico)}, itens: [${r.itens
        .map((i) => `{ c: ${js(i.c)}, q: ${i.q} }`)
        .join(", ")}] },`
  )
  .join("\n")}
];

async function aplicarClassificacao() {
  const servicos = await prisma.service.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, type: true, category: { select: { name: true, category: { select: { name: true } } } } },
  });

  const mudancas = [];
  for (const s of servicos) {
    const raiz = s.category?.category?.name ?? s.category?.name ?? "";
    const proposto = classificar(raiz, !!s.category?.category);
    if (s.type !== proposto) mudancas.push({ id: s.id, de: s.type, para: proposto });
  }

  if (!mudancas.length) {
    console.log("  classificação já correcta, nada a fazer");
    return;
  }

  const resumo = {};
  mudancas.forEach((m) => {
    const k = m.de + " -> " + m.para;
    resumo[k] = (resumo[k] || 0) + 1;
  });
  Object.entries(resumo).forEach(([k, v]) => console.log("  " + String(v).padStart(4) + "  " + k));

  if (DRY_RUN) return;
  await prisma.$transaction(
    mudancas.map((m) => prisma.service.update({ where: { id: m.id }, data: { type: m.para } }))
  );
}

async function aplicarConsumiveis() {
  const categoria = await prisma.category.findFirst({
    where: { name: "Laboratório", categoryId: null, deletedAt: null },
    select: { id: true },
  });
  if (!categoria) throw new Error('Categoria "Laboratório" não encontrada — correr seed-services.js primeiro.');

  const unidades = await prisma.unitOfMeasure.findMany({ select: { id: true, abbreviation: true } });
  const unidadeId = new Map(unidades.map((u) => [u.abbreviation, u.id]));

  const existentes = await prisma.service.findMany({
    where: { name: { in: CONSUMIVEIS.map((c) => c.nome) }, deletedAt: null },
    select: { id: true, name: true },
  });
  const porNome = new Map(existentes.map((s) => [s.name, s.id]));

  const criar = CONSUMIVEIS.filter((c) => !porNome.has(c.nome)).length;
  console.log("  " + criar + " a criar, " + (CONSUMIVEIS.length - criar) + " já existem");
  if (DRY_RUN) return porNome;

  for (const c of CONSUMIVEIS) {
    const dados = {
      type: "CONSUMABLE",
      unit_price: c.preco,
      materialCategory: c.material,
      ...(unidadeId.has(c.unidade) ? { unitId: unidadeId.get(c.unidade) } : {}),
    };
    const id = porNome.get(c.nome);
    if (id) {
      await prisma.service.update({ where: { id }, data: dados });
    } else {
      const novo = await prisma.service.create({
        data: { name: c.nome, categoryId: categoria.id, ...dados },
        select: { id: true },
      });
      porNome.set(c.nome, novo.id);
    }
  }
  return porNome;
}

async function aplicarReceitas(idPorNome) {
  const nomes = RECEITAS.map((r) => r.servico);
  const servicos = await prisma.service.findMany({
    where: { name: { in: nomes }, deletedAt: null },
    select: { id: true, name: true },
  });
  const idServico = new Map(servicos.map((s) => [s.name, s.id]));

  const emFalta = nomes.filter((n) => !idServico.has(n));
  if (emFalta.length) {
    console.log("  " + emFalta.length + " serviço(s) não encontrado(s) pelo nome — receita ignorada:");
    emFalta.forEach((n) => console.log("      - " + n));
  }

  const aplicaveis = RECEITAS.filter((r) => idServico.has(r.servico));
  console.log("  " + aplicaveis.length + " receitas aplicáveis");
  if (DRY_RUN) return;

  for (const r of aplicaveis) {
    const serviceId = idServico.get(r.servico);
    const itens = r.itens
      .map((i) => ({ consumableId: idPorNome.get(i.c), quantity: i.q }))
      .filter((i) => i.consumableId);

    await prisma.$transaction(async (tx) => {
      await tx.materialOfService.deleteMany({
        where: { serviceId, consumableId: { notIn: itens.map((i) => i.consumableId) } },
      });
      for (const it of itens) {
        await tx.materialOfService.upsert({
          where: { consumableId_serviceId: { consumableId: it.consumableId, serviceId } },
          update: { quantity: it.quantity },
          create: { serviceId, consumableId: it.consumableId, quantity: it.quantity },
        });
      }
    });
  }
}

async function main() {
  console.log(DRY_RUN ? "[SIMULAÇÃO] nada será gravado\\n" : "");

  if (SKIP_CLASSIFICACAO) {
    console.log("Classificação: ignorada (--skip-classificacao)");
  } else {
    console.log("Classificação de serviços/produtos/consumíveis:");
    await aplicarClassificacao();
  }

  console.log("\\nCatálogo de consumíveis:");
  const idPorNome = await aplicarConsumiveis();

  console.log("\\nReceitas de consumo padrão:");
  await aplicarReceitas(idPorNome);

  if (!DRY_RUN) {
    const nConsumiveis = await prisma.service.count({ where: { type: "CONSUMABLE", deletedAt: null } });
    const nLinhas = await prisma.materialOfService.count();
    const comReceita = await prisma.materialOfService.groupBy({ by: ["serviceId"], _count: true });
    console.log("\\n✅ Concluído.");
    console.log("   " + nConsumiveis + " consumíveis | " + comReceita.length + " serviços com consumo padrão | " + nLinhas + " linhas");
  }

  if (!DRY_RUN) await prisma.$disconnect();
}

module.exports = main;

// Só corre sozinho quando invocado directamente; via seed-all.js é importado.
if (require.main === module) {
  main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
}
`;

  fs.writeFileSync(OUT, conteudo, "utf8");
  console.log("Gerado:", OUT);
  console.log(`  ${consumiveis.length} consumíveis | ${receitas.length} serviços | ${totalLinhas} linhas`);
  console.log(`  ${(conteudo.length / 1024).toFixed(1)} KB`);
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
