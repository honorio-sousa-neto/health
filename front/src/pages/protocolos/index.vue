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
import Form from "src/components/protocolos/Form.vue";
import { columns } from "src/utils/columns/protocol";
import { reactive, ref } from "vue";
const storeName = ref("protocol");
const path = reactive({
  edit: "editing-protocol",
  add: "editing-protocols",
});
</script>
