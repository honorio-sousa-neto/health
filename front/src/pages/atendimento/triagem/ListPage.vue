<template>
  <ListaPagina
    titulo="Histórico de triagens"
    :contexto="contexto"
    apoio="Triagens com mais de 24 horas. As do dia estão na lista de triagem."
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="!!pagination.search"
    texto-vazio="Ainda não há triagens no histórico."
    @recarregar="fetchAll"
  >
    <template #celula-customer="{ linha }">
      <span class="tr-doente">
        <span class="tr-avatar">{{ iniciais(linha.customer?.name) }}</span>
        <span>
          <span class="tr-nome">{{ linha.customer?.name ?? "\u2014" }}</span>
          <span v-if="medidas(linha)" class="tr-medidas">{{ medidas(linha) }}</span>
        </span>
      </span>
    </template>

    <!-- Os sinais vitais são o único sítio desta lista onde a cor diz alguma
         coisa: o grau de desvio de cada sinal. -->
    <template #celula-vitais="{ linha }">
      <span class="tr-vitais">
        <span
          v-for="sinal in vitais(linha)"
          :key="sinal.chave"
          class="tr-sinal"
          :class="`tr-sinal--${sinal.grau}`"
          :title="sinal.titulo"
        >
          <q-icon :name="sinal.icone" size="13px" />
        </span>
        <span v-if="linha.bloodPressure" class="tr-tensao num">{{ linha.bloodPressure }}</span>
        <span v-if="!vitais(linha).length && !linha.bloodPressure" class="tr-sem">Sem registo</span>
      </span>
    </template>

    <template #linha-accoes="{ linha }">
      <q-item v-close-popup clickable @click="$router.push({ name: 'editar-triagem', params: { consultationId: linha.id } })">
        <q-item-section avatar><q-icon name="las la-eye" size="18px" /></q-item-section>
        <q-item-section>Ver triagem</q-item-section>
      </q-item>
    </template>
  </ListaPagina>
</template>

<script setup>
/**
 * O histórico de triagens.
 *
 * O avatar era um gradiente por inicial — seis pares de cores atribuídos pelo
 * código do primeiro caractere do nome. Gradientes estão fora, e a cor de um
 * avatar não dizia nada sobre o doente.
 *
 * A barra de estatísticas saiu. Contava com `data.value` num array reactivo
 * que não é um `ref`, por isso mostrava sempre zero — e, mesmo corrigida,
 * contaria só a página visível, o que num histórico paginado é uma contagem
 * que engana.
 *
 * A cor fica nos sinais vitais, que é onde transporta estado clínico.
 */
import { computed } from "vue";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { useCommom } from "src/composables/commom";

const { loading, data, pagination, fetchAll } = useCommom("screenings/logs/list");

const contexto = computed(() =>
  pagination.search ? `a filtrar por \u201c${pagination.search}\u201d` : "",
);

const ESTADO = {
  PENDING: "Pendente",
  RUNNING: "Em curso",
  FINISHED: "Concluída",
  CANCELED: "Cancelada",
};

const TOM = {
  PENDING: "aviso",
  RUNNING: "info",
  FINISHED: "ok",
  CANCELED: "neutro",
};

const iniciais = (nome) =>
  nome?.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase() ?? "?";

const medidas = (linha) =>
  [linha.weight ? `${linha.weight} kg` : null, linha.height ? `${linha.height} cm` : null]
    .filter(Boolean)
    .join(" \u00b7 ");

const SINAIS = [
  { chave: "fever", icone: "las la-thermometer-half", titulo: "Temperatura" },
  { chave: "oxygen", icone: "las la-lungs", titulo: "Saturação de oxigénio" },
  { chave: "breathingRate", icone: "las la-wind", titulo: "Frequência respiratória" },
];

const vitais = (linha) =>
  SINAIS.filter((s) => linha[s.chave]).map((s) => ({
    ...s,
    grau: String(linha[s.chave]).toLowerCase(),
  }));

const colunas = [
  { name: "customer", label: "Doente", field: (l) => l.customer?.name ?? null, align: "left" },
  { name: "nurse", label: "Enfermeiro", field: (l) => l.nurse?.name ?? null, align: "left" },
  {
    name: "status", label: "Estado", field: "status", align: "left", estado: true,
    format: (v) => ESTADO[v] ?? v ?? "\u2014",
    tom: (v) => TOM[v] ?? "neutro",
  },
  { name: "vitais", label: "Sinais vitais", field: () => null, align: "left" },
  {
    name: "createdAt", label: "Data", field: "createdAt", align: "left",
    format: (v) =>
      v
        ? new Date(v).toLocaleString("pt-PT", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })
        : "\u2014",
  },
  { name: "actions", label: "Acções", align: "right" },
];
</script>

<style scoped lang="scss">
.tr-doente {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-3);
}

/* Era um gradiente por inicial. Superfície elevada com as iniciais, como na
   barra lateral — distingue sem colorir. */
.tr-avatar {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: var(--r-sm);
  background: var(--surface-3);
  color: var(--text-2);
  font-size: var(--fs-label);
  font-weight: var(--fw-semi);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tr-nome { display: block; color: var(--text); }

.tr-medidas {
  display: block;
  margin-top: 1px;
  font-size: var(--fs-label);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.tr-vitais {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
}

.tr-sinal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--r-sm);
}

/* O grau de desvio de cada sinal — o único sítio desta lista em que a cor
   transporta estado clínico. */
.tr-sinal--normal   { color: var(--clin-texto-normal, var(--text-2)); background: var(--surface-3); }
.tr-sinal--alterado { color: var(--clin-texto-alterado); background: var(--st-warn-tint); }
.tr-sinal--critico  { color: var(--clin-texto-critico); background: var(--st-danger-tint); }

.tr-tensao {
  font-size: var(--fs-label);
  color: var(--text-2);
  white-space: nowrap;
}

.tr-sem { font-size: var(--fs-label); color: var(--text-faint); }
</style>
