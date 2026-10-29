export const currencyFormat = (amount) =>
  new Intl.NumberFormat("de-DE", { currency: "AOA", style: "currency" }).format(
    amount
  );

export const DateFormat = ({ day, month, year, hour, minute }, date) =>
  new Intl.DateTimeFormat("en-GB", {
    day,
    month,
    year,
    hour,
    minute,
  }).format(new Date(date));

export const required = (val) => !!val || "Campo obrigatório";

/**
 * Kwanzas, em português europeu.
 *
 * `useGrouping: true` não é redundante: por omissão o agrupamento só começa
 * aos cinco dígitos, e numa coluna de valores "5000,00" ao lado de
 * "61 000,00" lê-se como duas escalas diferentes.
 */
export const kwanza = (valor) =>
  new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "AOA",
    useGrouping: true,
  }).format(Number(valor ?? 0));

/** Quantidades: até três casas decimais, agrupadas pela mesma razão. */
export const quantidade = (valor) =>
  new Intl.NumberFormat("pt-PT", {
    maximumFractionDigits: 3,
    useGrouping: true,
  }).format(Number(valor ?? 0));
