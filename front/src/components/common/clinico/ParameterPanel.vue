<template>
  <div class="pp-wrap">
    <table class="pp">
      <caption v-if="legenda" class="pp-cap">{{ legenda }}</caption>

      <thead v-if="cabecalho">
        <tr>
          <th class="pp-h pp-h--nome" scope="col">Parâmetro</th>
          <th class="pp-h pp-h--valor" scope="col">Resultado</th>
          <th class="pp-h pp-h--unidade" scope="col">Unid.</th>
          <th class="pp-h pp-h--ref" scope="col">Referência</th>
        </tr>
      </thead>

      <tbody>
        <template v-for="(g, gi) in grupos" :key="gi">
          <tr v-if="g.titulo" class="pp-grupo">
            <th class="pp-grupo-c" colspan="4" scope="colgroup">{{ g.titulo }}</th>
          </tr>
          <ParameterRow
            v-for="(p, pi) in g.parametros"
            :key="`${gi}-${pi}`"
            v-bind="p"
            :exame="p.exame ?? exame"
          />
        </template>

        <!-- Linhas passadas à mão, para casos que a prop `grupos` não cobre. -->
        <slot />

        <tr v-if="vazio">
          <td class="pp-vazio" colspan="4">Sem parâmetros registados.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
/**
 * O painel de parâmetros: dono da grelha, dos grupos e do cabeçalho.
 *
 * Existe porque o `ParameterRow` sozinho não consegue alinhar colunas entre
 * linhas — cada linha dimensionaria as suas colunas ao próprio conteúdo, e
 * "unidade em coluna própria" deixaria de ser verdade. É a tabela que faz o
 * alinhamento, nativamente e sem subgrid, que o alvo de build não suporta.
 *
 * Também é aqui que vivem os separadores de grupo. Um sumário de urina lê-se
 * em três secções — físico, químico, sedimento — e sem elas seriam dezasseis
 * parâmetros seguidos sem estrutura.
 *
 * A densidade é deliberada: `border-spacing` de 2px entre linhas, e nada de
 * cartões por parâmetro. O PRODUCT.md é explícito em que a densidade é uma
 * virtude e em que listas de parâmetros não se separam em cartões espaçados.
 */
import { computed } from "vue";
import ParameterRow from "./ParameterRow.vue";

const props = defineProps({
  /**
   * [{ titulo?: string, parametros: [{ nome, valor, unidade, referencia, ... }] }]
   * O título é opcional: um painel de um só grupo não precisa de secção.
   */
  grupos: { type: Array, default: () => [] },
  /** Nome do exame, propagado às linhas para a consulta de limiares de pânico. */
  exame: { type: String, default: null },
  cabecalho: { type: Boolean, default: true },
  /** Descrição para leitores de ecrã; não é renderizada visualmente. */
  legenda: { type: String, default: "" },
});

const slots = defineSlots();

const vazio = computed(
  () => !slots.default && props.grupos.every((g) => !(g.parametros || []).length),
);
</script>

<style scoped lang="scss">
.pp-wrap {
  // Cada tabela larga trata do seu próprio scroll horizontal, em vez de
  // deixar a página inteira deslizar de lado.
  overflow-x: auto;
}

.pp {
  width: 100%;
  // `auto` é o que alinha as colunas ao conteúdo mais largo de toda a tabela,
  // que é precisamente o comportamento que faltava.
  table-layout: auto;
  border-collapse: separate;
  // O intervalo entre linhas. Denso por obrigação: com 30 parâmetros, cada
  // pixel entre linhas são 30 pixels de ecrã.
  border-spacing: 0 2px;
}

// Legenda para leitores de ecrã, fora do fluxo visual.
.pp-cap {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

// ── Cabeçalho de coluna ──────────────────────────────────────────────────
.pp-h {
  font-size: var(--fs-label);
  font-weight: var(--fw-forte);
  line-height: var(--lh-tight);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--text-3);
  background: var(--surface-2);
  padding: var(--sp-2) 10px;
  white-space: nowrap;
}

.pp-h--nome {
  text-align: left;
  border-top-left-radius: var(--r-sm);
  border-bottom-left-radius: var(--r-sm);
}

.pp-h--valor {
  text-align: right;
}

.pp-h--unidade {
  text-align: left;
}

.pp-h--ref {
  text-align: right;
  border-top-right-radius: var(--r-sm);
  border-bottom-right-radius: var(--r-sm);
}

// ── Separador de grupo ───────────────────────────────────────────────────
.pp-grupo-c {
  text-align: left;
  font-size: var(--fs-label);
  font-weight: var(--fw-maximo);
  line-height: var(--lh-tight);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--text-3);
  padding: var(--sp-3) 10px var(--sp-1);
  border-bottom: 1px solid var(--border);
}

// O primeiro grupo não precisa do respiro que separa os seguintes.
.pp-grupo:first-child .pp-grupo-c {
  padding-top: var(--sp-2);
}

.pp-vazio {
  padding: var(--sp-6) 10px;
  text-align: center;
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  color: var(--text-faint);
}

// Com a linha dobrada, os títulos de coluna deixam de descrever o que está
// por baixo deles — e ocupariam espaço a dizer algo falso.
@media (max-width: 599.98px) {
  .pp thead {
    display: none;
  }

  .pp-grupo-c {
    padding: var(--sp-3) var(--sp-2) var(--sp-1);
  }
}
</style>
