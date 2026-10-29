<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Serviços"
    :contexto="contexto"
    apoio="O que a clínica realiza e factura. Cada serviço pode ter consumo padrão e parâmetros de exame."
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="!!pagination.search"
    texto-vazio="Ainda não há serviços registados."
    seleccionavel
    @recarregar="fetchAll"
  >
    <template #accoes-seleccao="{ linhas }">
      <DeleteMany :ids="linhas.map((l) => l.id)" path="services" @success="fetchAll" />
    </template>

    <template #accoes>
      <NewRegist to="adicionar-servico" rotulo="Novo serviço" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton modo="item" @click="$router.push({ name: 'editar-servico', params: { id: linha.id } })" />
      <DeleteButton modo="item" :id="linha.id" path="services" @success="fetchAll" />
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

const { data, loading, pagination, fetchAll } = useCommom("services");
// Sem isto a lista devolvia tudo — serviços, produtos e consumíveis juntos —
// e a separação do menu (Artigos › Produtos / Serviços / Consumíveis) era só
// visual. O backend já filtra por type quando o parâmetro é enviado.
pagination.type = "SERVICE";
const seleccionados = ref([]);

const contexto = computed(() =>
  pagination.search ? `a filtrar por \u201c${pagination.search}\u201d` : "",
);

const colunas = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  {
    name: "category", label: "Categoria",
    field: (linha) => linha.category?.name ?? null, align: "left",
  },
  {
    name: "unit_price", label: "Preço", field: "unit_price",
    numerico: true, ordenavel: true,
    format: (v) => (v == null ? "\u2014" : kwanza(v)),
  },
  { name: "actions", label: "Acções", align: "right" },
];
</script>
