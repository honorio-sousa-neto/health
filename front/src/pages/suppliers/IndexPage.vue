<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Fornecedores"
    :contexto="contexto"
    apoio="A quem se compra. O NIF e o número de factura são o que liga uma compra ao documento do fornecedor."
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="!!pagination.search"
    texto-vazio="Ainda não há fornecedores registados."
    seleccionavel
    @recarregar="fetchAll"
  >
    <template #accoes-seleccao="{ linhas }">
      <DeleteMany :ids="linhas.map((l) => l.id)" path="suppliers" @success="fetchAll" />
    </template>

    <template #accoes>
      <NewRegist to="adicionar-fornecedor" rotulo="Novo fornecedor" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton modo="item" @click="$router.push({ name: 'editar-fornecedor', params: { id: linha.id } })" />
      <DeleteButton modo="item" :id="linha.id" path="suppliers" @success="fetchAll" />
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

const { loading, data, pagination, fetchAll } = useCommom("suppliers");
const seleccionados = ref([]);

const contexto = computed(() =>
  pagination.search ? `a filtrar por \u201c${pagination.search}\u201d` : "",
);

const colunas = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  { name: "nif", label: "NIF", field: "nif", align: "left", numerico: true },
  { name: "phone", label: "Contacto", field: "phone", align: "left" },
  { name: "email", label: "Email", field: "email", align: "left" },
  { name: "address", label: "Morada", field: "address", align: "left" },
  { name: "actions", label: "Acções", align: "right" },
];
</script>
