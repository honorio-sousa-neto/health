<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Seguros internos"
    :contexto="contexto"
    apoio="Pacotes da própria clínica, com cobertura e desconto próprios."
    :colunas="colunas"
    :linhas="store.data"
    :carregando="store.loading"
    :paginacao="store.pagination.meta"
    :filtrado="!!store.pagination.meta.search"
    texto-vazio="Ainda não há seguros internos."
    seleccionavel
    @recarregar="store.index"
  >
    <template #accoes-seleccao="{ linhas }">
      <DeleteMany :ids="linhas.map((l) => l.id)" path="interns" @success="store.index" />
    </template>

    <template #accoes>
      <NewRegist to="seguro-interno-adicionar" rotulo="Novo seguro interno" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton modo="item" @click="$router.push({ name: 'seguro-interno-editar', params: { id: linha.id } })" />
      <DeleteButton modo="item" :id="linha.id" path="interns" @success="store.index" />
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
import { useInternStore } from "src/stores/intern";

const store = useInternStore();
const seleccionados = ref([]);

const contexto = computed(() =>
  store.pagination.meta.search ? `a filtrar por \u201c${store.pagination.meta.search}\u201d` : "",
);

const TIPO = { single: "Simples", familiar: "Familiar", pregnancy: "Gravidez" };

const colunas = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  { name: "type", label: "Tipo", field: "type", align: "left", format: (v) => TIPO[v] ?? v ?? "\u2014" },
  { name: "actions", label: "Acções", align: "right" },
];

onMounted(() => store.index());
</script>
