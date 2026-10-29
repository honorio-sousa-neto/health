import ExcelJS from "exceljs";
import { prisma } from "../src/database/prisma";

const OUT = "/home/hon-rio-sousa/Development/Node/health/classificacao-servicos.xlsx";

/**
 * Regra proposta:
 *  - Farmácia (qualquer subcategoria) -> PRODUCT (fármacos vendáveis, com stock)
 *  - Laboratório sem subcategoria -> CONSUMABLE (reagentes/materiais; os exames
 *    vivem nas subcategorias Bioquímica/Serologia/Parasitologia/Hematologia)
 *  - Resto -> SERVICE
 */
function propor(rootCat: string, subCat: string): "SERVICE" | "PRODUCT" | "CONSUMABLE" {
  const root = (rootCat ?? "").toLowerCase();
  const semSub = subCat === "-";
  if (root.startsWith("farm")) return "PRODUCT";
  if (root.startsWith("laborat") && semSub) return "CONSUMABLE";
  return "SERVICE";
}

async function main() {
  const svcs = await prisma.service.findMany({
    where: { deletedAt: null },
    select: {
      id: true, name: true, type: true, unit_price: true, materialCategory: true,
      category: { select: { name: true, category: { select: { name: true } } } },
    },
  });

  const rows = svcs
    .map((s) => {
      const root = s.category?.category?.name ?? s.category?.name ?? "(sem categoria)";
      const sub = s.category?.category ? s.category.name : "-";
      return {
        id: s.id,
        nome: s.name,
        categoria: root,
        subcategoria: sub,
        preco: s.unit_price ?? 0,
        atual: s.type,
        proposto: propor(root, sub),
      };
    })
    .sort(
      (a, b) =>
        a.categoria.localeCompare(b.categoria, "pt") ||
        a.subcategoria.localeCompare(b.subcategoria, "pt") ||
        a.nome.localeCompare(b.nome, "pt")
    );

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Classificação", { views: [{ state: "frozen", ySplit: 2 }] });

  // Instruções
  ws.mergeCells(1, 1, 1, 7);
  ws.getCell(1, 1).value =
    'Revê a coluna "TIPO PROPOSTO" (lista suspensa: SERVICE / PRODUCT / CONSUMABLE). Corrige o que estiver errado e grava. Não alteres a coluna ID.';
  ws.getCell(1, 1).font = { italic: true, size: 10, color: { argb: "FF555555" } };
  ws.getCell(1, 1).alignment = { vertical: "middle" };
  ws.getRow(1).height = 26;

  const headers = ["ID", "Nome", "Categoria", "Subcategoria", "Preço", "Tipo actual", "TIPO PROPOSTO"];
  headers.forEach((h, i) => {
    const cell = ws.getCell(2, i + 1);
    cell.value = h;
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8EEF7" } };
    cell.border = { bottom: { style: "thin", color: { argb: "FFB0BEC5" } } };
  });

  const widths = [38, 46, 24, 26, 12, 13, 18];
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));

  const cor: Record<string, string> = {
    SERVICE: "FFE3F2FD",
    PRODUCT: "FFE8F5E9",
    CONSUMABLE: "FFFFF3E0",
  };

  rows.forEach((r, i) => {
    const n = 3 + i;
    ws.getCell(n, 1).value = r.id;
    ws.getCell(n, 2).value = r.nome;
    ws.getCell(n, 3).value = r.categoria;
    ws.getCell(n, 4).value = r.subcategoria;
    ws.getCell(n, 5).value = r.preco;
    ws.getCell(n, 6).value = r.atual;
    ws.getCell(n, 7).value = r.proposto;

    ws.getCell(n, 1).font = { size: 8, color: { argb: "FF999999" } };
    ws.getCell(n, 5).numFmt = "#,##0.00";
    ws.getCell(n, 7).font = { bold: true };
    ws.getCell(n, 7).alignment = { horizontal: "center" };
    ws.getCell(n, 7).fill = {
      type: "pattern", pattern: "solid", fgColor: { argb: cor[r.proposto] },
    };
    // Lista suspensa para evitar valores inválidos
    ws.getCell(n, 7).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: ['"SERVICE,PRODUCT,CONSUMABLE"'],
      showErrorMessage: true,
      errorTitle: "Valor inválido",
      error: "Escolhe SERVICE, PRODUCT ou CONSUMABLE",
    };
  });

  ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2 + rows.length, column: 7 } };

  await wb.xlsx.writeFile(OUT);

  const cont: Record<string, number> = {};
  rows.forEach((r) => (cont[r.proposto] = (cont[r.proposto] ?? 0) + 1));
  console.log("Gerado:", OUT);
  console.log("Total:", rows.length);
  console.log("Proposta:", JSON.stringify(cont, null, 2));
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
