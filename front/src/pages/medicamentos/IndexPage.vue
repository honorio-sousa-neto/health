<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Medicamentos"
    :contexto="contexto"
    apoio="A taxa de aumento é a margem aplicada sobre o custo."
    :colunas="colunas"
    :linhas="store.state.data"
    :carregando="store.loadings.loadingAll"
    :paginacao="store.pagination"
    :filtrado="!!store.pagination.search"
    texto-vazio="Ainda não há medicamentos registados."
    seleccionavel
    @recarregar="store.index"
  >
    <template #accoes-seleccao="{ linhas }">
      <DeleteMany :ids="linhas.map((l) => l.id)" path="drugs" @success="store.index" />
    </template>

    <template #accoes>
      <NewRegist to="adicionar-medicamento" rotulo="Novo medicamento" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton modo="item" @click="$router.push({ name: 'editar-medicamento', params: { id: linha.id } })" />
      <DeleteButton modo="item" :id="linha.id" path="drugs" @success="store.index" />
    </template>
  </ListaPagina>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import DeleteButton from "src/components/common/buttons/DeleteButton.vue";
import DeleteMany from "src/components/common/buttons/DeleteMany.vue";
import EditButton from "src/components/common/buttons/EditButton.vue";
import NewRegist from "src/components/common/buttons/NewRegist.vue";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { useDrugStore } from "src/stores/drug";
import { kwanza } from "src/utils/format";

const store = useDrugStore();
const seleccionados = ref([]);

const contexto = computed(() =>
  store.pagination.search ? `a filtrar por \u201c${store.pagination.search}\u201d` : "",
);

const colunas = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  {
    name: "amount", label: "Custo", field: "amount",
    numerico: true, ordenavel: true,
    format: (v) => (v == null ? "\u2014" : kwanza(v)),
  },
  {
    name: "tax", label: "Taxa de aumento", field: "tax",
    numerico: true, ordenavel: true,
    format: (v) => (v == null ? "\u2014" : `${v}%`),
  },
  { name: "actions", label: "Acções", align: "right" },
];

onMounted(() => store.index());
</script>
