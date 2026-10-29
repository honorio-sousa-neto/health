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
import Form from "src/components/pagamentos/Form.vue";
import { columns } from "src/utils/columns/payment";
import { reactive, ref } from "vue";
const storeName = ref("payment");
const path = reactive({
  edit: "editing-payment",
  add: "editing-payments",
});
</script>
