<template>
  <span class="rr" :class="{ 'rr--todo': porDefinir }">
    <template v-if="porDefinir">Ref: por definir</template>
    <template v-else-if="!texto">—</template>
    <template v-else>
      <span class="rr-pre">Ref</span>
      <span class="rr-val">
        <template v-if="partes">
          <span :class="{ 'rr-lim--roto': limiteRoto === 'a' }">{{ partes.a }}</span>
          <span class="rr-sep">{{ partes.sep }}</span>
          <span :class="{ 'rr-lim--roto': limiteRoto === 'b' }">{{ partes.b }}</span>
        </template>
        <template v-else>{{ texto }}</template>
      </span>
    </template>
  </span>
</template>

<script setup>
/**
 * O intervalo de referência, sempre visível.
 *
 * O PRODUCT.md é explícito: nunca em tooltip. A razão não é de estilo — um
 * valor sem a sua referência ao lado obriga a memória ou a um segundo gesto,
 * e é precisamente no segundo gesto que se lê mal uma dose. Esconder a
 * referência atrás de um hover também a torna inalcançável por toque e por
 * teclado.
 *
 * Renderiza a referência canonicamente em vez de ecoar a string bruta: o
 * `parseReference` que já existe aceita "< 50", "≤ 50", "10 - 20", "10 – 20"
 * e "4.000 - 11.000", e sem normalização o painel mostraria as cinco formas
 * lado a lado.
 */
import { computed } from "vue";
import { parseReference } from "src/utils/examReference";

const props = defineProps({
  /** A referência tal como vem do exame. Vazia rende "—". */
  referencia: { type: String, default: "" },
  /** O valor, para marcar qual dos limites foi ultrapassado. Opcional. */
  valor: { type: [String, Number], default: null },
  /**
   * `porDefinir` distingue "este exame não tem referência" de "esta referência
   * ainda não foi preenchida". O segundo é uma lacuna de dados que alguém tem
   * de fechar, e desaparecer com ela num traço esconde trabalho por fazer.
   */
  porDefinir: { type: Boolean, default: false },
});

const texto = computed(() => String(props.referencia ?? "").trim());

const num = (v) => {
  const m = String(v ?? "").match(/-?\d[\d.,]*/);
  if (!m) return NaN;
  const s = m[0].replace(/\s/g, "");
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
    return parseFloat(s.replace(/\./g, "").replace(",", "."));
  }
  return parseFloat(s.replace(",", "."));
};

/**
 * Forma canónica: intervalo com travessão, limites com o sinal à frente.
 *
 * Normaliza o separador e o sinal, mas **não** reformata os números — usa os
 * dígitos tal como foram escritos. Reformatá-los numericamente destruía zeros
 * significativos: "1,005 – 1,030" saía como "1,005 – 1,03" e "5,0 – 8,0" como
 * "5 – 8". Numa densidade urinária ou num pH, o zero final é precisão
 * declarada pelo laboratório, não enfeite — e apagá-lo muda o que a
 * referência afirma.
 *
 * Só produz partes quando o `parseReference` também consegue interpretar a
 * referência, para que o que se mostra e o que se calcula nunca divirjam.
 */
const partes = computed(() => {
  const s = texto.value;
  if (!parseReference(s)) return null;
  let m;
  if ((m = s.match(/^[<≤]\s*(.+)$/))) return { a: "<", sep: " ", b: m[1].trim() };
  if ((m = s.match(/^[>≥]\s*(.+)$/))) return { a: ">", sep: " ", b: m[1].trim() };
  if ((m = s.match(/^(.+?)\s*[–\-a]\s*(.+)$/))) {
    return { a: m[1].trim(), sep: " – ", b: m[2].trim() };
  }
  return null;
});

/** Qual dos limites o valor ultrapassou — para o sublinhar em vez do outro. */
const limiteRoto = computed(() => {
  const r = parseReference(texto.value);
  const v = num(props.valor);
  if (!r || isNaN(v)) return null;
  if (r.type === "range") {
    if (v < r.a) return "a";
    if (v > r.b) return "b";
    return null;
  }
  if (r.type === "lt" || r.type === "max") return v >= r.a ? "b" : null;
  if (r.type === "gt") return v <= r.a ? "b" : null;
  return null;
});
</script>

<style scoped lang="scss">
.rr {
  display: inline-flex;
  align-items: baseline;
  gap: var(--sp-1);
  font-size: var(--fs-label);
  line-height: var(--lh-tight);
  color: var(--text-faint);
  white-space: nowrap;
  // Cifras tabulares também aqui: sem elas, "4.000 – 11.000" e "5,0 – 8,0"
  // desalinham entre linhas e a coluna deixa de se ler como coluna.
  font-variant-numeric: tabular-nums;
}

.rr-pre {
  font-weight: var(--fw-semi);
  opacity: 0.7;
}

.rr-sep {
  opacity: 0.6;
}

// O limite ultrapassado sublinha-se. Não muda de cor: a cor nesta linha já
// está a dizer o estado, e um segundo vermelho competiria com o valor.
.rr-lim--roto {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  font-weight: var(--fw-forte);
}

.rr--todo {
  color: var(--st-warn-text);
  font-style: italic;
}
</style>
