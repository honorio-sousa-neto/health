<template>
  <div class="vc" :class="`vc--${estado.nivel}`">
    <q-icon v-if="icone" :name="icone" size="17px" class="vc-ico" />

    <div class="vc-corpo">
      <span class="vc-rotulo">{{ rotulo }}</span>

      <span class="vc-linha">
        <span class="vc-valor" :class="{ 'vc-valor--texto': !estado.numerico }">{{ mostrado }}</span>
        <span v-if="unidade" class="vc-unidade">{{ unidade }}</span>
        <AbnormalBadge :nivel="estado.nivel" :direccao="estado.direccao" />
      </span>

      <ReferenceRange v-if="referencia" :referencia="referencia" :valor="valor" class="vc-ref" />
    </div>
  </div>
</template>

<script setup>
/**
 * Um sinal vital.
 *
 * Substitui o `.cs-item` de hoje, que codifica os seus quatro estados
 * **apenas por cor** — muda a cor do ícone, do valor e do contorno, e mais
 * nada. É uma violação directa da primeira restrição clínica do PRODUCT.md, e
 * no ecrã onde se lê uma tensão arterial. Aqui o estado leva os três canais:
 * cor, peso e símbolo.
 *
 * O `.cs-item` também escreve oito literais de cor em rgba. Nenhum aparece
 * aqui: tudo vem da escala de estado, pelo degrau certo — texto para texto,
 * gráfico para ícones e contornos, tinta para fundos.
 *
 * A referência fica visível dentro do chip, como nas linhas de parâmetro.
 * Um sinal vital sem o seu intervalo obriga a memória, e é aí que se erra.
 */
import { computed } from "vue";
import AbnormalBadge from "./AbnormalBadge.vue";
import ReferenceRange from "./ReferenceRange.vue";
import { severidadeDe } from "src/utils/severidadeClinica";

const props = defineProps({
  rotulo: { type: String, required: true },
  valor: { type: [String, Number], default: null },
  unidade: { type: String, default: "" },
  referencia: { type: String, default: "" },
  /** Ícone Line Awesome, o conjunto que a aplicação já carrega. */
  icone: { type: String, default: "" },
  exame: { type: String, default: null },
  nivel: { type: String, default: null },
  direccao: { type: String, default: null },
});

const estado = computed(() => {
  if (props.nivel) {
    return {
      nivel: props.nivel,
      direccao: props.direccao,
      numerico: /\d/.test(String(props.valor ?? "")),
    };
  }
  return severidadeDe({
    valor: props.valor,
    referencia: props.referencia,
    exame: props.exame,
    rotulo: props.rotulo,
  });
});

const mostrado = computed(() => {
  const v = String(props.valor ?? "").trim();
  return v === "" ? "—" : v;
});
</script>

<style scoped lang="scss">
.vc {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-2);
  min-width: 0;
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--r-sm);
  background: var(--surface);
  border: 1px solid var(--border);
}

.vc-ico {
  color: var(--text-faint);
  flex-shrink: 0;
  margin-top: 1px;
}

.vc-corpo {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.vc-rotulo {
  font-size: var(--fs-label);
  line-height: var(--lh-tight);
  font-weight: var(--fw-semi);
  color: var(--text-muted);
  white-space: nowrap;
}

.vc-linha {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
}

.vc-valor {
  font-size: var(--fs-title);
  line-height: var(--lh-tight);
  font-weight: var(--fw-semi);
  color: var(--text);
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
  white-space: nowrap;
}

.vc-valor--texto {
  font-size: var(--fs-body);
  font-weight: var(--fw-medio);
  font-variant-numeric: normal;
}

.vc-unidade {
  font-size: var(--fs-label);
  line-height: var(--lh-tight);
  color: var(--text-faint);
  white-space: nowrap;
}

.vc-ref {
  margin-top: 1px;
}

// ── Estados ──────────────────────────────────────────────────────────────
// Cor, peso e símbolo. O símbolo vem do AbnormalBadge; o peso e a cor estão
// aqui. O contorno acompanha, mas nunca sozinho.
.vc--alterado {
  background: var(--clin-banda-alterado);
  border-color: var(--clin-marca-alterado);
}

.vc--alterado .vc-valor {
  color: var(--clin-texto-alterado);
  font-weight: var(--fw-forte);
}

.vc--alterado .vc-ico,
.vc--alterado .vc-rotulo,
.vc--alterado .vc-unidade {
  color: var(--clin-rotulo-banda);
}

.vc--critico {
  background: var(--clin-banda-critico);
  border-color: var(--clin-contorno-critico);
}

.vc--critico .vc-valor {
  color: var(--clin-texto-critico);
  font-weight: var(--fw-maximo);
}

.vc--critico .vc-ico,
.vc--critico .vc-rotulo,
.vc--critico .vc-unidade {
  color: var(--clin-rotulo-banda);
}
</style>
