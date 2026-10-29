<template>
  <div class="fin">
    <Resume v-model:status="paginacao.status" @fetch="fetchAll" />

    <ListaPagina
      titulo="Financeiro"
      :contexto="contexto"
      apoio="Documentos por estado de liquidação. O imposto de selo só se aplica ao que está pago."
      :colunas="colunas"
      :linhas="linhas"
      :carregando="carregando"
      :paginacao="paginacao"
      filtrado
      texto-vazio="Nenhum documento neste estado."
      @recarregar="fetchAll"
    >
      <template #linha-accoes="{ linha }">
        <PrintButton modo="item" print="a4" :id="linha.id" rotulo="Imprimir em A4" />
      </template>
    </ListaPagina>
  </div>
</template>

<script setup>
/**
 * Os documentos por estado de liquidação, com o resumo por cima.
 *
 * O "Kz" escrito à mão a seguir a cada número saiu: a moeda passa pelo mesmo
 * formatador do resto do sistema. As cápsulas de estado passam a ponto e
 * rótulo.
 */
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "src/boot/axios";
import PrintButton from "src/components/common/buttons/PrintButton.vue";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import Resume from "./Resume.vue";
import { kwanza } from "src/utils/format";

const route = useRoute();
const router = useRouter();
const carregando = ref(false);
const linhas = ref([]);

const paginacao = reactive({
  page: Number(route.query.page) || 1,
  perPage: Number(route.query.perPage) || 15,
  totalPages: 1,
  total: 0,
  search: "",
  status: route.query.status ?? "POR_PAGAR",
});

const contexto = computed(() =>
  paginacao.status === "PAGO" ? "pagos" : "por pagar",
);

const cliente = (linha) =>
  ["RC", "ND", "NC"].includes(linha.type)
    ? linha.invoiceSource?.customer?.name ?? null
    : linha.customer?.name ?? null;

const colunas = [
  { name: "reference", label: "Referência", field: "reference", align: "left" },
  { name: "customer", label: "Cliente", field: cliente, align: "left", ordenavel: true },
  {
    name: "emission_date", label: "Data", field: "emission_date", align: "left", ordenavel: true,
    format: (v) =>
      v
        ? new Intl.DateTimeFormat("pt-PT", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          }).format(new Date(v))
        : "\u2014",
  },
  {
    name: "status", label: "Estado", field: "status", align: "left", estado: true,
    format: (v) => (v === "PAGO" ? "Pago" : "Por pagar"),
    tom: (v) => (v === "PAGO" ? "ok" : "aviso"),
  },
  {
    name: "total", label: "Total", field: "total",
    numerico: true, ordenavel: true, format: (v) => kwanza(v),
  },
  {
    name: "selo", label: "Imposto de selo", field: "total",
    numerico: true,
    // O selo é 1% e só existe no que está pago. A coluna dizia "—" no resto,
    // sem explicar porquê; o cabeçalho e a linha de apoio dizem-no agora.
    format: (v, linha) => (linha.status === "PAGO" ? kwanza(Number(v ?? 0) / 100) : "\u2014"),
  },
  { name: "actions", label: "Acções", align: "right" },
];

const fetchAll = async () => {
  carregando.value = true;
  try {
    router.replace({
      query: { page: paginacao.page, perPage: paginacao.perPage, status: paginacao.status },
    });
    const { data } = await api.get("invoices/index/by-status", {
      params: {
        page: paginacao.page,
        perPage: paginacao.perPage,
        status: paginacao.status,
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

onMounted(fetchAll);
</script>

<style scoped lang="scss">
.fin {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}
</style>
