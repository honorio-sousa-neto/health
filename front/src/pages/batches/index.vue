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
import Form from "src/components/fornecedores/Form.vue";
import { columns } from "src/utils/columns/supplier";
import { reactive, ref } from "vue";
const storeName = ref("supplier");
const path = reactive({
  edit: "editing-supplier",
  add: "editing-supplier",
});
</script>
