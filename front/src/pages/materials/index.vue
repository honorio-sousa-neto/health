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
import Form from "src/components/materials/Form.vue";
import { columns } from "src/utils/columns/material";
import { reactive, ref } from "vue";
const storeName = ref("material");
const path = reactive({
  edit: "editing-materials",
  add: "editing-materials",
});
</script>
