<template>
  <ListaPagina
    titulo="Histórico de atendimentos"
    :contexto="contexto"
    apoio="Cada atendimento passa por espera, triagem e consulta. O estado diz onde está agora."
    :colunas="colunas"
    :linhas="linhas"
    :carregando="carregando"
    :paginacao="paginacao"
    :filtrado="!!paginacao.search"
    texto-vazio="Ainda não há atendimentos registados."
    @recarregar="fetchAll"
  >
    <template #accoes>
      <NewRegist to="lista-atendimento" rotulo="Novo atendimento" />
    </template>

    <template #linha-accoes="{ linha }">
      <q-item v-close-popup clickable @click="abrir(linha)">
        <q-item-section avatar><q-icon name="las la-eye" size="18px" /></q-item-section>
        <q-item-section>Abrir atendimento</q-item-section>
      </q-item>
    </template>
  </ListaPagina>
</template>

<script setup>
/**
 * O histórico de atendimentos da recepção.
 *
 * Os sete estados eram sete cápsulas de cor, e a triagem outra — "Feita" em
 * verde, "Pendente" em cinzento. Passam a ponto e rótulo: o mesmo mecanismo
 * de estado que o resto das listas, com o tom reservado ao que espera acção.
 *
 * A linha inteira era clicável sem o dizer. A acção passa ao menu de linha,
 * onde tem nome.
 */
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "src/boot/axios";
import NewRegist from "src/components/common/buttons/NewRegist.vue";
import ListaPagina from "src/components/common/table/ListaPagina.vue";

const router = useRouter();
const carregando = ref(false);
const linhas = ref([]);

const paginacao = reactive({ page: 1, perPage: 15, totalPages: 1, total: 0, search: "" });

const contexto = computed(() =>
  paginacao.search ? `a filtrar por \u201c${paginacao.search}\u201d` : "",
);

const ESTADO = {
  WAITING: "Em espera",
  IN_SCREENING: "Em triagem",
  SCREENED: "Triado",
  WAITING_DOCTOR: "Aguarda médico",
  IN_CONSULTATION: "Em consulta",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
};

// O tom marca quem está à espera de alguém. Quem já está a ser atendido, e
// quem terminou, não precisa de ser assinalado.
const TOM = {
  WAITING: "aviso",
  WAITING_DOCTOR: "aviso",
  IN_SCREENING: "info",
  IN_CONSULTATION: "info",
  COMPLETED: "ok",
  CANCELED: "neutro",
};

const colunas = [
  { name: "reference", label: "Referência", field: "reference", align: "left" },
  {
    name: "customer", label: "Doente",
    field: (l) => l.customer?.name ?? null, align: "left", ordenavel: true,
  },
  { name: "phone", label: "Telefone", field: (l) => l.customer?.phone ?? null, align: "left" },
  {
    name: "status", label: "Estado", field: "status", align: "left", estado: true,
    format: (v) => ESTADO[v] ?? v ?? "\u2014",
    tom: (v) => TOM[v] ?? "neutro",
  },
  {
    name: "screening", label: "Triagem", field: (l) => Boolean(l.screening),
    align: "left", estado: true,
    format: (v) => (v ? "Feita" : "Por fazer"),
    tom: (v) => (v ? "ok" : "aviso"),
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

const fetchAll = async () => {
  carregando.value = true;
  try {
    const { data } = await api.get("attendances", {
      params: {
        page: paginacao.page,
        perPage: paginacao.perPage,
        search: paginacao.search || undefined,
      },
    });
    linhas.value = data.data ?? [];
    Object.assign(paginacao, {
      total: data.meta?.total ?? 0,
      totalPages: data.meta?.totalPages ?? 1,
    });
  } finally {
    carregando.value = false;
  }
};

const abrir = (linha) =>
  router.push({ name: "recepcao-atendimento", params: { id: linha.id } });

onMounted(fetchAll);
</script>
