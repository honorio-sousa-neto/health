<template>
  <DataTable v-model:selected="selected" :columns :rows="data" :loading>
    <template #breadcrumbs>
      <Breadcrumbs>
        <template #children>
          <q-breadcrumbs-el
            label="Assinaturas"
            active-class="text-h6 text-weight-regular text-teal-8"
            :to="{ name: 'lista-assinatura' }"
          />
        </template>
      </Breadcrumbs>
    </template>
    <template #action>
      <div class="row justify-between full-width items-center">
        <div class="row q-gutter-md">
          <SearchInput
            v-model:search="pagination.search"
            @fetch="fetchAll"
            debounce="700"
          />
        </div>
        <div class="row q-gutter-sm">
          <NewRegist to="adicionar-assinatura" />
          <div v-show="selected.length">
            <DeleteMany :ids="selected.map((item) => item.id)" />
          </div>
        </div>
      </div>
    </template>
    <template #buttons="{ props }">
      <div class="row justify-end">
        <EditButton
          @click="
            $router.push({
              name: 'editar-assinatura',
              params: { id: props.row.id },
            })
          "
        />
        <DeleteButton
          @success="fetchAll"
          path="signings"
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
    :total="pagination.total"
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
import { useCommom } from "src/composables/commom";

const { data, loading, pagination, fetchAll } = useCommom("signings");
import { ref } from "vue";
import SelectInput from "src/components/common/table/SelectInput.vue";
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
const selected = ref([]);
const columns = [
  {
    field: "customer",
    name: "name",
    align: "left",
    label: "Cliente",
    format: (val) => val.name,
  },
  {
    field: "intern",
    name: "description",
    align: "center",
    label: "Pacote",
    format: (val) => val.name,
  },
  {
    field: "startDate",
    name: "description",
    align: "center",
    label: "Data de início",
    format: (val) =>
      new Intl.DateTimeFormat("pt", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(val)),
  },
  {
    field: "endDate",
    name: "description",
    align: "center",
    label: "Data de término",
    format: (val) =>
      new Intl.DateTimeFormat("pt", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(val)),
  },
  {
    name: "actions",
    align: "right",
    label: "Acções",
  },
];

const onDestroy = async () => {};
</script>
