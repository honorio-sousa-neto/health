<template>
  <ListaPagina
    titulo="Triagem"
    :contexto="contexto"
    apoio="Quem está em espera, em tempo real. A prioridade só aparece depois de haver sinais vitais registados."
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="!!pagination.search"
    texto-vazio="Nenhum doente em espera."
    @recarregar="fetchAll"
  >
    <template #accoes>
      <q-btn
        flat no-caps
        icon="las la-history"
        label="Histórico"
        class="btn-icone"
        :to="{ name: 'historico-triagem' }"
      />
    </template>

    <template #celula-customer="{ linha }">
      <span class="tg-doente">
        <span class="tg-avatar">{{ iniciais(linha.customer?.name) }}</span>
        <span class="tg-nome">{{ linha.customer?.name ?? "\u2014" }}</span>
      </span>
    </template>

    <!-- O impedimento é dito na linha, e não só depois do clique: sem factura
         associada a enfermaria não pode iniciar a triagem. -->
    <template #celula-triar="{ linha }">
      <q-btn
        unelevated no-caps dense
        :label="linha.status === 'RUNNING' ? 'Continuar' : 'Triar'"
        class="tg-triar"
        :class="temFactura(linha) ? 'btn-primaria' : ''"
        :outline="!temFactura(linha)"
        :disable="!temFactura(linha)"
        @click="triar(linha)"
      >
        <q-tooltip v-if="!temFactura(linha)">
          A enfermaria só pode iniciar a triagem depois de o atendimento ter
          factura associada.
        </q-tooltip>
      </q-btn>
    </template>
  </ListaPagina>
</template>

<script setup>
/**
 * A fila da triagem: quem chegou e espera por enfermeiro.
 *
 * ── A factura ────────────────────────────────────────────────────────────
 *
 * Sem factura associada ao atendimento, a triagem não pode começar. Isso era
 * dito depois do clique, numa notificação vermelha ao fundo do ecrã — quem
 * lia já tinha decidido avançar. Passa a estar na linha, antes: a coluna de
 * estado di-lo e o botão fica impedido, com o motivo no tooltip.
 *
 * ── A prioridade ─────────────────────────────────────────────────────────
 *
 * Calculada a partir dos sinais vitais, e por isso só existe depois de
 * alguém os registar. Antes disso a coluna diz "Por triar", que é o que se
 * passa, em vez de ficar vazia.
 */
import io from "src/utils/socket";
import { computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { api } from "src/boot/axios";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { useCommom } from "src/composables/commom";

const router = useRouter();
const { loading, data, pagination, fetchAll } = useCommom("screenings", { queue: true });

const contexto = computed(() =>
  pagination.search ? `a filtrar por \u201c${pagination.search}\u201d` : "",
);

/* ── Prioridade, a partir dos sinais vitais ────────────────────────────── */
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

const prioridade = (linha) => {
  const graus = [
    grauCor(linha.oxygen),
    grauCor(linha.fever),
    grauCor(linha.breathingRate),
    grauPulso(linha.heartbeatRate),
    grauTensao(linha.bloodPressure),
  ];
  if (!graus.some((g) => g > 0)) return { rotulo: "Por triar", tom: "neutro" };
  const total = graus.reduce((a, b) => a + b, 0);
  if (total <= 5) return { rotulo: "Não urgente", tom: "ok" };
  if (total <= 10) return { rotulo: "Urgência", tom: "aviso" };
  return { rotulo: "Emergência", tom: "erro" };
};

const ESTADO = { PENDING: "Em espera", RUNNING: "Em triagem", FINISHED: "Concluída" };
const TOM_ESTADO = { PENDING: "aviso", RUNNING: "info", FINISHED: "ok" };

/**
 * Só bloqueia quando sabemos que não há facturas. Quando a relação não veio
 * no pedido, `invoices` não é um array — e nesse caso não se pode afirmar
 * que não existe nenhuma.
 */
const temFactura = (linha) => {
  if (!Array.isArray(linha.customer?.invoices)) return true;
  return linha.customer.invoices.length > 0;
};

const iniciais = (nome) =>
  nome?.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase() ?? "?";

const hora = (v) =>
  v ? new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" }).format(new Date(v)) : "\u2014";

const colunas = [
  {
    name: "customer", label: "Doente",
    field: (l) => l.customer?.name ?? null, align: "left", ordenavel: true,
  },
  { name: "nurse", label: "Enfermeiro", field: (l) => l.nurse?.name ?? null, align: "left" },
  {
    name: "prioridade", label: "Prioridade", field: (l) => l, align: "left",
    estado: true, largura: "150px",
    format: (_, l) => prioridade(l).rotulo,
    tom: (_, l) => prioridade(l).tom,
  },
  {
    name: "status", label: "Estado", field: "status", align: "left",
    estado: true, largura: "140px",
    format: (v, l) => (temFactura(l) ? ESTADO[v] ?? v ?? "\u2014" : "Sem factura"),
    tom: (v, l) => (temFactura(l) ? TOM_ESTADO[v] ?? "neutro" : "erro"),
  },
  {
    name: "createdAt", label: "Entrou às", field: "createdAt",
    align: "left", largura: "110px", format: (v) => hora(v),
  },
  { name: "triar", label: "", field: () => null, align: "right", largura: "120px" },
];

const triar = (linha) => {
  if (!temFactura(linha)) return;
  router.push({ name: "editar-triagem", params: { consultationId: linha.id } });
};

/* ── Tempo real ────────────────────────────────────────────────────────── */
const socket = io(api.defaults.baseURL.slice(0, -4));

const aoCriar = (resposta) => {
  if (resposta) data.push(resposta);
};

const aoActualizar = (resposta) => {
  if (!resposta) return;
  const i = data.findIndex((r) => r.id === resposta.id);
  if (i === -1) return;
  // O evento não traz as facturas do cliente. Sem isto, uma actualização
  // apagava-as do que estava em memória e a linha passava a dizer "sem
  // factura" a quem a tinha.
  const facturas = data[i].customer?.invoices;
  Object.assign(data[i], resposta);
  if (facturas && !data[i].customer?.invoices) {
    data[i].customer = { ...data[i].customer, invoices: facturas };
  }
};

onMounted(() => {
  fetchAll();
  socket.on("screening:create", aoCriar);
  socket.on("screening:update", aoActualizar);
});

onUnmounted(() => {
  socket.off("screening:create", aoCriar);
  socket.off("screening:update", aoActualizar);
  socket.disconnect();
});
</script>

<style scoped lang="scss">
.tg-doente {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-3);
}

.tg-avatar {
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

.tg-nome {
  font-weight: var(--fw-semi);
  color: var(--text);
}

.tg-triar {
  min-width: 96px;
  font-size: var(--fs-label);
}
</style>
