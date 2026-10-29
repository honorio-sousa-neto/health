<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Consultas"
    :contexto="contexto"
    apoio="Tipos de consulta que a clínica oferece."
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="!!pagination.search"
    texto-vazio="Ainda não há tipos de consulta."
    seleccionavel
    @recarregar="fetchAll"
  >
    <template #accoes-seleccao="{ linhas }">
      <DeleteMany :ids="linhas.map((l) => l.id)" path="consultations" @success="fetchAll" />
    </template>

    <template #accoes>
      <NewRegist to="adicionar-consulta" rotulo="Nova consulta" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton modo="item" @click="$router.push({ name: 'editar-consulta', params: { id: linha.id } })" />
      <DeleteButton modo="item" :id="linha.id" path="consultations" @success="fetchAll" />
    </template>
  </ListaPagina>
</template>

<script setup>
import { computed, ref } from "vue";
import DeleteButton from "src/components/common/buttons/DeleteButton.vue";
import DeleteMany from "src/components/common/buttons/DeleteMany.vue";
import EditButton from "src/components/common/buttons/EditButton.vue";
import NewRegist from "src/components/common/buttons/NewRegist.vue";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { useCommom } from "src/composables/commom";

const { data, loading, pagination, fetchAll } = useCommom("consultations");
const seleccionados = ref([]);

const contexto = computed(() =>
  pagination.search ? `a filtrar por \u201c${pagination.search}\u201d` : "",
);

const colunas = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  { name: "description", label: "Descrição", field: "description", align: "left" },
  { name: "actions", label: "Acções", align: "right" },
];
</script>
