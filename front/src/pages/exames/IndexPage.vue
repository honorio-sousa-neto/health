<template>
  <DataTable v-model:selected="selected" :columns :rows="data" title="Secção">
    <template #breadcrumbs>
      <Breadcrumbs>
        <template #children>
          <q-breadcrumbs-el
            label="Secção"
            active-class="text-h6 text-weight-regular text-teal-8"
            :to="{ name: 'lista-seccao' }"
          />
        </template>
      </Breadcrumbs>
    </template>
    <template #action>
      <div class="row full-width items-center justify-between">
        <SearchInput
          v-model:search="pagination.search"
          @fetch="fetchAll"
          debounce="700"
        />
        <NewRegist to="adicionar-seccao" />
        <div v-show="selected.length">
          <DeleteMany :ids="selected.map((item) => item.id)" />
        </div>
      </div>
    </template>
    <template #buttons="{ props }">
      <div class="row justify-end">
        <EditButton
          @click="
            $router.push({
              name: 'editar-seccao',
              params: { id: props.row.id },
            })
          "
        />
        <DeleteButton
          :loading="loading"
          :id="props.row.id"
          @delete="onDestroy"
        />
      </div>
    </template>
  </DataTable>
  <Pagination
    v-model:perpage="pagination.perPage"
    v-model:page="pagination.page"
    @fetch="fetchAll"
    :total-pages="pagination.totalPages"
  />
</template>
<script setup>
import DataTable from "src/components/common/table/DataTable.vue";
import Pagination from "src/components/common/pagination/Pagination.vue";
import SearchInput from "src/components/common/table/SearchInput.vue";
import NewRegist from "src/components/common/buttons/NewRegist.vue";
import EditButton from "src/components/common/buttons/EditButton.vue";
import DeleteButton from "src/components/common/buttons/DeleteButton.vue";
import DeleteMany from "src/components/common/buttons/DeleteMany.vue";
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import { ref } from "vue";
import { useCommom } from "src/composables/commom";
import { columns } from "src/utils/columns/section";
const { loading, data, pagination, fetchAll } = useCommom("sections");
const selected = ref([]);

const onDestroy = async (payload) => {
  await softDelete(payload);
};
</script>
