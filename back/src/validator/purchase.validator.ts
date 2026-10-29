import { z } from "zod";

/**
 * Compras.
 *
 * ── A unidade de uma linha ───────────────────────────────────────────────
 *
 * Uma linha de factura tem duas unidades e elas não são a mesma:
 *
 *   `unitId`            o que o fornecedor vendeu — caixa, frasco, par, un.
 *                       É o que está no papel e é por aí que se confere.
 *   `conversionFactor`  quanto da unidade de stock do artigo vem dentro de
 *                       cada uma dessas. Uma caixa de 12 garrafas de 500 ml,
 *                       de um artigo contado em ml, são 6000.
 *
 * O que entra em stock é `quantity * conversionFactor`, sempre na unidade do
 * artigo. Por isso o conteúdo não pode vir da tabela de unidades: "caixa" lá
 * vale 1, porque uma caixa em geral não tem tamanho — só a caixa *daquele*
 * artigo tem. É por linha que se declara, e é por linha que fica registado.
 */

/** Data em ISO, Date ou timestamp — vem do `type="date"` do formulário. */
const paraData = (arg: unknown) => {
  if (!arg) return undefined;
  if (arg instanceof Date) return arg;
  if (typeof arg === "string" || typeof arg === "number") {
    const d = new Date(arg);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
};

const purchaseItem = z.object({
  productId: z
    .string({ required_error: "Há uma linha sem artigo escolhido" })
    .uuid("Há uma linha sem artigo escolhido"),
  quantity: z
    .number({ required_error: "Há uma linha sem quantidade" })
    .positive("A quantidade de cada linha tem de ser maior que zero"),
  price: z
    .number({ required_error: "Há uma linha sem custo" })
    .min(0, "O custo de uma linha não pode ser negativo"),
  unitId: z.string().uuid().optional().nullable(),
  conversionFactor: z
    .number()
    .positive("O conteúdo por embalagem tem de ser maior que zero")
    .default(1),
  batch: z.string().optional().nullable(),
  expiration: z.preprocess(paraData, z.date().optional()),
});

export const createPurchase = z.object({
  // Obrigatórios: sem eles a compra não é imputável a ninguém nem a nenhum
  // documento, e a entrada de stock fica sem origem.
  supplierId: z
    .string({ required_error: "Indique o fornecedor" })
    .uuid("Indique o fornecedor"),
  code: z
    .string({ required_error: "Indique o número da factura" })
    .trim()
    .min(1, "Indique o número da factura"),
  date: z.preprocess(paraData, z.date({ required_error: "Indique a data da factura" })),

  items: z
    .array(purchaseItem, { required_error: "A compra tem de ter pelo menos um item" })
    .min(1, "A compra tem de ter pelo menos um item"),

  bankAccountId: z.string().uuid().optional().nullable(),
  bank: z.string().nullable().optional(),
  other: z.string().nullable().optional(),
  // `amount` não é aceite: o total é somado no servidor a partir das linhas.
});

export type TCreatePurchase = z.input<typeof createPurchase>;

export const updatePurchase = createPurchase.partial();

export type TUpdatePurchase = z.input<typeof updatePurchase>;

/** A primeira mensagem de um ZodError, em português e sem JSON. */
export const primeiraMensagem = (erro: unknown): string | null => {
  if (erro instanceof z.ZodError) {
    return erro.issues[0]?.message ?? "Dados inválidos";
  }
  return null;
};
