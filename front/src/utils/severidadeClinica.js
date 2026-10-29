/**
 * Severidade clínica — três níveis a partir de dois.
 *
 * `examReference.js` responde a uma pergunta binária: o valor está fora do
 * intervalo? A direcção fixada no PRODUCT.md precisa de três níveis, porque
 * "alterado" e "crítico" pedem acções diferentes ao clínico.
 *
 * Este módulo NÃO substitui `fieldIsAbnormal` — assenta sobre ele e sobre o
 * `parseReference` que já existe. Os dois ficheiros que hoje usam o módulo
 * antigo continuam a funcionar sem alteração.
 *
 * ── De onde vêm os limiares ──────────────────────────────────────────────
 *
 * Valores de pânico são factos médicos, não escolhas de desenho. Que o
 * potássio acima de 6,5 mmol/L é crítico não se deduz de um intervalo de
 * referência — sabe-se, ou não se sabe. O PRODUCT.md proíbe fabricar o que
 * não está estabelecido, e um limiar crítico inventado num sistema clínico é
 * um defeito de segurança.
 *
 * Por isso a ordem é: primeiro a tabela declarada pela clínica; só depois um
 * cálculo de recurso, deliberadamente conservador.
 */

import { parseReference, fieldIsAbnormal, isNumericValue } from "./examReference";

export const NIVEL = {
  NORMAL: "normal",
  ALTERADO: "alterado",
  CRITICO: "critico",
};

export const DIRECCAO = {
  ACIMA: "acima",
  ABAIXO: "abaixo",
};

/**
 * Limiares de pânico declarados, por exame → campo.
 * Espelha a forma do REFERENCE_OVERRIDES que já existe.
 *
 *   "Urina II": { "Leucócitos": { acima: 50 } },
 *   "Bioquímica": { "Potássio": { acima: 6.5, abaixo: 2.5 } },
 *   "Urina II": { "Nitritos": { qualitativoCritico: ["positivo"] } },
 *
 * Vazia por omissão, e isso é estado legítimo — não um esquecimento. Enquanto
 * estiver vazia, só o cálculo de recurso produz críticos, e `haLimiaresDeclarados()`
 * permite à interface dizê-lo em vez de o terceiro nível nunca disparar em
 * silêncio. Um nível que não dispara é código morto com aspecto de funcionalidade.
 */
export const LIMIARES_CRITICOS = {};

/**
 * Cálculo de recurso, quando nada está declarado.
 *
 * Intervalo fechado [a, b]: crítico quando o valor está uma largura inteira do
 * intervalo fora dele. Num intervalo 4,0–11,0 (largura 7,0), crítico acima de
 * 18,0.
 *
 * Referência aberta (`< a`, `> a`): não há largura de onde tirar escala, por
 * isso usa-se um múltiplo do limite. Cinco vezes, e não "50% além" — essa era
 * a primeira versão desta regra e produzia falsos críticos sempre que o limite
 * é um número pequeno. Com `< 5`, um valor de 15 (hematúria microscópica
 * ligeira) passava a crítico a +50%; a 5× fica alterado, que é o correcto.
 *
 * Em ambos os casos o objectivo é o mesmo: o crítico tem de ser raro para ser
 * lido como crítico. Se cada valor ligeiramente fora ficasse vermelho, um
 * painel com 4 alterados passaria a 4 vermelhos e a distinção de dois níveis
 * morria — que é exactamente o modo de falha desta direcção.
 */
const DESVIO_CRITICO_INTERVALO = 1.0;
const MULTIPLO_CRITICO_ABERTO = 5;

const toNumber = (str) => {
  const s = String(str ?? "").trim().replace(/\s/g, "");
  if (!s) return NaN;
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
    return parseFloat(s.replace(/\./g, "").replace(",", "."));
  }
  return parseFloat(s.replace(",", "."));
};

const firstNumber = (str) => {
  const m = String(str ?? "").match(/-?\d[\d.,]*/);
  return m ? toNumber(m[0]) : NaN;
};

/** Há limiares de pânico declarados para este exame (ou para algum)? */
export const haLimiaresDeclarados = (nomeExame = null) =>
  nomeExame
    ? Object.keys(LIMIARES_CRITICOS?.[nomeExame] ?? {}).length > 0
    : Object.keys(LIMIARES_CRITICOS).length > 0;

