import ExcelJS from "exceljs";
import { prisma } from "../../database/prisma";

/**
 * Relatório mensal de inventário em Excel.
 *
 * Uma linha por produto:
 *   Produto | Estoque inicial | Entradas | 1 | 2 | ... | 31 | Saldo
 *
 *   - Estoque inicial: saldo acumulado até ao 1.º dia do mês
 *   - Entradas: total de entradas no mês (uma só coluna)
 *   - 1..31: a SAÍDA de cada dia (só saídas; sem discriminar tipo)
 *   - Saldo: inicial + entradas - saídas
 *
 * O saldo segue a mesma semântica do saldo do /inventario: só contam movimentos
 * com localização. Sem filtro de departamento, as transferências são internas
 * (net zero) e não entram nas colunas; com filtro, contam as pernas que tocam
 * o departamento escolhido.
 */

type Params = { year: number; month: number; locationId?: string };

type Mov = {
  productId: string;
  quantity: number;
  type: string;
  createdAt: Date;
  fromLocationId: string | null;
  toLocationId: string | null;
  product: { name: string | null } | null;
};

const HEADER_FILL = "FFE8EEF7";
const ENTRADAS_FILL = "FFE6F4EC";
const BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFD8DEE9" } },
  left: { style: "thin", color: { argb: "FFD8DEE9" } },
  bottom: { style: "thin", color: { argb: "FFD8DEE9" } },
  right: { style: "thin", color: { argb: "FFD8DEE9" } },
};

