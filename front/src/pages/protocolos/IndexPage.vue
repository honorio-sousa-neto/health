<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Protocolos"
    :contexto="contexto"
    apoio="Acordos que aplicam uma percentagem de desconto sobre o preçário."
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="!!pagination.search"
    texto-vazio="Ainda não há protocolos registados."
    seleccionavel
    @recarregar="fetchAll"
  >
    <template #accoes-seleccao="{ linhas }">
      <DeleteMany :ids="linhas.map((l) => l.id)" path="protocols" />
    </template>

    <template #accoes>
      <NewRegist to="adicionar-protocolo" rotulo="Novo protocolo" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton
        modo="item"
        @click="$router.push({ name: 'editar-protocolo', params: { id: linha.id } })"
      />
      <DeleteButton modo="item" :id="linha.id" path="protocols" @success="fetchAll" />
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

const { data, loading, pagination, fetchAll } = useCommom("protocols");
const seleccionados = ref([]);

const contexto = computed(() =>
  pagination.search ? `a filtrar por “${pagination.search}”` : "",
);

const colunas = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  {
    name: "value",
    label: "Desconto",
    field: "value",
    numerico: true,
    ordenavel: true,
    format: (v) => (v == null || v === "" ? "—" : `${v}%`),
  },
  { name: "actions", label: "Acções", align: "right" },
];
</script>
