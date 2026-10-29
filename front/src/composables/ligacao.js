import { ref, readonly, computed } from "vue";

/**
 * Estado da ligação ao servidor.
 *
 * O PRODUCT.md dá a rede instável como condição real do turno, não como
 * hipótese: quedas e lentidão acontecem. Este estado existe para que a
 * interface o possa dizer em vez de ficar calada — um pedido que falha por
 * falta de rede deixava a página com aspecto de vazia.
 *
 * Vive fora da função, como em `sidebar.js`, para ser partilhado por todos
 * os componentes que o importem em vez de se criar uma cópia por cada uso.
 */

// Três estados possíveis, e não um booleano: "a reconectar" é visualmente
// diferente de "sem ligação" — um pede paciência, o outro pede acção.
const ESTADO = { LIGADO: "ligado", RECONECTAR: "a-reconectar", CAIDO: "caido" };

const estado = ref(ESTADO.LIGADO);
const desdeQuando = ref(null);

/** Falhas consecutivas: uma falha isolada não vale um aviso ao ecrã todo. */
let falhasSeguidas = 0;
const LIMIAR_QUEDA = 2;

const marcarSucesso = () => {
  falhasSeguidas = 0;
  if (estado.value !== ESTADO.LIGADO) {
    estado.value = ESTADO.LIGADO;
    desdeQuando.value = null;
  }
};

const marcarFalha = () => {
  falhasSeguidas += 1;
  if (desdeQuando.value === null) desdeQuando.value = Date.now();
  estado.value = falhasSeguidas >= LIMIAR_QUEDA ? ESTADO.CAIDO : ESTADO.RECONECTAR;
};

// O browser sabe antes de nós que o cabo caiu; quando sabe, não esperamos
// pelo limiar de falhas.
if (typeof window !== "undefined") {
  window.addEventListener("offline", () => {
    falhasSeguidas = LIMIAR_QUEDA;
    if (desdeQuando.value === null) desdeQuando.value = Date.now();
    estado.value = ESTADO.CAIDO;
  });
  window.addEventListener("online", () => {
    // Voltar a ter rede não é o mesmo que o servidor responder: fica em
    // reconexão até um pedido passar de facto.
    estado.value = ESTADO.RECONECTAR;
  });
}

export function useLigacao() {
  return {
    estado: readonly(estado),
    desdeQuando: readonly(desdeQuando),
    ligado: computed(() => estado.value === ESTADO.LIGADO),
    aReconectar: computed(() => estado.value === ESTADO.RECONECTAR),
    caido: computed(() => estado.value === ESTADO.CAIDO),
    marcarSucesso,
    marcarFalha,
  };
}

export { ESTADO };
