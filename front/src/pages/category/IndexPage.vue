<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Categorias"
    :contexto="contexto"
    apoio="Árvore de arrumação dos artigos. Uma categoria sem pai é uma área."
    :colunas="colunas"
    :linhas="store.data"
    :carregando="store.loading"
    :paginacao="store.pagination"
    :filtrado="!!store.pagination.search"
    texto-vazio="Ainda não há categorias."
    seleccionavel
    @recarregar="store.index"
  >
    <template #accoes-seleccao="{ linhas }">
      <DeleteMany hard :ids="linhas.map((l) => l.id)" path="categories" @success="store.index" />
    </template>

    <template #accoes>
      <NewRegist to="adicionar-categoria" rotulo="Nova categoria" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton modo="item" @click="$router.push({ name: 'editar-categoria', params: { id: linha.id } })" />
      <DeleteButton modo="item" hard :id="linha.id" path="categories" @success="store.index" />
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
import { useCategoryStore } from "src/stores/category";

const store = useCategoryStore();
const seleccionados = ref([]);

const contexto = computed(() =>
  store.pagination.search ? `a filtrar por \u201c${store.pagination.search}\u201d` : "",
);

const colunas = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  {
    name: "category",
    label: "Categoria pai",
    field: (linha) => linha.category?.name ?? null,
    align: "left",
    ordenavel: true,
    format: (v) => v ?? "\u2014 (\u00e9 uma \u00e1rea)",
  },
  { name: "actions", label: "Acções", align: "right" },
];

onMounted(() => store.index());
</script>
