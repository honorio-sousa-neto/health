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
import Form from "src/components/parceiros/Form.vue";
import { columns } from "src/utils/columns/partner";
import { reactive, ref } from "vue";
const storeName = ref("partner");
const path = reactive({
  edit: "editing-partner",
  add: "editing-partners",
});
</script>
