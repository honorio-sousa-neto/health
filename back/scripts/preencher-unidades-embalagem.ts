/**
 * Preenche Service.unitsPerPackage (doses por embalagem vendável) a partir do
 * NOME do produto, onde houver um padrão claro (ex.: "Capsula de 20 Comp" -> 20).
 *
 *   npx ts-node scripts/preencher-unidades-embalagem.ts            (dry-run)
 *   npx ts-node scripts/preencher-unidades-embalagem.ts --apply    (grava)
 *
 * Conservador de propósito: só grava quando o número está inequivocamente ligado
 * a comprimidos/cápsulas. Padrões ambíguos (ex.: "10X10") e formas líquidas
 * (xarope, injeção) são deixados para preenchimento manual, para não corromper
 * a facturação. Não toca em produtos que já tenham unitsPerPackage definido.
 */
import { prisma } from "../src/database/prisma";

const APPLY = process.argv.includes("--apply");

const LIQUIDO = /(xarope|susp|soluç|gotas|inje|injec|amp\b|ampola|ml\b|bebÍvel|bebivel|linctus)/i;

/** Devolve { qty } quando extrai, ou { ambiguo } / null. */
function parse(name: string): { qty?: number; ambiguo?: string } | null {
  const s = (name || "");

  // "NxM" (ex.: 10X10) = M comprimidos por cartela (a caixa tem N cartelas de M).
  // A unidade de venda é a cartela, logo unitsPerPackage = M.
  const nxm = s.match(/\b(\d+)\s*[xX]\s*(\d+)\b/);
  if (nxm) return { qty: Number(nxm[2]) };

  // "de N comp/cáps" ou "N comp/cáps" (comprimidos/cápsulas), sem ser dosagem.
  const m = s.match(/(\d+)\s*(?:comprimidos?|comp|cáps(?:ulas?)?|caps)\b/i);
  if (m) {
    // rejeita se o número é seguido de unidade de dose (mg/ml/g)
    if (/\d+\s*(mg|ml|g|mcg|µg)/i.test(m[0])) return null;
    return { qty: Number(m[1]) };
  }
  return null;
}

async function main() {
  const meds = await prisma.service.findMany({
    where: { type: "PRODUCT", deletedAt: null, unitsPerPackage: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const aplicar: { id: string; name: string; qty: number }[] = [];
  const ambiguos: string[] = [];
  const liquidos: string[] = [];

  for (const m of meds) {
    if (LIQUIDO.test(m.name)) { liquidos.push(m.name); continue; }
    const r = parse(m.name);
    if (r?.qty && r.qty >= 2 && r.qty <= 1000) aplicar.push({ id: m.id, name: m.name, qty: r.qty });
    else if (r?.ambiguo) ambiguos.push(`${r.ambiguo}  ←  ${m.name}`);
  }

  console.log(`${meds.length} produtos sem unitsPerPackage.\n`);
  console.log(`✅ A PREENCHER (${aplicar.length}) — nº doses por embalagem:`);
  aplicar.forEach((x) => console.log(`   ${String(x.qty).padStart(4)}  ${x.name}`));

  if (ambiguos.length) {
    console.log(`\n⚠️  AMBÍGUOS (${ambiguos.length}) — rever à mão (não gravados):`);
    ambiguos.forEach((a) => console.log("   " + a));
  }
  console.log(`\nℹ️  Formas líquidas/injetáveis ignoradas (1:1): ${liquidos.length}`);
  console.log(`ℹ️  Restantes sem padrão (manual): ${meds.length - aplicar.length - ambiguos.length - liquidos.length}`);

  if (!APPLY) {
    console.log("\n[dry-run] Nada gravado. Corra com --apply para gravar os ✅.");
    return;
  }

  await prisma.$transaction(
    aplicar.map((x) => prisma.service.update({ where: { id: x.id }, data: { unitsPerPackage: x.qty } }))
  );
  console.log(`\n💾 Gravados ${aplicar.length} produtos.`);
}

main()
  .catch((e) => { console.error(e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
