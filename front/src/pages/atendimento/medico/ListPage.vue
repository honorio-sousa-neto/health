<template>
  <ListaPagina
    titulo="Histórico de consultas"
    :contexto="contexto"
    apoio="Consultas com diagnóstico registado. A severidade é calculada a partir dos sinais vitais da triagem."
    :colunas="colunas"
    :linhas="linhas"
    :carregando="loading"
    :paginacao="paginacao"
    :filtrado="!!paginacao.search"
    texto-vazio="Ainda não há consultas concluídas."
    @recarregar="fetchAll"
  >
    <template #accoes>
      <q-btn
        flat no-caps
        icon="las la-arrow-left"
        label="Voltar aos atendimentos"
        class="btn-icone"
        :to="{ name: 'medico-lista-atendimento' }"
      />
    </template>

    <template #celula-customer="{ linha }">
      <span class="hl-doente">
        <span class="hl-avatar">{{ iniciais(linha.screening?.customer?.name) }}</span>
        <span>
          <span class="hl-nome">{{ linha.screening?.customer?.name ?? "\u2014" }}</span>
          <span v-if="linha.screening?.customer?.phone" class="hl-contacto">
            {{ linha.screening.customer.phone }}
          </span>
        </span>
      </span>
    </template>

    <template #linha-accoes="{ linha }">
      <q-item v-close-popup clickable @click="abrir(linha.id)">
        <q-item-section avatar><q-icon name="las la-eye" size="18px" /></q-item-section>
        <q-item-section>Ver consulta</q-item-section>
      </q-item>
    </template>
  </ListaPagina>
</template>

<script setup>
/**
 * O histórico de consultas do médico.
 *
 * O avatar do doente vinha tingido pela severidade — verde, laranja ou
 * vermelho — e a severidade aparecia outra vez ao lado, em cápsula. Era a
 * mesma informação duas vezes, uma delas num sítio que não é dela: o avatar
 * identifica quem é, não o estado em que está.
 *
 * A severidade fica, numa coluna só, com a cor clínica que lhe pertence —
 * é o cálculo dos sinais vitais da triagem e, aqui, o único valor clínico
 * da lista.
 */
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { useCommom } from "src/composables/commom";
import { usePaginacaoLocal } from "src/composables/paginacao-local";

const router = useRouter();
const { loading, data, fetchAll } = useCommom("consultations/logs/list");

// A lista vem inteira do servidor — a paginação e a pesquisa são locais.
const { paginacao, linhas } = usePaginacaoLocal(computed(() => data), [
  (l) => l.screening?.customer?.name,
  "diagnosis",
]);

const contexto = computed(() =>
  paginacao.search ? `a filtrar por \u201c${paginacao.search}\u201d` : "",
);

/* ── Severidade, a partir dos sinais vitais da triagem ── */
const grauCor = (v) => ({ GREEN: 1, ORANGE: 2, RED: 3 }[v] ?? 0);

const grauPulso = (v) => {
  const n = Number(v);
  if (!v || Number.isNaN(n)) return 0;
  if (n >= 60 && n <= 100) return 1;
  if (n >= 40 && n <= 120) return 2;
  return 3;
};

const grauTensao = (v) => {
  if (!v) return 0;
  const [sistolica, diastolica] = String(v).split("/").map(Number);
  if (Number.isNaN(sistolica)) return 0;
  if (sistolica < 120 && (!diastolica || diastolica < 80)) return 1;
  if (sistolica < 130) return 2;
  return 3;
};

const pontuacao = (t) =>
  !t
    ? 0
    : grauCor(t.oxygen) +
      grauCor(t.fever) +
      grauCor(t.breathingRate) +
      grauPulso(t.heartbeatRate) +
      grauTensao(t.bloodPressure);

const severidade = (t) => {
  const p = pontuacao(t);
  if (!p) return { rotulo: "\u2014", tom: "neutro" };
  if (p <= 5) return { rotulo: "Não urgente", tom: "ok" };
  if (p <= 10) return { rotulo: "Urgência", tom: "aviso" };
  return { rotulo: "Emergência", tom: "erro" };
};

const ESTADO = { pending: "Pendente", running: "Em curso", done: "Concluída" };
const TOM_ESTADO = { pending: "aviso", running: "info", done: "ok" };

const iniciais = (nome) =>
  nome?.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase() ?? "?";

const colunas = [
  {
    name: "customer", label: "Doente",
    field: (l) => l.screening?.customer?.name ?? null, align: "left", ordenavel: true,
  },
  {
    name: "severidade", label: "Severidade", field: (l) => l.screening ?? null,
    align: "left", estado: true,
    format: (v) => severidade(v).rotulo,
    tom: (v) => severidade(v).tom,
  },
  { name: "diagnosis", label: "Diagnóstico", field: "diagnosis", align: "left" },
  {
    name: "status", label: "Estado", field: "status", align: "left", estado: true,
    format: (v) => ESTADO[v] ?? v ?? "\u2014",
    tom: (v) => TOM_ESTADO[v] ?? "neutro",
  },
  {
    name: "createdAt", label: "Data", field: "createdAt", align: "left", ordenavel: true,
    format: (v) =>
      v
        ? new Intl.DateTimeFormat("pt-PT", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          }).format(new Date(v))
        : "\u2014",
  },
  { name: "actions", label: "Acções", align: "right" },
];

const abrir = (id) =>
  router.push({ name: "medico-atendimento", params: { consultationId: id } });
</script>

<style scoped lang="scss">
.hl-doente {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-3);
}

.hl-avatar {
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

.hl-nome { display: block; color: var(--text); }

.hl-contacto {
  display: block;
  margin-top: 1px;
  font-size: var(--fs-label);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
