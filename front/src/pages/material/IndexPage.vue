<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Consumíveis"
    :contexto="contexto"
    apoio="Reagentes, material de uso e equipamento. O que se gasta a realizar serviços."
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="!!pagination.search"
    texto-vazio="Ainda não há consumíveis registados."
    seleccionavel
    @recarregar="fetchAll"
  >
    <template #accoes-seleccao="{ linhas }">
      <DeleteMany :ids="linhas.map((l) => l.id)" path="materials" @success="fetchAll" />
    </template>

    <template #accoes>
      <NewRegist to="adicionar-materials" rotulo="Novo consumível" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton modo="item" @click="$router.push({ name: 'editar-materials', params: { id: linha.id } })" />
      <DeleteButton modo="item" :id="linha.id" path="materials" @success="fetchAll" />
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
import { quantidade } from "src/utils/format";

const { data, loading, pagination, fetchAll } = useCommom("materials");
const seleccionados = ref([]);

const contexto = computed(() =>
  pagination.search ? `a filtrar por \u201c${pagination.search}\u201d` : "",
);

const CLASSE = {
  reagent: "Reagente",
  consumable: "Consumível",
  equipment: "Equipamento",
  epi: "EPI",
  glassware: "Vidros",
  standardSolution: "Solução padrão",
};

// "Estoque" era resíduo de PT-BR. A forma portuguesa do saldo em mão é
// "existências", que é também o nome da página do inventário.
const colunas = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  {
    name: "materialCategory", label: "Classe", field: "materialCategory",
    align: "left", format: (v) => CLASSE[v] ?? v ?? "\u2014",
  },
  {
    name: "currentQuantity", label: "Existências", field: "currentQuantity",
    numerico: true, ordenavel: true, format: (v) => quantidade(v ?? 0),
  },
  {
    name: "minimumStock", label: "Stock mínimo", field: "minimumStock",
    numerico: true, format: (v) => (v == null ? "\u2014" : quantidade(v)),
  },
  { name: "actions", label: "Acções", align: "right" },
];
</script>
