<template>
  <!-- O normal não renderiza nada: a ausência de marca é o sinal. Marcar os
       26 valores normais de um painel de 30 destruiria o contraste que faz
       os 4 alterados saltar à vista. -->
  <span
    v-if="nivel !== NIVEL.NORMAL"
    class="ab"
    :class="`ab--${nivel}`"
    role="img"
    :aria-label="descricao"
  >
    <q-icon :name="icone" size="11px" />
    <span v-if="rotulo" class="ab-txt">{{ texto }}</span>
  </span>

  <!-- Com rótulo pedido, o normal diz-se por extenso em vez de desaparecer. -->
  <span v-else-if="rotulo" class="ab ab--normal" role="img" :aria-label="descricao">
    <span class="ab-txt">{{ texto }}</span>
  </span>
</template>

<script setup>
/**
 * A marca de anormalidade, em três níveis e de forma redundante.
 *
 * O PRODUCT.md exige que a distinção nunca assente só em cor, e a razão é
 * medível: no tema claro, a separação entre alterado e crítico cai para
 * ΔE2000 2,9 em deuteranopia — praticamente o limiar de detecção. Cerca de
 * 6% dos homens não distinguiriam os dois se a cor fosse o único canal.
 *
 * Daí os quatro canais: cor, peso, símbolo e texto acessível. Os três
 * primeiros são visuais; o quarto existe porque nenhum dos outros é audível.
 *
 * A seta persiste do alterado para o crítico — é o disco que escala. Trocá-la
 * por um ponto de exclamação no crítico perderia a direcção do desvio, que é
 * metade da informação clínica: saber que está crítico sem saber se é para
 * cima ou para baixo não orienta a acção.
 */
import { computed } from "vue";
import { NIVEL, DIRECCAO } from "src/utils/severidadeClinica";

const props = defineProps({
  nivel: {
    type: String,
    required: true,
    validator: (v) => Object.values(NIVEL).includes(v),
  },
  /** "acima" | "abaixo" | null — nulo em valores qualitativos, que não têm magnitude. */
  direccao: { type: String, default: null },
  /** Acrescenta o nome do nível por extenso, para legendas e demonstrações. */
  rotulo: { type: Boolean, default: false },
});

const icone = computed(() => {
  if (props.direccao === DIRECCAO.ACIMA) return "las la-arrow-up";
  if (props.direccao === DIRECCAO.ABAIXO) return "las la-arrow-down";
  // Sem direcção (positivo, turvo, reagente): o asterisco é a convenção de
  // "alterado" nos boletins laboratoriais em papel.
  return "las la-asterisk";
});

const texto = computed(() => {
  if (props.nivel === NIVEL.NORMAL) return "Normal";
  return props.nivel === NIVEL.CRITICO ? "Crítico" : "Alterado";
});

const descricao = computed(() => {
  if (props.nivel === NIVEL.NORMAL) return "Dentro do intervalo de referência";
  const grau = props.nivel === NIVEL.CRITICO ? "Criticamente" : "";
  if (props.direccao === DIRECCAO.ACIMA) return `${grau} acima do intervalo de referência`.trim();
  if (props.direccao === DIRECCAO.ABAIXO) return `${grau} abaixo do intervalo de referência`.trim();
  return props.nivel === NIVEL.CRITICO
    ? "Resultado criticamente alterado"
    : "Resultado alterado";
});
</script>

<style scoped lang="scss">
.ab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-1);
  flex-shrink: 0;
  line-height: 1;
  // 16px cabe dentro da linha de 20,8px do valor sem a empurrar.
  min-width: 16px;
  height: 16px;
  border-radius: var(--r-pill);
}

// Alterado: contorno. O ícone leva o degrau gráfico da escala de estado
// (mín. 3:1), nunca o degrau de texto.
.ab--alterado {
  color: var(--clin-marca-alterado);
  border: 1px solid currentColor;
  padding: 0 3px;
}

// Crítico: disco cheio. O salto de contorno para preenchido é o segundo
// canal — funciona mesmo quando as duas cores se confundem.
.ab--critico {
  color: var(--surface);
  background: var(--clin-marca-critico);
  padding: 0 3px;
}

.ab--normal {
  color: var(--clin-texto-normal);
  height: auto;
}

.ab-txt {
  font-size: var(--fs-label);
  font-weight: var(--fw-forte);
  line-height: var(--lh-tight);
  padding-right: 2px;
}
</style>
