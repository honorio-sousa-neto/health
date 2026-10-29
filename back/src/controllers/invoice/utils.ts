import { Prisma } from "@prisma/client";
import { randomInt } from "crypto";
import { InvoiceItem, InvoiceStatus, InvoiceType } from "@prisma/client";
import { InvoiceRepository } from "../../repositories/invoice/invoice";
export const calculateAmountItems = (items: InvoiceItem[]): number => {
  return items.reduce((total, item) => {
    if (![item.price, item.discount, item.quantity].every(Number.isFinite) || item.quantity <= 0 || !Number.isInteger(item.quantity) || item.price < 0 || item.discount < 0 || item.discount > item.price) throw new Error("Item de facturação inválido");
    return total.plus(new Prisma.Decimal(item.price).minus(item.discount).mul(item.quantity));
  }, new Prisma.Decimal(0)).toDecimalPlaces(2).toNumber();
};

export const generateHashes = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_+[]{}|<>?";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(randomInt(charactersLength));
  }
  return result;
};

export async function generateReference(document: string): Promise<string> {
  const repository = new InvoiceRepository();
  const [dia, mes, ano] = new Date().toLocaleDateString("pt-BR").split("/");
  const count = await repository.count({ type: document as InvoiceType });
  return `${document} ${dia}${mes}${ano}/${count + 1}`;
}

export const generateSerie = () => String(new Date().getFullYear());

export const findInvoiceFromReference = async (id: string) => {
  const repository = new InvoiceRepository();
  return repository.show({ invoiceWhereUniqueInput: { id } });
};

export const setStatus = (type: string): InvoiceStatus => {
  const status: { [key: string]: InvoiceStatus } = {
    RC: "PAGO",
    FR: "PAGO",
    FT: "POR_PAGAR",
    PP: "FINAL",
    NC: "FINAL",
    ND: "FINAL",
  };
  return status[type];
};

export const getDayRange = (
  year: number,
  month: number,
  day: number
): { start: Date; end: Date } => {
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);
  return { start, end };
};

export const getMonthRange = (
  year: number,
  month: number
): { start: Date; end: Date } => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};
