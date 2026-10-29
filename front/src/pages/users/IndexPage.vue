<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Utilizadores"
    :contexto="contexto"
    :colunas="columns"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="!!pagination.search"
    texto-vazio="Ainda não há utilizadores registados."
    seleccionavel
    @recarregar="fetchAll"
  >
    <template #accoes-seleccao="{ n, linhas }">
      <DeleteMany :ids="linhas.map((l) => l.id)" path="users" />
    </template>

    <template #accoes>
      <NewRegist to="adicionar-usuario" rotulo="Novo utilizador" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton
        modo="item"
        @click="$router.push({ name: 'editar-usuario', params: { id: linha.id } })"
      />
      <DeleteButton modo="item" :id="linha.id" path="users" @success="fetchAll" />
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
import { columns } from "src/utils/columns/user";
import { servicoDe } from "src/config/papeis";

const { loading, data, pagination, fetchAll } = useCommom("users");
const seleccionados = ref([]);

const contexto = computed(() =>
  pagination.search ? `a filtrar por “${pagination.search}”` : "",
);

// O ficheiro de colunas traduz o papel para o serviço; a coluna mostrava o
// valor cru do enum ("techNursian") sob o rótulo "Role".
columns.find((c) => c.name === "email").format = (v) => servicoDe(v) || v || "—";
</script>
