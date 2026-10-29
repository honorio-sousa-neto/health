<template>
  <div>
    <DataTable :columns :storeName :path>
      <template v-slot:formulary>
        <Form />
      </template>
    </DataTable>
  </div>
</template>
<script setup>
import DataTable from "src/components/global/data-table.vue";
import Form from "src/components/servicos/Form.vue";
import { columns } from "src/utils/columns/service";
import { reactive, ref } from "vue";
const storeName = ref("service");
const path = reactive({
  edit: "editing-service",
  add: "editing-service",
});
</script>
