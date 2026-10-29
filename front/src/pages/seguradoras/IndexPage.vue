<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Seguradoras"
    :contexto="contexto"
    apoio="Quem comparticipa. Cada seguradora tem o seu preçário e as suas facturas."
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="!!pagination.search"
    texto-vazio="Ainda não há seguradoras registadas."
    seleccionavel
    @recarregar="fetchAll"
  >
    <template #accoes-seleccao="{ linhas }">
      <DeleteMany :ids="linhas.map((l) => l.id)" path="insurances" @success="fetchAll" />
    </template>

    <template #accoes>
      <NewRegist to="adicionar-seguradora" rotulo="Nova seguradora" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton modo="item" @click="$router.push({ name: 'editar-seguradora', params: { id: linha.id } })" />
      <DeleteButton modo="item" :id="linha.id" path="insurances" @success="fetchAll" />
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

const { loading, data, pagination, fetchAll } = useCommom("insurances");
const seleccionados = ref([]);

const contexto = computed(() =>
  pagination.search ? `a filtrar por \u201c${pagination.search}\u201d` : "",
);

const colunas = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  { name: "nif", label: "NIF", field: "nif", align: "left", numerico: true },
  { name: "address", label: "Morada", field: "address", align: "left" },
  { name: "actions", label: "Acções", align: "right" },
];
</script>