// `movements` pode ser injectado nos testes; em produção vem da base de dados.
export async function buildMonthlyStockWorkbook(
  { year, month, locationId }: Params,
  movements?: Mov[]
) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  const daysInMonth = end.getDate();

  movements = movements ?? ((await prisma.movimentationStock.findMany({
    where: {
      createdAt: { lte: end },
      ...(locationId
        ? { OR: [{ fromLocationId: locationId }, { toLocationId: locationId }] }
        : {}),
    },
    select: {
      productId: true,
      quantity: true,
      type: true,
      createdAt: true,
      fromLocationId: true,
      toLocationId: true,
      product: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  })) as unknown as Mov[]);

  // ── quanto um movimento acrescenta / retira, no âmbito do relatório ──
  const matchTo = (m: Mov) => (locationId ? m.toLocationId === locationId : m.toLocationId != null);
  const matchFrom = (m: Mov) => (locationId ? m.fromLocationId === locationId : m.fromLocationId != null);

  const inQty = (m: Mov) => {
    if (m.type === "ENTRY") return matchTo(m) ? m.quantity : 0;
    if (m.type === "TRANSFER") return locationId && m.toLocationId === locationId ? m.quantity : 0;
    return 0;
  };
  const outQty = (m: Mov) => {
    if (m.type === "EXIT" || m.type === "OUT") return matchFrom(m) ? m.quantity : 0;
    if (m.type === "TRANSFER") return locationId && m.fromLocationId === locationId ? m.quantity : 0;
    return 0;
  };

  // ── agregação ──
  const names = new Map<string, string>();
  const opening = new Map<string, number>();     // saldo até ao 1.º do mês
  const entradasMes = new Map<string, number>(); // total de entradas no mês
  const saidasDia = new Map<string, number[]>();  // saída por dia do mês
  const activeInMonth = new Set<string>();

  const blankDays = () => Array.from({ length: daysInMonth }, () => 0);

  for (const m of movements) {
    const i = inQty(m);
    const o = outQty(m);
    if (i === 0 && o === 0) continue;

    names.set(m.productId, m.product?.name ?? m.productId);

    if (m.createdAt < start) {
      opening.set(m.productId, (opening.get(m.productId) ?? 0) + i - o);
    } else {
      if (i) {
        entradasMes.set(m.productId, (entradasMes.get(m.productId) ?? 0) + i);
        activeInMonth.add(m.productId);
      }
      if (o) {
        if (!saidasDia.has(m.productId)) saidasDia.set(m.productId, blankDays());
        saidasDia.get(m.productId)![m.createdAt.getDate() - 1] += o;
        activeInMonth.add(m.productId);
      }
    }
  }

  // Produtos relevantes: com estoque inicial ou com movimento no mês
  const productIds = [...names.keys()]
    .filter((id) => (opening.get(id) ?? 0) !== 0 || activeInMonth.has(id))
    .sort((a, b) => (names.get(a) ?? "").localeCompare(names.get(b) ?? "", "pt"));

  // ── folha ──
  const wb = new ExcelJS.Workbook();
  wb.created = new Date();
  const ws = wb.addWorksheet(`${String(month).padStart(2, "0")}-${year}`, {
    views: [{ state: "frozen", xSplit: 3, ySplit: 1 }],
  });

  // Colunas: Produto | Estoque inicial | Entradas | 1..N | Saldo
  const COL_PRODUTO = 1;
  const COL_INICIAL = 2;
  const COL_ENTRADAS = 3;
  const COL_DIA1 = 4;
  const lastCol = COL_DIA1 + daysInMonth; // = dia N + coluna Saldo

  // Cabeçalho (uma linha)
  ws.getCell(1, COL_PRODUTO).value = "Produto";
  ws.getCell(1, COL_INICIAL).value = "Estoque inicial";
  ws.getCell(1, COL_ENTRADAS).value = "Entradas";
  for (let d = 1; d <= daysInMonth; d++) ws.getCell(1, COL_DIA1 + (d - 1)).value = d;
  ws.getCell(1, lastCol).value = "Saldo";

  // Larguras
  ws.getColumn(COL_PRODUTO).width = 38;
  ws.getColumn(COL_INICIAL).width = 14;
  ws.getColumn(COL_ENTRADAS).width = 11;
  for (let d = 0; d < daysInMonth; d++) ws.getColumn(COL_DIA1 + d).width = 6;
  ws.getColumn(lastCol).width = 12;

  // Dados
  productIds.forEach((id, idx) => {
    const rowIdx = 2 + idx;
    const open = opening.get(id) ?? 0;
    const entradas = entradasMes.get(id) ?? 0;
    const saidas = saidasDia.get(id) ?? blankDays();

    ws.getCell(rowIdx, COL_PRODUTO).value = names.get(id) ?? id;
    ws.getCell(rowIdx, COL_INICIAL).value = open;
    ws.getCell(rowIdx, COL_ENTRADAS).value = entradas;

    let totalSaidas = 0;
    for (let d = 0; d < daysInMonth; d++) {
      const v = saidas[d];
      ws.getCell(rowIdx, COL_DIA1 + d).value = v || null; // dias sem saída ficam vazios
      totalSaidas += v;
    }
    ws.getCell(rowIdx, lastCol).value = open + entradas - totalSaidas;
  });

  const lastRow = 1 + productIds.length;

  // ── estilos ──
  for (let c = 1; c <= lastCol; c++) {
    const cell = ws.getCell(1, c);
    cell.font = { bold: true, size: 11 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: c === COL_ENTRADAS ? ENTRADAS_FILL : HEADER_FILL },
    };
    cell.border = BORDER;
  }
  ws.getCell(1, COL_PRODUTO).alignment = { horizontal: "left", vertical: "middle" };

  for (let r = 2; r <= lastRow; r++) {
    for (let c = 1; c <= lastCol; c++) {
      const cell = ws.getCell(r, c);
      cell.border = BORDER;
      if (c === COL_PRODUTO) {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.numFmt = "0.###";
      }
      if (c === COL_INICIAL || c === COL_ENTRADAS || c === lastCol) cell.font = { bold: true };
      if (c === COL_ENTRADAS) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ENTRADAS_FILL } };
      }
    }
  }

  return wb;
}
