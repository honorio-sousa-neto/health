<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Métodos de pagamento"
    :contexto="contexto"
    apoio="O código é o que vai para o documento fiscal."
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="!!pagination.search"
    texto-vazio="Ainda não há métodos de pagamento."
    seleccionavel
    @recarregar="fetchAll"
  >
    <template #accoes-seleccao="{ linhas }">
      <DeleteMany :ids="linhas.map((l) => l.id)" path="payments" @success="fetchAll" />
    </template>

    <template #accoes>
      <NewRegist to="adicionar-pagamento" rotulo="Novo método" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton modo="item" @click="$router.push({ name: 'editar-pagamento', params: { id: linha.id } })" />
      <DeleteButton modo="item" :id="linha.id" path="payments" @success="fetchAll" />
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

const { data, loading, pagination, fetchAll } = useCommom("payments");
const seleccionados = ref([]);

const contexto = computed(() =>
  pagination.search ? `a filtrar por \u201c${pagination.search}\u201d` : "",
);

const colunas = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  { name: "code", label: "Código", field: "code", align: "left" },
  { name: "actions", label: "Acções", align: "right" },
];
</script>
