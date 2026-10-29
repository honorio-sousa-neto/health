<template>
  <DataTable v-model:selected="selected" :columns :rows="data" :loading>
    <template #pagination>
      <Pagination
        v-model:perpage="pagination.perPage"
        v-model:page="pagination.page"
        v-model:search="pagination.search"
        :total-pages="pagination.totalPages"
        :total="pagination.total"
        @fetch="fetchAll"
      >
        <template #actions>
          <DeleteMany v-show="selected.length" :ids="selected.map((i) => i.id)" />
          <NewRegist to="adicionar-insumo" />
        </template>
      </Pagination>
    </template>
    <template #buttons="{ props }">
      <EditButton @click="$router.push({ name: 'editar-insumo', params: { id: props.row.id } })" />
      <DeleteButton :id="props.row.id" path="insumos" @delete="onDestroy" />
    </template>
  </DataTable>
</template>

<script setup>
import DeleteButton from "src/components/common/buttons/DeleteButton.vue";
import DeleteMany from "src/components/common/buttons/DeleteMany.vue";
import EditButton from "src/components/common/buttons/EditButton.vue";
import NewRegist from "src/components/common/buttons/NewRegist.vue";
import Pagination from "src/components/common/pagination/Pagination.vue";
import DataTable from "src/components/common/table/DataTable.vue";
import { useCommom } from "src/composables/commom";
import { ref } from "vue";

const { data, loading, pagination, fetchAll } = useCommom("insumos");
const selected = ref([]);
const columns = [
  { field: "name", name: "name", align: "left", label: "Nome" },
  { field: "description", name: "description", align: "center", label: "Descrição" },
  { name: "actions", align: "right", label: "Acções" },
];

const onDestroy = async () => {};
</script>
