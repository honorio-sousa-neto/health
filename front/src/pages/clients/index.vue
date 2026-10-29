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
import Form from "src/components/clientes/Form.vue";
import { columns } from "src/utils/columns/customer";
import { reactive, ref } from "vue";
const storeName = ref("customer");
const path = reactive({
  edit: "editar-cliente",
  add: "adicionar-cliente",
});
</script>
