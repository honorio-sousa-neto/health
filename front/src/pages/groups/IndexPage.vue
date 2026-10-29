<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Grupos"
    :contexto="contexto"
    :colunas="colunas"
    :linhas="store.state.groups"
    :carregando="store.loadings.loadingAll"
    :paginacao="store.pagination"
    :filtrado="!!store.pagination.search"
    texto-vazio="Ainda não há grupos."
    seleccionavel
    @recarregar="store.index"
  >
    <template #accoes-seleccao="{ linhas }">
      <DeleteMany :ids="linhas.map((l) => l.id)" path="groups" @success="store.index" />
    </template>

    <template #accoes>
      <NewRegist to="adicionar-grupo" rotulo="Novo grupo" />
    </template>

    <template #linha-accoes="{ linha }">
      <q-item v-close-popup clickable @click="$router.push({ name: 'ver-grupo', params: { id: linha.id } })">
        <q-item-section avatar><q-icon name="las la-eye" size="18px" /></q-item-section>
        <q-item-section>Ver subgrupos</q-item-section>
      </q-item>
      <EditButton modo="item" @click="$router.push({ name: 'editar-grupo', params: { id: linha.id } })" />
      <DeleteButton modo="item" :id="linha.id" path="groups" @success="store.index" />
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
import { useGroupStore } from "src/stores/group";

const store = useGroupStore();
const seleccionados = ref([]);

const contexto = computed(() =>
  store.pagination.search ? `a filtrar por \u201c${store.pagination.search}\u201d` : "",
);

const colunas = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  { name: "actions", label: "Acções", align: "right" },
];

onMounted(() => store.index());
</script>
