import { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";

/**
 * Serviço central de estoque — fonte única da verdade.
 *
 * Toda entrada/saída de stock DEVE passar por aqui para garantir que:
 *  - o movimento carrega SEMPRE uma localização (from/to) — condição para
 *    aparecer no saldo do /inventario e nos alertas de stock mínimo;
 *  - o movimento carrega o lote (batchProductId) quando aplicável;
 *  - a quantidade do lote (BatchProduct.quantity) é mantida coerente com o ledger;
 *  - saídas seguem FEFO (First-Expired-First-Out).
 *
 * As funções aceitam um Prisma.TransactionClient para poderem ser compostas
 * dentro de uma transação (ex.: compra, fatura).
 */

type Tx = Prisma.TransactionClient;
export class StockError extends Error {}

// All mutations serialize on the product row, including transfers between locations.
// Call only with an interactive transaction client: the lock lasts until commit.
async function lockProduct(tx: Tx, productId: string) {
  await tx.$queryRaw`SELECT "id" FROM "Service" WHERE "id" = ${productId}::uuid FOR UPDATE`;
}
function requireQuantity(quantity: number) {
  if (!Number.isFinite(quantity) || quantity <= 0) throw new StockError("Quantidade inválida");
}

/**
 * Motivos de movimento centralizados — evita strings mágicas espalhadas.
 * O campo `reason` é String no schema; usar sempre estes valores.
 */
export const STOCK_REASON = {
  purchase: "purchase",
  sale: "sale",
  consumption: "consumption",
  serviceConsumption: "service_consumption",
  transfer: "transfer",
  positiveAdjustment: "positive_adjustment",
  negativeAdjustment: "negative_adjustment",
  expiry: "expiry",
  loss: "loss",
  purchaseReversal: "purchase_reversal",
} as const;

/** Motivos de ajuste que retiram stock (os restantes acrescentam). */
export const NEGATIVE_ADJUSTMENT_REASONS: string[] = [
  STOCK_REASON.negativeAdjustment,
  STOCK_REASON.expiry,
  STOCK_REASON.loss,
];

export type StockEntryArgs = {
  productId: string;
  locationId: string;
  quantity: number;
  batch?: string | null;
  expiration?: Date | null;
  reason?: string;
  description?: string;
  userId?: string;
};

export type StockExitArgs = {
  productId: string;
  locationId: string;
  quantity: number;
  reason?: string;
  description?: string;
  userId?: string;
  attendanceId?: string;
  /** Quando true, recusa a saída se o saldo da localização for insuficiente. */
  enforceAvailability?: boolean;
};

export type StockTransferArgs = {
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  reason?: string;
  description?: string;
  userId?: string;
};

export type StockAdjustArgs = {
  productId: string;
  locationId: string;
  quantity: number;
  reason: string;
  batch?: string | null;
  expiration?: Date | null;
  description?: string;
  userId?: string;
};

export type StockReverseEntryArgs = {
  productId: string;
  locationId: string;
  quantity: number;
  batch?: string | null;
  reason?: string;
  description?: string;
  userId?: string;
};

/** Resolve a localização padrão (isDefault) para movimentos sem local explícito. */
export async function resolveDefaultLocationId(client: Tx | typeof prisma = prisma): Promise<string | null> {
  const loc = await client.stockLocation.findFirst({
    where: { isDefault: true, deletedAt: null },
    orderBy: { createdAt: "asc" },
  });
  return loc?.id ?? null;
}

/** Saldo total de um produto somando todas as localizações (a partir do ledger). */
export async function totalBalance(client: Tx | typeof prisma, productId: string): Promise<number> {
  const [credits, debits] = await Promise.all([
    client.movimentationStock.aggregate({
      where: { productId, type: { in: ["ENTRY", "TRANSFER"] }, toLocationId: { not: null } },
      _sum: { quantity: true },
    }),
    client.movimentationStock.aggregate({
      where: { productId, type: { in: ["EXIT", "OUT", "TRANSFER"] }, fromLocationId: { not: null } },
      _sum: { quantity: true },
    }),
  ]);
  return (credits._sum.quantity ?? 0) - (debits._sum.quantity ?? 0);
}

/** Saldo de um produto numa localização específica (a partir do ledger). */
export async function balanceAtLocation(
  client: Tx | typeof prisma,
  productId: string,
  locationId: string
): Promise<number> {
  const [credits, debits] = await Promise.all([
    client.movimentationStock.aggregate({
      where: { productId, toLocationId: locationId, type: { in: ["ENTRY", "TRANSFER"] } },
      _sum: { quantity: true },
    }),
    client.movimentationStock.aggregate({
      where: { productId, fromLocationId: locationId, type: { in: ["EXIT", "OUT", "TRANSFER"] } },
      _sum: { quantity: true },
    }),
  ]);
  return (credits._sum.quantity ?? 0) - (debits._sum.quantity ?? 0);
}

/**
 * Atualiza o custo médio ponderado do produto (em unidade-base) após uma
 * entrada. Deve ser chamada DEPOIS da entrada — usa o saldo já actualizado e
 * subtrai a quantidade adicionada para obter o stock anterior. NÃO toca no
 * unit_price (preço de venda), que é gerido separadamente.
 */
export async function updateMovingAverageCost(
  tx: Tx,
  productId: string,
  addedQty: number,
  addedUnitCost: number
) {
  if (!(addedQty > 0)) return;
  const svc = await tx.service.findUnique({ where: { id: productId }, select: { cost: true } });
  const oldCost = svc?.cost ?? 0;
  const currentStock = await totalBalance(tx, productId); // já inclui a entrada
  const oldStock = Math.max(currentStock - addedQty, 0);
  const newCost =
    currentStock > 0
      ? (oldStock * oldCost + addedQty * addedUnitCost) / currentStock
      : addedUnitCost;
  await tx.service.update({ where: { id: productId }, data: { cost: newCost } });
}

/**
 * Regista uma ENTRADA de stock numa localização.
 * Se `batch` for fornecido, faz upsert do lote e incrementa a quantidade.
 */
export async function stockEntry(tx: Tx, args: StockEntryArgs) {
  const { productId, locationId, quantity, batch, expiration, reason, description, userId } = args;
  requireQuantity(quantity);
  await lockProduct(tx, productId);

  let batchProductId: string | undefined;
  if (batch) {
    const bp = await tx.batchProduct.upsert({
      where: { productId_batch_locationId: { productId, batch, locationId } },
      update: { quantity: { increment: quantity }, ...(expiration ? { expiration } : {}) },
      create: { productId, batch, quantity, expiration: expiration ?? null, locationId },
    });
    batchProductId = bp.id;
  }

  return tx.movimentationStock.create({
    data: {
      productId,
      toLocationId: locationId,
      quantity,
      type: "ENTRY",
      reason: reason ?? "purchase",
      description,
      ...(batchProductId ? { batchProductId } : {}),
      ...(userId ? { userId } : {}),
    },
  });
}

/**
 * Regista uma SAÍDA de stock a partir de uma localização, seguindo FEFO.
 * Consome os lotes por validade ascendente, dividindo entre vários lotes se
 * necessário. Se não houver lotes suficientes, regista o remanescente sem lote
 * (para o saldo do ledger permanecer correto).
 * Devolve os movimentos criados.
 */
export async function stockExit(tx: Tx, args: StockExitArgs) {
  const { productId, locationId, quantity, reason, description, userId, attendanceId } = args;
  requireQuantity(quantity);
  await lockProduct(tx, productId);

  { // Availability is mandatory for every exit, including sales and dispensing.
    const available = await balanceAtLocation(tx, productId, locationId);
    if (available < quantity) {
      const product = await tx.service.findUnique({ where: { id: productId }, select: { name: true } });
      throw new StockError(
        `Stock insuficiente de "${product?.name ?? productId}" nesta localização: disponível ${available}, pedido ${quantity}.`
      );
    }
  }

  const base = {
    productId,
    fromLocationId: locationId,
    type: "EXIT" as const,
    reason: reason ?? "consumption",
    description,
    ...(userId ? { userId } : {}),
    ...(attendanceId ? { attendanceId } : {}),
  };

  const batches = await tx.batchProduct.findMany({
    where: { productId, locationId, quantity: { gt: 0 } },
    orderBy: [{ expiration: "asc" }, { createdAt: "asc" }],
  });

  const disposal = [STOCK_REASON.expiry, STOCK_REASON.loss, STOCK_REASON.negativeAdjustment].includes(reason as any);
  const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Luanda" }) + "T00:00:00+01:00");
  const expired = batches.filter((b) => b.expiration && b.expiration < today);
  const expiredQuantity = expired.reduce((sum, b) => sum + b.quantity, 0);
  const available = await balanceAtLocation(tx, productId, locationId);
  if (!disposal && quantity > available - expiredQuantity) throw new StockError("Stock válido insuficiente; existem lotes expirados.");
  const eligible = disposal ? batches : batches.filter((b) => !b.expiration || b.expiration >= today);

  const movements = [];
  let remaining = quantity;

  for (const b of eligible) {
    if (remaining <= 0) break;
    const take = Math.min(b.quantity, remaining);
    const changed = await tx.batchProduct.updateMany({ where: { id: b.id, quantity: { gte: take } }, data: { quantity: { decrement: take } } });
    if (changed.count !== 1) throw new StockError("O stock foi alterado. Repita a operação.");
    movements.push(
      await tx.movimentationStock.create({ data: { ...base, quantity: take, batchProductId: b.id } })
    );
    remaining -= take;
  }

  if (remaining > 0) {
    movements.push(await tx.movimentationStock.create({ data: { ...base, quantity: remaining } }));
    remaining = 0;
  }

  return movements;
}

/**
 * Transfere stock entre localizações. Um único movimento TRANSFER carrega
 * origem e destino, pelo que o total de stock (e o total dos lotes) não muda —
 * só muda a distribuição por localização. Valida sempre o saldo da origem.
 */
export async function stockTransfer(tx: Tx, args: StockTransferArgs) {
  const { productId, fromLocationId, toLocationId, quantity, reason, description, userId } = args;
  requireQuantity(quantity);
  await lockProduct(tx, productId);
  if (fromLocationId === toLocationId) {
    throw new StockError("Origem e destino não podem ser iguais.");
  }

  const available = await balanceAtLocation(tx, productId, fromLocationId);
  if (available < quantity) {
    const product = await tx.service.findUnique({ where: { id: productId }, select: { name: true } });
    throw new StockError(
      `Stock insuficiente de "${product?.name ?? productId}" na origem: disponível ${available}, pedido ${quantity}.`
    );
  }

  const baseMov = {
    productId,
    fromLocationId,
    toLocationId,
    type: "TRANSFER" as const,
    reason: reason ?? STOCK_REASON.transfer,
    description,
    ...(userId ? { userId } : {}),
  };

  // FEFO nos lotes da origem: cada lote consumido é recriado no destino com o
  // mesmo número de lote e validade, para o rasto do lote seguir o produto.
  const batches = await tx.batchProduct.findMany({
    where: { productId, locationId: fromLocationId, quantity: { gt: 0 } },
    orderBy: [{ expiration: "asc" }, { createdAt: "asc" }],
  });

  const movements = [];
  let remaining = quantity;

  for (const b of batches) {
    if (remaining <= 0) break;
    const take = Math.min(b.quantity, remaining);
    const changed = await tx.batchProduct.updateMany({ where: { id: b.id, quantity: { gte: take } }, data: { quantity: { decrement: take } } });
    if (changed.count !== 1) throw new StockError("O stock foi alterado. Repita a operação.");
    const dest = await tx.batchProduct.upsert({
      where: { productId_batch_locationId: { productId, batch: b.batch, locationId: toLocationId } },
      update: { quantity: { increment: take }, ...(b.expiration ? { expiration: b.expiration } : {}) },
      create: { productId, batch: b.batch, quantity: take, expiration: b.expiration, locationId: toLocationId },
    });
    movements.push(
      await tx.movimentationStock.create({ data: { ...baseMov, quantity: take, batchProductId: dest.id } })
    );
    remaining -= take;
  }

  // Remanescente sem lote (stock da origem que não estava associado a lote).
  if (remaining > 0) {
    movements.push(await tx.movimentationStock.create({ data: { ...baseMov, quantity: remaining } }));
    remaining = 0;
  }

  return movements;
}

/**
 * Ajuste de inventário. Motivos negativos (quebra, expirado, ajuste negativo)
 * retiram stock via FEFO; os restantes acrescentam. Assim o lote é sempre
 * mantido coerente com o ledger, seja qual for o sentido do ajuste.
 * Devolve sempre a lista de movimentos criados.
 */
export async function stockAdjust(tx: Tx, args: StockAdjustArgs) {
  const quantity = Math.abs(args.quantity);
  if (!(quantity > 0)) return [];

  if (NEGATIVE_ADJUSTMENT_REASONS.includes(args.reason)) {
    return stockExit(tx, {
      productId: args.productId,
      locationId: args.locationId,
      quantity,
      reason: args.reason,
      description: args.description,
      userId: args.userId,
      enforceAvailability: true,
    });
  }

  const mov = await stockEntry(tx, {
    productId: args.productId,
    locationId: args.locationId,
    quantity,
    batch: args.batch,
    expiration: args.expiration,
    reason: args.reason,
    description: args.description,
    userId: args.userId,
  });
  return mov ? [mov] : [];
}

/**
 * Estorna uma ENTRADA anterior (ex.: anulação de compra). Remove a quantidade
 * do MESMO lote (não FEFO) e recusa se o lote — ou o saldo da localização — já
 * não têm a quantidade original, para nunca deixar stock negativo/fantasma.
 */
export async function stockReverseEntry(tx: Tx, args: StockReverseEntryArgs) {
  const { productId, locationId, quantity, batch, reason, description, userId } = args;
  requireQuantity(quantity);
  await lockProduct(tx, productId);

  const nameOf = async () =>
    (await tx.service.findUnique({ where: { id: productId }, select: { name: true } }))?.name ?? productId;

  if (batch) {
    const bp = await tx.batchProduct.findUnique({ where: { productId_batch_locationId: { productId, batch, locationId } } });
    if (!bp || bp.quantity < quantity) {
      throw new StockError(
        `Não é possível anular: o lote "${batch}" de "${await nameOf()}" já não tem a quantidade original (restam ${bp?.quantity ?? 0}, entrada ${quantity}). Parte já foi movimentada.`
      );
    }
    const changed = await tx.batchProduct.updateMany({ where: { id: bp.id, quantity: { gte: quantity } }, data: { quantity: { decrement: quantity } } });
    if (changed.count !== 1) throw new StockError("O stock foi alterado. Repita a operação.");
  }

  const available = await balanceAtLocation(tx, productId, locationId);
  if (available < quantity) {
    throw new StockError(
      `Não é possível anular: o saldo de "${await nameOf()}" na localização é ${available}, inferior à entrada de ${quantity}. Parte já foi movimentada.`
    );
  }

  return tx.movimentationStock.create({
    data: {
      productId,
      fromLocationId: locationId,
      quantity,
      type: "EXIT",
      reason: reason ?? STOCK_REASON.purchaseReversal,
      description,
      ...(userId ? { userId } : {}),
    },
  });
}

/**
 * Alerta de stock mínimo com deduplicação por transição.
 * Só notifica quando o saldo CRUZA o mínimo (estava acima, ficou abaixo/igual),
 * evitando o spam de uma notificação por cada movimento.
 */
export async function checkMinStockTransition(client: Tx | typeof prisma, productId: string, before: number) {
  const product = await client.service.findUnique({
    where: { id: productId },
    select: { name: true, minimumStock: true },
  });
  if (!product?.minimumStock) return;

  const after = await totalBalance(client, productId);
  const crossed = before > product.minimumStock && after <= product.minimumStock;
  if (!crossed) return;

  await client.notification.create({
    data: {
      title: "Stock mínimo atingido",
      message: `${product.name}: stock actual de ${after} está abaixo do mínimo de ${product.minimumStock}`,
      type: "stock_alert",
      room: "stock",
    },
  });
}
