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
          <NewRegist to="adicionar-parceiro" />
        </template>
      </Pagination>
    </template>
    <template #buttons="{ props }">
      <EditButton @click="$router.push({ name: 'editar-parceiro', params: { id: props.row.id } })" />
      <DeleteButton :loading :id="props.row.id" path="partners" @delete="onDestroy" />
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
import { columns } from "src/utils/columns/partner";
import { ref } from "vue";

const { data, loading, pagination, fetchAll } = useCommom("partners");
const selected = ref([]);

const onDestroy = async () => {};
</script>
