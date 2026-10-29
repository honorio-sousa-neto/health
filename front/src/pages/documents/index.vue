<template>
  <div>
    <invoiceTable :columns />
  </div>
</template>
<script setup>
import List from "src/components/documentos/List.vue";
import invoiceTable from "src/components/global/invoice-table.vue";
import { columns } from "src/utils/columns/invoice";
</script>
