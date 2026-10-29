import { LocalStorage, Dark } from "quasar";
import { computed } from "vue";

const CHAVE = "alfavida_tema";

/**
 * A preferência traduzida para `color-scheme`.
 *
 * "auto" dá `light dark`: diz ao browser que a página serve os dois e deixa-o
 * escolher pelo sistema operativo — que é exactamente o que o `Dark.set("auto")`
 * faz do lado do Quasar. Os dois seguem o mesmo sinal, por isso não divergem.
 */
const esquemaDe = (preferencia) =>
  preferencia === "claro" ? "light" : preferencia === "escuro" ? "dark" : "light dark";

/**
 * Escreve o esquema no elemento raiz.
 *
 * Tem de ser no `<html>` e não no `<body>`: o fundo do documento e as barras
 * de deslocamento lêem-no da raiz. A folha de estilos declara a base nos dois
 * temas; esta linha é a que sabe da preferência guardada e vence-a por ser
 * inline, como deve.
 */
const aplicarEsquema = (preferencia) => {
  document.documentElement.style.colorScheme = esquemaDe(preferencia);
};

/**
 * Tema claro/escuro.
 *
 * Três estados: "claro", "escuro" e "auto" (segue o sistema operativo).
 * A preferência fica em LocalStorage, por isso sobrevive ao logout — ao
 * contrário da sessão, que usa SessionStorage.
 */
export function useTheme() {
  const preferencia = computed(() => LocalStorage.getItem(CHAVE) ?? "auto");
  const escuro = computed(() => Dark.isActive);

  const aplicar = (valor) => {
    LocalStorage.set(CHAVE, valor);
    Dark.set(valor === "auto" ? "auto" : valor === "escuro");
    aplicarEsquema(valor);
  };

  /** Alterna claro <-> escuro a partir do estado efectivo. */
  const alternar = () => aplicar(Dark.isActive ? "claro" : "escuro");

  return { preferencia, escuro, aplicar, alternar };
}

/** Chamado no arranque, antes de a interface montar. */
export function iniciarTema() {
  const guardado = LocalStorage.getItem(CHAVE) ?? "auto";
  Dark.set(guardado === "auto" ? "auto" : guardado === "escuro");
  aplicarEsquema(guardado);
}
