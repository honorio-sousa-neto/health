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
import Form from "src/components/usuarios/Form.vue";
import { columns } from "src/utils/columns/user";
import { reactive, ref } from "vue";
const storeName = ref("user");
const path = reactive({
  edit: "editar-usuario",
  add: "adicionar-usuario",
});
</script>
