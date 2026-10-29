<template>
  <ListaPagina
    titulo="Pedidos de exame"
    :contexto="contexto"
    :apoio="apoio"
    :colunas="colunas"
    :linhas="linhas"
    :carregando="loading"
    :paginacao="paginacao"
    :filtrado="!!paginacao.search"
    texto-vazio="Nenhum pedido de exame. Os pedidos do médico e da recepção aparecem aqui."
    @recarregar="carregar"
  >
    <template #accoes>
      <q-btn
        flat no-caps
        icon="las la-history"
        label="Histórico"
        class="btn-icone"
        :to="{ name: 'historico-exame' }"
      />
    </template>

    <template #celula-doente="{ linha }">
      <span class="pe-doente">
        <span class="pe-avatar">{{ iniciais(linha.doente) }}</span>
        <span>
          <span class="pe-nome">{{ linha.doente ?? "\u2014" }}</span>
          <span class="pe-origem">{{ linha.medico ? `Dr. ${linha.medico}` : "Doente externo" }}</span>
        </span>
      </span>
    </template>

    <!-- Os exames do pedido, um a um, com o estado de facturação de cada. É
         por aí que se percebe um "parcialmente facturado". -->
    <template #celula-exames="{ linha }">
      <span v-if="!linha.exames.length" class="pe-sem">Sem exames detalhados</span>
      <ul v-else class="pe-exames">
        <li v-for="exame in linha.exames" :key="exame.id" class="pe-exame">
          <span class="lp-estado" :class="exame.paid ? 'lp-estado--ok' : 'lp-estado--neutro'">
            <span class="lp-estado__ponto" />
          </span>
          {{ exame.exam?.name ?? "\u2014" }}
        </li>
      </ul>
    </template>

    <template #celula-preencher="{ linha }">
      <q-btn
        unelevated no-caps dense
        icon="las la-flask"
        label="Preencher"
        class="pe-accao"
        :class="linha.podePreencher ? 'btn-primaria' : ''"
        :outline="!linha.podePreencher"
        :disable="!linha.podePreencher"
        @click="preencher(linha)"
      >
        <q-tooltip v-if="!linha.podePreencher">
          A aguardar facturação pela recepção. Nenhum destes exames está
          facturado.
        </q-tooltip>
        <q-tooltip v-else>Preencher resultados</q-tooltip>
      </q-btn>
    </template>
  </ListaPagina>
</template>

<script setup>
/**
 * Os pedidos de exame por realizar.
 *
 * ── Uma lista, duas origens ──────────────────────────────────────────────
 *
 * Os pedidos vêm de dois sítios — consultas e doentes externos — e eram duas
 * grelhas de cartões separadas, uma por baixo da outra, cada uma com a sua
 * pesquisa a filtrar só a sua metade. Para o analista é a mesma fila: o que
 * há para fazer. Passa a uma lista só, com a origem dita em cada linha.
 *
 * ── A facturação ─────────────────────────────────────────────────────────
 *
 * Um pedido só pode ser preenchido se pelo menos um exame estiver facturado.
 * Isso estava em quatro contadores no topo, em quatro cores, e outra vez no
 * tom do avatar de cada cartão. Fica numa coluna, e o botão impedido diz
 * porquê.
 */
import { computed, onMounted, onUnmounted, ref } from "vue";
import io from "src/utils/socket";
import { SessionStorage } from "quasar";
import { useRouter } from "vue-router";
import { api } from "src/boot/axios";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { useCommom } from "src/composables/commom";
import { usePaginacaoLocal } from "src/composables/paginacao-local";

const router = useRouter();
const utilizador = SessionStorage.getItem("alfavida_user");
const { loading, data, pagination } = useCommom("request-exams");
if (utilizador?.id) pagination.analystId = utilizador.id;

const externos = ref([]);

/** Um pedido de consulta pode ter exames em três sítios. */
const examesDe = (item) => {
  const lista = [...(item.exams ?? [])];
  (item.observation ?? []).forEach((o) => lista.push(...(o.exams ?? [])));
  (item.internment ?? []).forEach((i) => lista.push(...(i.exams ?? [])));
  return lista;
};

/** Facturado, parcial, ou nenhum — é isto que liberta o preenchimento. */
const situacao = (exames) => {
  if (!exames.length) return { rotulo: "Sem exames", tom: "neutro", chave: "nenhum" };
  const pagos = exames.filter((e) => e.paid).length;
  if (pagos === exames.length) return { rotulo: "Facturado", tom: "ok", chave: "pronto" };
  if (pagos > 0) return { rotulo: "Parcialmente facturado", tom: "aviso", chave: "parcial" };
  return { rotulo: "Por facturar", tom: "neutro", chave: "nenhum" };
};

