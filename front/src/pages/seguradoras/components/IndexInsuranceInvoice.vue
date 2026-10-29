<template>
  <DataTable v-model:selected="selected" :columns :rows="data" class="q-mb-xl">
    <template #action>
      <div class="row full-width items-center justify-between">
        <SearchInput v-model:search="search" @fetch="fetchAll" debounce="700" />
      </div>
    </template>
    <template #buttons="{ props }">
      <div class="row justify-center">
        <EditButton
          @click="
            $router.push({
              name: 'editar-seguradora',
              params: { id: props.row.id },
            })
          "
        />
      </div>
    </template>
  </DataTable>
  <Pagination
    v-model:perpage="perPage"
    v-model:page="page"
    @fetch="fetchAll"
    :total-pages="totalPages"
  />
</template>
<script setup>
import DataTable from "src/components/common/table/DataTable.vue";
import Pagination from "src/components/common/pagination/Pagination.vue";
import SearchInput from "src/components/common/table/SearchInput.vue";
import EditButton from "src/components/common/buttons/EditButton.vue";
import { ref } from "vue";
import { columns } from "src/utils/columns/invoice";
const selected = ref([]);
const perPage = defineModel("perpage");
const page = defineModel("page", { default: 1 });
const search = defineModel("search");

const emits = defineEmits(["fetchData"]);
defineProps({
  data: {
    type: Array,
    default: [],
  },
  totalPages: {
    type: Number,
  },
});

const fetchAll = async (payload) => {
  emits("fetchData");
};
</script>
