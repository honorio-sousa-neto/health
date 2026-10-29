<template>
  <ListaPagina
    titulo="Documentos do período"
    :contexto="contexto"
    :colunas="colunas"
    :linhas="linhas"
    :carregando="carregando"
    :paginacao="paginacao"
    filtrado
    texto-vazio="Nenhum documento neste período e categoria."
    @recarregar="fetchAll"
  >
    <template #accoes>
      <q-btn
        flat no-caps
        icon="las la-arrow-left"
        label="Voltar ao balanço"
        class="btn-icone"
        @click="$router.push({ name: 'balanco-relatorio' })"
      />
    </template>

    <template #linha-accoes="{ linha }">
      <PrintButton modo="item" print="a4" :id="linha.id" rotulo="Imprimir em A4" />
    </template>
  </ListaPagina>
</template>

<script setup>
/**
 * Os documentos que compõem uma linha do balanço.
 *
 * O "Kz" era escrito à mão a seguir ao número; passa pelo mesmo formatador do
 * resto. A navegação de volta era um migalho de pão em `text-teal-8`, cor da
 * paleta do Quasar.
 */
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { api } from "src/boot/axios";
import PrintButton from "src/components/common/buttons/PrintButton.vue";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { kwanza } from "src/utils/format";

const route = useRoute();
const carregando = ref(false);
const linhas = ref([]);

const paginacao = reactive({ page: 1, perPage: 15, totalPages: 1, total: 0, search: "" });

const contexto = computed(() => route.query.range ?? "");

const colunas = [
  { name: "reference", label: "Referência", field: "reference", align: "left" },
  {
    name: "customer", label: "Cliente",
    field: (linha) => linha.customer?.name ?? null, align: "left", ordenavel: true,
  },
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
    name: "total", label: "Total", field: "total",
    numerico: true, ordenavel: true, format: (v) => kwanza(v),
  },
  { name: "actions", label: "Acções", align: "right" },
];

const fetchAll = async () => {
  carregando.value = true;
  try {
    const { data } = await api.get("invoices/index/by-service-category", {
      params: {
        range: route.query.range,
        category: route.params.category,
        page: paginacao.page,
        perPage: paginacao.perPage,
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
