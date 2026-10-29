<template>
  <ListaPagina
    titulo="Consultas a decorrer"
    :contexto="contexto"
    :apoio="apoio"
    :colunas="colunas"
    :linhas="linhas"
    :carregando="loading"
    :paginacao="paginacao"
    :filtrado="!!paginacao.search"
    texto-vazio="Nenhuma consulta a decorrer."
    @recarregar="fetchAll"
  >
    <template #accoes>
      <q-btn
        flat no-caps
        icon="las la-user-clock"
        label="Em espera"
        class="btn-icone"
        :to="{ name: 'medico-lista-atendimento' }"
      />
      <q-btn
        flat no-caps
        icon="las la-history"
        label="Histórico"
        class="btn-icone"
        :to="{ name: 'medico-historico' }"
      />
    </template>

    <template #celula-customer="{ linha }">
      <span class="ex-doente">
        <span class="ex-avatar">{{ iniciais(linha.screening?.customer?.name) }}</span>
        <span>
          <span class="ex-nome">{{ linha.screening?.customer?.name ?? "\u2014" }}</span>
          <span v-if="linha.screening?.customer?.phone" class="ex-contacto">
            {{ linha.screening.customer.phone }}
          </span>
        </span>
      </span>
    </template>

    <!-- Os sinais da triagem, em números e sem tinta: quem os julga é a
         coluna da prioridade, que os pesa todos. -->
    <template #celula-vitais="{ linha }">
      <span v-if="!vitais(linha).length" class="ex-sem">Sem sinais registados</span>
      <span v-else class="ex-vitais">
        <span v-for="sinal in vitais(linha)" :key="sinal.rotulo" class="ex-vital">
          <span class="num">{{ sinal.valor }}</span> {{ sinal.unidade }}
          <q-tooltip>{{ sinal.rotulo }}</q-tooltip>
        </span>
      </span>
    </template>

    <template #celula-description="{ linha }">
      <span v-if="linha.description" class="ex-notas">
        {{ linha.description }}
        <q-tooltip max-width="320px">{{ linha.description }}</q-tooltip>
      </span>
      <span v-else class="ex-sem">\u2014</span>
    </template>

    <template #celula-continuar="{ linha }">
      <q-btn
        unelevated no-caps dense
        label="Continuar"
        class="btn-primaria ex-accao"
        @click="continuar(linha.id)"
      />
    </template>
  </ListaPagina>
</template>

<script setup>
/**
 * As consultas que este médico tem abertas.
 *
 * A fase — se os exames já voltaram ou se ainda se espera por eles — era uma
 * cápsula dentro do cartão, e é o que decide se vale a pena voltar ao doente
 * agora. Passa a coluna, ao lado da prioridade.
 *
 * Os sinais vitais tinham ícones coloridos à mão: o batimento a vermelho, a
 * tensão a azul, o peso a cinzento. A cor não vinha do valor — era fixa. Quem
 * pesa os sinais é a coluna da prioridade, que os lê todos; aqui ficam os
 * números.
 */
import { computed } from "vue";
import { useRouter } from "vue-router";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { useCommom } from "src/composables/commom";
import { usePaginacaoLocal } from "src/composables/paginacao-local";

const router = useRouter();
const { loading, data, fetchAll } = useCommom("consultations");

/* ── Prioridade, a partir dos sinais vitais da triagem ─────────────────── */
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
  if (!p) return { rotulo: "Sem dados", tom: "neutro", ordem: 3 };
  if (p <= 5) return { rotulo: "Não urgente", tom: "ok", ordem: 2 };
  if (p <= 10) return { rotulo: "Urgência", tom: "aviso", ordem: 1 };
  return { rotulo: "Emergência", tom: "erro", ordem: 0 };
};

/* ── A lista ───────────────────────────────────────────────────────────── */
const aDecorrer = computed(() =>
  [...data.filter((r) => r.status === "running")].sort(
    (a, b) => severidade(a.screening).ordem - severidade(b.screening).ordem,
  ),
);

const { paginacao, linhas } = usePaginacaoLocal(aDecorrer, [
  (l) => l.screening?.customer?.name,
  "description",
]);

const contexto = computed(() => {
  if (paginacao.search) return `a filtrar por \u201c${paginacao.search}\u201d`;
  const n = aDecorrer.value.length;
  return n ? `${n} em curso` : "";
});

const apoio = computed(() => {
  const prontas = aDecorrer.value.filter((r) => r.stage === "EXAM_RESULT").length;
  const resumo = prontas
    ? `${prontas} com exames já concluídos. `
    : "";
  return `${resumo}Ordenado por prioridade, não por hora de início.`;
});

/* ── Sinais vitais ─────────────────────────────────────────────────────── */
const SINAIS = [
  { chave: "heartbeatRate", unidade: "bpm", rotulo: "Frequência cardíaca" },
  { chave: "bloodPressure", unidade: "mmHg", rotulo: "Tensão arterial" },
  { chave: "weight", unidade: "kg", rotulo: "Peso" },
];

const vitais = (linha) =>
  SINAIS.filter((s) => linha.screening?.[s.chave]).map((s) => ({
    ...s,
    valor: linha.screening[s.chave],
  }));

/* ── Colunas ───────────────────────────────────────────────────────────── */
const iniciais = (nome) =>
  nome?.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase() ?? "?";

const colunas = [
  {
    name: "customer", label: "Doente",
    field: (l) => l.screening?.customer?.name ?? null, align: "left", ordenavel: true,
  },
  {
    name: "severidade", label: "Prioridade", field: (l) => l.screening ?? null,
    align: "left", estado: true, largura: "150px",
    format: (v) => severidade(v).rotulo,
    tom: (v) => severidade(v).tom,
  },
  {
    name: "stage", label: "Exames", field: "stage", align: "left",
    estado: true, largura: "190px",
    format: (v) => (v === "EXAM_RESULT" ? "Concluídos" : "A aguardar resultados"),
    tom: (v) => (v === "EXAM_RESULT" ? "ok" : "aviso"),
  },
  { name: "vitais", label: "Sinais vitais", field: () => null, align: "left", largura: "220px" },
  { name: "description", label: "Observações", field: "description", align: "left" },
  {
    name: "createdAt", label: "Iniciada às", field: "createdAt", align: "left", largura: "110px",
    format: (v) =>
      v
        ? new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" }).format(new Date(v))
        : "\u2014",
  },
  { name: "continuar", label: "", field: () => null, align: "right", largura: "120px" },
];

const continuar = (id) =>
  router.push({ name: "medico-atendimento", params: { consultationId: id } });
</script>

<style scoped lang="scss">
.ex-doente {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-3);
}

.ex-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--r-sm);
  background: var(--surface-3);
  color: var(--text-2);
  font-size: var(--fs-label);
  font-weight: var(--fw-semi);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ex-nome {
  display: block;
  font-weight: var(--fw-semi);
  color: var(--text);
}

.ex-contacto {
  display: block;
  margin-top: 1px;
  font-size: var(--fs-label);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.ex-vitais {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-2) var(--sp-3);
}

.ex-vital {
  font-size: var(--fs-label);
  color: var(--text-2);
  white-space: nowrap;
}

/* As observações são uma pré-visualização: uma linha, com o resto no
   tooltip. Numa fila, uma nota longa empurrava a linha para três alturas. */
.ex-notas {
  display: block;
  max-width: 34ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-2);
}

.ex-sem { font-size: var(--fs-label); color: var(--text-faint); }

.ex-accao {
  min-width: 104px;
  font-size: var(--fs-label);
}
</style>
