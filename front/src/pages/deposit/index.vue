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
import Form from "src/components/depositos/Form.vue";
import { columns } from "src/utils/columns/deposit";
import { reactive, ref } from "vue";
const storeName = ref("deposit");
const path = reactive({
  edit: "editing-supplier",
  add: "editing-supplier",
});
</script>
