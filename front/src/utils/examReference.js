/**
 * Referências de exames — parsing e deteção de valores alterados (APRESENTAÇÃO).
 *
 * As referências vêm da definição do exame (subItens[].reference). Onde faltarem,
 * podem ser preenchidas aqui em REFERENCE_OVERRIDES, por nome de exame → rótulo do
 * campo. Isto NÃO altera dados nem API — é só um mapa de apresentação.
 *
 * Formatos aceites numa referência:
 *   "< 50"   "≤ 50"   "> 10"   "≥ 10"   "10 - 20"   "10 – 20"   "4.000 - 11.000"
 * Um valor único (ex.: "30") é tratado como máximo (alterado se >= 30).
 */

// TODO (PREENCHER): intervalos de referência em falta, por exame → campo.
// Exemplo do pedido (confirmar o valor clínico antes de descomentar):
//   "Gota Espessa": { "Resultado": "< 50" },
//   "Urina": { "Cilindros": "0 - 5", "Eritrócitos": "0 - 5" },
export const REFERENCE_OVERRIDES = {};

// "4.000" (PT, milhares) → 4000 ; "0,8" → 0.8 ; "0.8" → 0.8
const toNumber = (str) => {
  const s = String(str ?? "").trim().replace(/\s/g, "");
  if (!s) return NaN;
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) return parseFloat(s.replace(/\./g, "").replace(",", "."));
  return parseFloat(s.replace(",", "."));
};

// Primeiro número dentro de um texto (ex.: "89 P/mm³" → 89)
const firstNumber = (str) => {
  const m = String(str ?? "").match(/-?\d[\d.,]*/);
  return m ? toNumber(m[0]) : NaN;
};

/** Interpreta a referência; devolve { type, a, b? } ou null se não parseável. */
export const parseReference = (ref) => {
  const s = String(ref ?? "").trim();
  if (!s) return null;
  let m;
  if ((m = s.match(/^[<≤]\s*(.+)$/))) { const a = toNumber(m[1]); return isNaN(a) ? null : { type: "lt", a }; }
  if ((m = s.match(/^[>≥]\s*(.+)$/))) { const a = toNumber(m[1]); return isNaN(a) ? null : { type: "gt", a }; }
  if ((m = s.match(/^(.+?)\s*[–\-a]\s*(.+)$/))) {
    const a = toNumber(m[1]); const b = toNumber(m[2]);
    return isNaN(a) || isNaN(b) ? null : { type: "range", a, b };
  }
  const only = toNumber(s);
  return isNaN(only) ? null : { type: "max", a: only };
};

/** Referência efetiva: a do próprio campo, senão o override, senão "". */
export const referenceFor = (examName, label, dataRef) => {
  if (dataRef && String(dataRef).trim()) return String(dataRef).trim();
  const o = REFERENCE_OVERRIDES?.[examName]?.[label];
  return o ? String(o) : "";
};

/** Valor fora do intervalo? true / false, ou null se indeterminado. */
export const isValueAbnormal = (value, ref) => {
  const r = parseReference(ref);
  if (!r) return null;
  const v = firstNumber(value);
  if (isNaN(v)) return null;
  if (r.type === "lt" || r.type === "max") return v >= r.a;
  if (r.type === "gt") return v <= r.a;
  if (r.type === "range") return v < r.a || v > r.b;
  return null;
};

/** É um valor numérico (que ganharia com uma referência de contexto)? */
export const isNumericValue = (value) => {
  const s = String(value ?? "").trim();
  if (!s || /\+|positiv|negativ|presente|ausente|reag|react/i.test(s)) return false;
  return /\d/.test(s);
};

const QUAL_RX = /\+|positiv|presente|reagente|reactiv|anormal|turv/i;

/** Alterado? Primeiro pela referência; senão heurística qualitativa. */
export const fieldIsAbnormal = (value, ref) => {
  const byRef = isValueAbnormal(value, ref);
  if (byRef !== null) return byRef;
  return QUAL_RX.test(String(value ?? ""));
};