// As duas origens numa fila só: para quem analisa, é a mesma lista.
const todos = computed(() => {
  const deConsultas = data.map((item) => {
    const exames = examesDe(item);
    return {
      id: item.id,
      chave: `c-${item.id}`,
      externo: false,
      doente: item.screening?.customer?.name ?? null,
      medico: item.doctor?.name ?? null,
      exames,
      situacao: situacao(exames),
      podePreencher: exames.some((e) => e.paid),
      criadoEm: item.createdAt,
    };
  });

  const deExternos = externos.value.map((item) => {
    const exames = item.exams ?? [];
    return {
      id: item.customerId,
      chave: `e-${item.customerId}`,
      externo: true,
      doente: item.customer?.name ?? null,
      medico: null,
      exames,
      situacao: situacao(exames),
      podePreencher: exames.some((e) => e.paid),
      criadoEm: item.createdAt ?? null,
    };
  });

  return [...deExternos, ...deConsultas];
});

const { paginacao, linhas } = usePaginacaoLocal(todos, ["doente", "medico"]);

const contexto = computed(() =>
  paginacao.search ? `a filtrar por \u201c${paginacao.search}\u201d` : "",
);

const apoio = computed(() => {
  const conta = (chave) => todos.value.filter((l) => l.situacao.chave === chave).length;
  const partes = [];
  const prontos = conta("pronto");
  const parciais = conta("parcial");
  const porFacturar = conta("nenhum");
  if (prontos) partes.push(`${prontos} prontos para análise`);
  if (parciais) partes.push(`${parciais} parcialmente facturados`);
  if (porFacturar) partes.push(`${porFacturar} a aguardar facturação`);
  const resumo = partes.length ? `${partes.join(" \u00b7 ")}. ` : "";
  return `${resumo}Só se preenchem resultados de exames já facturados.`;
});

const iniciais = (nome) =>
  nome?.trim().split(/\s+/).slice(0, 2).map((p) => p[0].toUpperCase()).join("") ?? "?";

const colunas = [
  { name: "doente", label: "Doente", field: "doente", align: "left", ordenavel: true },
  {
    name: "origem", label: "Origem", field: (l) => (l.externo ? "Externo" : "Consulta"),
    align: "left", largura: "110px",
  },
  { name: "exames", label: "Exames", field: () => null, align: "left" },
  {
    name: "facturacao", label: "Facturação", field: (l) => l, align: "left",
    estado: true, largura: "200px",
    format: (_, l) => l.situacao.rotulo,
    tom: (_, l) => l.situacao.tom,
  },
  {
    name: "criadoEm", label: "Pedido em", field: "criadoEm", align: "left", largura: "120px",
    format: (v) =>
      v
        ? new Intl.DateTimeFormat("pt-PT", {
            day: "2-digit", month: "2-digit", year: "numeric",
          }).format(new Date(v))
        : "\u2014",
  },
  { name: "preencher", label: "", field: () => null, align: "right", largura: "130px" },
];

/* ── Acções ────────────────────────────────────────────────────────────── */
const preencher = async (linha) => {
  if (!linha.podePreencher) return;
  if (linha.externo) {
    router.push({ name: "editar-exame-externo", params: { customerId: linha.id } });
    return;
  }
  // Reclamar antes de entrar: o pedido fica preso a quem o vai analisar.
  if (utilizador?.id) {
    await api
      .patch(`request-exams/claim/${linha.id}`, { analystId: utilizador.id })
      .catch(() => {});
  }
  router.push({ name: "editar-exame", params: { medicalConsultationId: linha.id } });
};

/* ── Tempo real ────────────────────────────────────────────────────────── */
const carregarExternos = async () => {
  try {
    const { data: res } = await api.get("request-exams/external");
    externos.value = res.data ?? [];
  } catch (_) {}
};

const carregar = () => carregarExternos();

const socket = io(api.defaults.baseURL.slice(0, -4));

const aoPedido = (resposta) => {
  if (!resposta) return;
  const i = data.findIndex((item) => item.id === resposta.id);
  if (i >= 0) data.splice(i, 1, resposta);
  else data.push(resposta);
};

onMounted(async () => {
  await carregarExternos();
  socket.on("exams:request", aoPedido);
  socket.on("exams:external-updated", carregarExternos);
});

onUnmounted(() => {
  socket.off("exams:request", aoPedido);
  socket.off("exams:external-updated", carregarExternos);
  socket.disconnect();
});
</script>

<style scoped lang="scss">
.pe-doente {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-3);
}

.pe-avatar {
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

.pe-nome {
  display: block;
  font-weight: var(--fw-semi);
  color: var(--text);
}

.pe-origem {
  display: block;
  margin-top: 1px;
  font-size: var(--fs-label);
  color: var(--text-muted);
}

.pe-exames {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pe-exame {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--fs-label);
  color: var(--text-2);
}

.pe-sem { font-size: var(--fs-label); color: var(--text-faint); }

.pe-accao {
  min-width: 112px;
  font-size: var(--fs-label);
}
</style>
