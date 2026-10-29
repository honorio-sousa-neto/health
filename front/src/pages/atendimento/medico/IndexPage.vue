<template>
  <ListaPagina
    titulo="Consultório"
    :contexto="contexto"
    :apoio="apoio"
    :colunas="colunas"
    :linhas="linhas"
    :carregando="loading"
    :paginacao="paginacao"
    :filtrado="!!paginacao.search"
    texto-vazio="Nenhum doente em espera. Os triados aparecem aqui em tempo real."
    @recarregar="carregar"
  >
    <template #accoes>
      <q-btn
        flat no-caps
        icon="las la-spinner"
        label="A decorrer"
        class="btn-icone"
        :to="{ name: 'medico-lista-resultado-exames' }"
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
      <span class="fl-doente">
        <span class="fl-avatar">{{ iniciais(linha.screening?.customer?.name) }}</span>
        <span>
          <span class="fl-nome">{{ linha.screening?.customer?.name ?? "\u2014" }}</span>
          <span v-if="linha.screening?.customer?.phone" class="fl-contacto">
            {{ linha.screening.customer.phone }}
          </span>
        </span>
      </span>
    </template>

    <!-- A espera cresce enquanto a página está aberta: o relógio abaixo faz
         a coluna avançar sem ser preciso recarregar. -->
    <template #celula-espera="{ linha }">
      <span class="lp-estado" :class="`lp-estado--${tomDaEspera(linha.screening?.createdAt)}`">
        <span class="lp-estado__ponto" />{{ espera(linha.screening?.createdAt) }}
      </span>
    </template>

    <!-- Divergência deliberada do padrão: numa fila clínica, a acção de cada
         linha é a razão de ser do ecrã e é feita dezenas de vezes por turno.
         Escondê-la atrás do menu de três pontos custava um clique de cada
         vez, no ecrã onde isso mais pesa. -->
    <template #celula-atender="{ linha }">
      <q-btn
        unelevated no-caps dense
        label="Atender"
        class="btn-primaria fl-atender"
        @click="atender(linha.id)"
      />
    </template>
  </ListaPagina>
</template>

<script setup>
/**
 * A fila do consultório: quem foi triado e espera por médico.
 *
 * ── A ordem ──────────────────────────────────────────────────────────────
 *
 * Por severidade, calculada a partir dos sinais vitais da triagem, e não por
 * ordem de chegada. É isso que torna a paginação segura aqui: uma emergência
 * nunca cai para a segunda página, porque a ordem põe-na sempre em primeiro.
 *
 * ── A cor ────────────────────────────────────────────────────────────────
 *
 * O avatar era um gradiente tingido pela severidade, e a severidade
 * aparecia outra vez ao lado em cápsula, e outra vez ainda nos contadores do
 * topo — três vezes a mesma informação, em três sítios. Fica uma coluna, com
 * a tinta clínica que lhe pertence; as contagens passam à linha de apoio.
 *
 * ── A espera ─────────────────────────────────────────────────────────────
 *
 * "Aguarda há 12 min" era calculado uma vez e nunca mais: numa fila em tempo
 * real, ficava congelado no momento em que a página abriu. Um relógio de
 * meio minuto fá-la avançar.
 */
import io from "src/utils/socket";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { SessionStorage } from "quasar";
import { api } from "src/boot/axios";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { useCommom } from "src/composables/commom";
import { usePaginacaoLocal } from "src/composables/paginacao-local";

const router = useRouter();
const utilizador = SessionStorage.getItem("alfavida_user");
const { loading, data, fetchAll } = useCommom("consultations", { perPage: 0 });

/* ── Severidade, a partir dos sinais vitais da triagem ─────────────────── */
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
  if (!p) return { nivel: "sem-dados", rotulo: "Sem dados", tom: "neutro", ordem: 3 };
  if (p <= 5) return { nivel: "verde", rotulo: "Não urgente", tom: "ok", ordem: 2 };
  if (p <= 10) return { nivel: "laranja", rotulo: "Urgência", tom: "aviso", ordem: 1 };
  return { nivel: "vermelho", rotulo: "Emergência", tom: "erro", ordem: 0 };
};

/* ── A fila ────────────────────────────────────────────────────────────── */
// Mostra o que ainda não tem médico, ou o que já é deste: uma consulta em
// curso fica presa a quem a reclamou.
const naFila = computed(() =>
  data.filter((r) => {
    if (r.status !== "pending" && r.status !== "running") return false;
    if (r.status === "running") return r.userId === utilizador?.id;
    return !r.userId || r.userId === utilizador?.id;
  }),
);