/** Em que sentido o valor saiu do intervalo? */
const direccaoDoDesvio = (v, ref) => {
  const r = parseReference(ref);
  if (!r || isNaN(v)) return null;
  if (r.type === "range") {
    if (v > r.b) return DIRECCAO.ACIMA;
    if (v < r.a) return DIRECCAO.ABAIXO;
    return null;
  }
  if (r.type === "lt" || r.type === "max") return v >= r.a ? DIRECCAO.ACIMA : null;
  if (r.type === "gt") return v <= r.a ? DIRECCAO.ABAIXO : null;
  return null;
};

/** Limiar declarado ultrapassado? Ganha sempre ao cálculo. */
const criticoPorTabela = (nomeExame, rotulo, valor) => {
  const decl = LIMIARES_CRITICOS?.[nomeExame]?.[rotulo];
  if (!decl) return false;

  const texto = String(valor ?? "").trim().toLowerCase();
  if (Array.isArray(decl.qualitativoCritico)) {
    if (decl.qualitativoCritico.some((t) => texto.includes(String(t).toLowerCase()))) return true;
  }

  const v = firstNumber(valor);
  if (isNaN(v)) return false;
  if (typeof decl.acima === "number" && v >= decl.acima) return true;
  if (typeof decl.abaixo === "number" && v <= decl.abaixo) return true;
  return false;
};

/** Crítico pelo cálculo de recurso. Só corre se a tabela não decidir. */
const criticoPorCalculo = (valor, ref) => {
  const r = parseReference(ref);
  if (!r) return false;
  const v = firstNumber(valor);
  if (isNaN(v)) return false;

  if (r.type === "range") {
    const largura = r.b - r.a;
    if (!(largura > 0)) return false;
    const desvio = v > r.b ? (v - r.b) / largura : v < r.a ? (r.a - v) / largura : 0;
    return desvio >= DESVIO_CRITICO_INTERVALO;
  }

  // Referência aberta: múltiplo do limite. Um limite em zero não dá escala.
  if (r.type === "lt" || r.type === "max") {
    return r.a > 0 && v >= r.a * MULTIPLO_CRITICO_ABERTO;
  }
  if (r.type === "gt") {
    return r.a > 0 && v <= r.a / MULTIPLO_CRITICO_ABERTO;
  }
  return false;
};

/**
 * O nível de um parâmetro.
 *
 * @param {object}  p
 * @param {*}       p.valor       valor tal como veio do resultado
 * @param {string}  p.referencia  intervalo de referência, em texto
 * @param {string} [p.exame]      nome do exame, para consultar a tabela
 * @param {string} [p.rotulo]     nome do campo, idem
 * @returns {{ nivel: string, direccao: string|null, numerico: boolean }}
 *
 * Falha sempre para ALTERADO, nunca para NORMAL em silêncio e nunca para
 * CRITICO sem base: uma referência ilegível não é prova de que está tudo bem.
 */
export const severidadeDe = ({ valor, referencia, exame = null, rotulo = null }) => {
  const numerico = isNumericValue(valor);
  const temValor = String(valor ?? "").trim() !== "";

  if (!temValor) {
    return { nivel: NIVEL.NORMAL, direccao: null, numerico };
  }

  const alterado = fieldIsAbnormal(valor, referencia);
  if (!alterado) {
    return { nivel: NIVEL.NORMAL, direccao: null, numerico };
  }

  const direccao = direccaoDoDesvio(firstNumber(valor), referencia);

  // A tabela primeiro. Valores qualitativos só chegam a crítico por aqui —
  // "positivo" não tem magnitude de onde tirar severidade.
  if (exame && rotulo && criticoPorTabela(exame, rotulo, valor)) {
    return { nivel: NIVEL.CRITICO, direccao, numerico };
  }

  if (numerico && criticoPorCalculo(valor, referencia)) {
    return { nivel: NIVEL.CRITICO, direccao, numerico };
  }

  return { nivel: NIVEL.ALTERADO, direccao, numerico };
};

/** Contagem por nível, para o resumo de um cartão fechado. */
export const resumirNiveis = (parametros = []) =>
  parametros.reduce(
    (acc, p) => {
      const { nivel } = p.nivel ? { nivel: p.nivel } : severidadeDe(p);
      if (nivel === NIVEL.CRITICO) acc.criticos += 1;
      else if (nivel === NIVEL.ALTERADO) acc.alterados += 1;
      else acc.normais += 1;
      return acc;
    },
    { normais: 0, alterados: 0, criticos: 0 },
  );
