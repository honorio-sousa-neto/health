<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Internamento"
    :contexto="contexto"
    apoio="Modalidades de internamento e o que cada uma inclui."
    :colunas="colunas"
    :linhas="store.data"
    :carregando="store.loading"
    :paginacao="store.pagination"
    :filtrado="!!store.pagination.search"
    texto-vazio="Ainda não há modalidades de internamento."
    seleccionavel
    @recarregar="store.index"
  >
    <template #accoes-seleccao="{ linhas }">
      <DeleteMany :ids="linhas.map((l) => l.id)" path="hospitalizations" @success="store.index" />
    </template>

    <template #accoes>
      <NewRegist to="adicionar-internamento" rotulo="Nova modalidade" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton modo="item" @click="$router.push({ name: 'editar-internamento', params: { id: linha.id } })" />
      <DeleteButton modo="item" :id="linha.id" path="hospitalizations" @success="store.index" />
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
import { useHospitalizationStore } from "src/stores/hospitalization";

const store = useHospitalizationStore();
onMounted(() => store.index());
const seleccionados = ref([]);

const contexto = computed(() =>
  store.pagination.search ? `a filtrar por \u201c${store.pagination.search}\u201d` : "",
);

const colunas = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  { name: "description", label: "Descrição", field: "description", align: "left" },
  { name: "actions", label: "Acções", align: "right" },
];
</script>