const ordenada = computed(() =>
  [...naFila.value].sort(
    (a, b) => severidade(a.screening).ordem - severidade(b.screening).ordem,
  ),
);

const { paginacao, linhas } = usePaginacaoLocal(ordenada, [
  (l) => l.screening?.customer?.name,
  (l) => l.screening?.customer?.phone,
]);

const contagens = computed(() => {
  const conta = (nivel) =>
    ordenada.value.filter((r) => severidade(r.screening).nivel === nivel).length;
  return { vermelho: conta("vermelho"), laranja: conta("laranja"), verde: conta("verde") };
});

const contexto = computed(() => {
  if (paginacao.search) return `a filtrar por \u201c${paginacao.search}\u201d`;
  const n = ordenada.value.length;
  return n ? `${n} na fila` : "";
});

const apoio = computed(() => {
  const { vermelho, laranja, verde } = contagens.value;
  const partes = [];
  if (vermelho) partes.push(`${vermelho} ${vermelho === 1 ? "emergência" : "emergências"}`);
  if (laranja) partes.push(`${laranja} ${laranja === 1 ? "urgência" : "urgências"}`);
  if (verde) partes.push(`${verde} não ${verde === 1 ? "urgente" : "urgentes"}`);
  const resumo = partes.length ? `${partes.join(" \u00b7 ")}. ` : "";
  return `${resumo}Ordenado por severidade, não por ordem de chegada.`;
});

/* ── A espera ──────────────────────────────────────────────────────────── */
const agora = ref(Date.now());
let relogio = null;

const minutosDeEspera = (valor) =>
  valor ? Math.floor((agora.value - new Date(valor).getTime()) / 60000) : null;

const espera = (valor) => {
  const m = minutosDeEspera(valor);
  if (m == null) return "\u2014";
  if (m < 1) return "menos de 1 min";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const resto = m % 60;
  return resto ? `${h}h ${resto}min` : `${h}h`;
};

const tomDaEspera = (valor) => {
  const m = minutosDeEspera(valor);
  if (m == null) return "neutro";
  if (m > 60) return "erro";
  if (m > 30) return "aviso";
  return "neutro";
};

/* ── Colunas ───────────────────────────────────────────────────────────── */
const iniciais = (nome) =>
  nome?.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase() ?? "?";

const hora = (v) =>
  v ? new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" }).format(new Date(v)) : "\u2014";

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
    name: "triado", label: "Triado às", field: (l) => l.screening?.createdAt ?? null,
    align: "left", largura: "110px", format: (v) => hora(v),
  },
  { name: "espera", label: "Aguarda há", field: () => null, align: "left", largura: "150px" },
  { name: "atender", label: "", field: () => null, align: "right", largura: "110px" },
];

/* ── Carregar e escutar ────────────────────────────────────────────────── */
const carregar = async () => {
  // Com `doctorId`, o servidor devolve as que não têm médico mais as deste.
  try {
    const params = utilizador?.id ? { doctorId: utilizador.id } : {};
    const { data: res } = await api.get("consultations", { params });
    data.splice(0, data.length, ...(res.data ?? []));
  } catch (_) {
    fetchAll();
  }
};

const atender = (id) =>
  router.push({ name: "medico-atendimento", params: { consultationId: id } });

const socket = io(api.defaults.baseURL.slice(0, -4));

onMounted(() => {
  carregar();
  socket.on("consultation:create", (resposta) => {
    if (resposta) data.push(resposta);
  });
  relogio = setInterval(() => { agora.value = Date.now(); }, 30000);
});

onUnmounted(() => {
  clearInterval(relogio);
  socket.off("consultation:create");
  socket.disconnect();
});
</script>

<style scoped lang="scss">
.fl-doente {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-3);
}

/* Era um gradiente tingido pela severidade. A severidade tem coluna própria;
   o avatar identifica quem é, e para isso chegam as iniciais. */
.fl-avatar {
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

.fl-nome {
  display: block;
  font-weight: var(--fw-semi);
  color: var(--text);
}

.fl-contacto {
  display: block;
  margin-top: 1px;
  font-size: var(--fs-label);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.fl-atender {
  min-width: 88px;
  font-size: var(--fs-label);
}
</style>
