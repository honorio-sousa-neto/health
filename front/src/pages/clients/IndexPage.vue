<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Clientes"
    :contexto="contexto"
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="!!pagination.search"
    texto-vazio="Ainda não há clientes registados."
    seleccionavel
    @recarregar="fetchAll"
  >
    <template #accoes-seleccao="{ linhas }">
      <DeleteMany :ids="linhas.map((l) => l.id)" path="customers" @success="fetchAll" />
    </template>

    <template #accoes>
      <NewRegist to="adicionar-cliente" rotulo="Novo cliente" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton modo="item" @click="$router.push({ name: 'editar-cliente', params: { id: linha.id } })" />
      <DeleteButton modo="item" :id="linha.id" path="customers" @success="fetchAll" />
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

const { loading, data, pagination, fetchAll } = useCommom("customers");
const seleccionados = ref([]);

const contexto = computed(() =>
  pagination.search ? `a filtrar por \u201c${pagination.search}\u201d` : "",
);

const colunas = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  { name: "phone", label: "Contacto", field: "phone", align: "left" },
  { name: "nif", label: "NIF", field: "nif", align: "left", numerico: true },
  { name: "actions", label: "Acções", align: "right" },
];
</script>
