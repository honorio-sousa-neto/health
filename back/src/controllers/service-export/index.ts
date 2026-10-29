import ExcelJS from "exceljs";
import path from "path";
import os from "os";
import { prisma } from "../../database/prisma";

const TIPO: Record<string, string> = {
  PRODUCT: "Produto",
  SERVICE: "Serviço",
  CONSUMABLE: "Consumível",
};

/**
 * Exporta um artigo e o seu consumo padrão para xlsx.
 *
 * Segue o padrão que já existe no `excel-report`: o servidor escreve o
 * ficheiro num temporário e a rota devolve-o com `res.download`, apagando-o
 * a seguir. O frontend só abre o URL.
 */
export class ServiceExport {
  async handle(id: string): Promise<{ caminho: string; nome: string }> {
    const artigo = await prisma.service.findUnique({
      where: { id },
      include: {
        category: { include: { category: true } },
        unit: true,
        exemption: true,
        consumables: {
          include: { consumable: { include: { unit: true } } },
        },
      },
    });

    if (!artigo) throw new Error("Artigo não encontrado");

    const livro = new ExcelJS.Workbook();
    livro.creator = "MedicManager";
    livro.created = new Date();

    // ── Folha 1: a ficha ──────────────────────────────────────────────────
    const ficha = livro.addWorksheet("Ficha");
    ficha.columns = [
      { header: "Campo", key: "campo", width: 28 },
      { header: "Valor", key: "valor", width: 52 },
    ];

    const preco = Number(artigo.unit_price ?? 0);
    const desconto = Number(artigo.discount ?? 0);

    const linhas: Array<[string, string | number]> = [
      ["Nome", artigo.name ?? ""],
      ["Tipo", TIPO[artigo.type as string] ?? String(artigo.type ?? "")],
      ["Categoria", artigo.category?.category?.name ?? artigo.category?.name ?? ""],
      ["Descrição", artigo.description ?? ""],
      ["Preço (AOA)", preco],
      ["Unidade", artigo.unit ? `${artigo.unit.abbreviation} — ${artigo.unit.name}` : ""],
      ["Desconto (AOA)", desconto],
      ["IVA", artigo.tax ? `${Number(artigo.tax)}%` : "Isento"],
      ["Motivo de isenção", artigo.exemption ? `${artigo.exemption.code} — ${artigo.exemption.description}` : ""],
    ];
    linhas.forEach(([campo, valor]) => ficha.addRow({ campo, valor }));

    ficha.getColumn("valor").alignment = { wrapText: true, vertical: "top" };
    [5, 7].forEach((n) => (ficha.getRow(n).getCell("valor").numFmt = "#,##0.00"));

    // ── Folha 2: o consumo padrão ─────────────────────────────────────────
    const consumo = livro.addWorksheet("Consumo padrão");
    consumo.columns = [
      { header: "Item", key: "item", width: 40 },
      { header: "Tipo", key: "tipo", width: 16 },
      { header: "Quantidade", key: "quantidade", width: 14 },
      { header: "Unidade", key: "unidade", width: 14 },
    ];

    for (const linha of artigo.consumables ?? []) {
      consumo.addRow({
        item: linha.consumable?.name ?? "",
        tipo: TIPO[linha.consumable?.type as string] ?? "",
        quantidade: Number(linha.quantity ?? 0),
        unidade: linha.consumable?.unit?.abbreviation ?? "",
      });
    }

    if (!(artigo.consumables ?? []).length) {
      consumo.addRow({ item: "Sem consumo padrão definido." });
    }

    consumo.getColumn("quantidade").numFmt = "#,##0.###";
    consumo.getColumn("quantidade").alignment = { horizontal: "right" };

    // Cabeçalho a negrito nas duas folhas, como no relatório que já existe.
    [ficha, consumo].forEach((folha) => {
      folha.getRow(1).eachCell((celula) => {
        celula.font = { bold: true };
        celula.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEEF2F1" },
        };
      });
      folha.views = [{ state: "frozen", ySplit: 1 }];
    });

    const seguro = (artigo.name ?? "artigo")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()
      .slice(0, 60);

    const caminho = path.join(os.tmpdir(), `artigo-${id}-${Date.now()}.xlsx`);
    await livro.xlsx.writeFile(caminho);

    return { caminho, nome: `${seguro || "artigo"}-consumo-padrao.xlsx` };
  }
}
