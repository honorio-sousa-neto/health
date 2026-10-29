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
import Form from "src/components/seguradoras/Form.vue";
import { columns } from "src/utils/columns/insurance";
import { reactive, ref } from "vue";
const storeName = ref("insurance");
const path = reactive({
  edit: "editing-insurance",
  add: "editing-insurances",
});
</script>
