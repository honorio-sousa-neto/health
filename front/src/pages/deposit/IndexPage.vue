<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Depósitos"
    :contexto="contexto"
    apoio="Entradas de dinheiro em conta bancária."
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="!!pagination.search"
    texto-vazio="Ainda não há depósitos registados."
    seleccionavel
    @recarregar="fetchAll"
  >
    <template #accoes-seleccao="{ linhas }">
      <DeleteMany :ids="linhas.map((l) => l.id)" path="deposits" @success="fetchAll" />
    </template>

    <template #accoes>
      <NewRegist to="adicionar-deposito" rotulo="Novo depósito" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton modo="item" @click="$router.push({ name: 'editar-deposito', params: { id: linha.id } })" />
      <DeleteButton modo="item" :id="linha.id" path="deposits" @success="fetchAll" />
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
import { kwanza } from "src/utils/format";

const { loading, data, pagination, fetchAll } = useCommom("deposits");
const seleccionados = ref([]);

const contexto = computed(() =>
  pagination.search ? `a filtrar por \u201c${pagination.search}\u201d` : "",
);

const colunas = [
  {
    name: "bank", label: "Conta", field: (linha) => linha.bank?.name ?? null,
    align: "left", ordenavel: true,
  },
  {
    name: "amount", label: "Montante", field: "amount",
    numerico: true, ordenavel: true, format: (v) => kwanza(v),
  },
  {
    name: "createdAt", label: "Data", field: "createdAt", align: "left",
    format: (v) => (v ? new Date(v).toLocaleDateString("pt-PT") : "\u2014"),
  },
  { name: "actions", label: "Acções", align: "right" },
];
</script>
