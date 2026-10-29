<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    :titulo="grupo ? `Subgrupos de ${grupo}` : 'Subgrupos'"
    :contexto="contexto"
    :colunas="colunas"
    :linhas="linhas"
    :carregando="carregando"
    :paginacao="paginacao"
    :filtrado="!!paginacao.search"
    texto-vazio="Este grupo ainda não tem subgrupos."
    seleccionavel
    @recarregar="fetchAll"
  >
    <template #accoes-seleccao="{ linhas: sel }">
      <DeleteMany :ids="sel.map((l) => l.id)" path="groups" @success="fetchAll" />
    </template>

    <template #accoes>
      <NewRegist to="subgrupos" :params="{ id: route.params.id }" rotulo="Novo subgrupo" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton modo="item" @click="$router.push({ name: 'editar-grupo', params: { id: linha.id } })" />
      <DeleteButton modo="item" :id="linha.id" path="groups" @success="fetchAll" />
    </template>
  </ListaPagina>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import DeleteButton from "src/components/common/buttons/DeleteButton.vue";
import DeleteMany from "src/components/common/buttons/DeleteMany.vue";
import EditButton from "src/components/common/buttons/EditButton.vue";
import NewRegist from "src/components/common/buttons/NewRegist.vue";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { useCreateUpdate } from "src/composables/create-update";
import { usePaginacaoLocal } from "src/composables/paginacao-local";

const { fetchOne } = useCreateUpdate("groups");
const route = useRoute();

const todos = ref([]);
const grupo = ref(null);
const carregando = ref(false);
const seleccionados = ref([]);

// Os subgrupos vêm todos dentro do grupo — não há paginação no servidor.
const { paginacao, linhas } = usePaginacaoLocal(todos);

const contexto = computed(() =>
  paginacao.search ? `a filtrar por \u201c${paginacao.search}\u201d` : "",
);

const colunas = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  { name: "actions", label: "Acções", align: "right" },
];

const fetchAll = async () => {
  carregando.value = true;
  try {
    const dados = await fetchOne(route.params.id);
    todos.value = dados?.subgroups ?? [];
    grupo.value = dados?.name ?? null;
  } finally {
    carregando.value = false;
  }
};

onMounted(fetchAll);
</script>
