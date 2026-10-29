<template>
  <q-card square flat>
    <q-table
      flat
      square
      :rows="store.currentInvoice.invoiceItems"
      :columns="columns"
      row-key="name"
      :pagination="{ rowsPerPage: 0 }"
      hide-bottom
      virtual-scroll
      dense
    />
  </q-card>
</template>
<script setup>
import { useInvoiceStore } from "src/stores/invoice";
const columns = [
  {
    name: "name",
    label: "Nome",
    field: "service",
    align: "left",
    format: (val) => val.name,
  },
  {
    name: "description",
    label: "Descrição",
    field: "service",
    align: "left",
    format: (val) => val.description,
  },
  {
    name: "quantity",
    label: "Qtd",
    field: "quantity",
    align: "center",
  },
  {
    name: "price",
    label: "Preco unitario",
    field: "price",
    align: "center",
  },
  {
    name: "discount",
    label: "Desconto",
    field: "discount",
    align: "center",
  },
  {
    name: "total",
    label: "Preco",
    field: "total",
    align: "center",
  },
];
const store = useInvoiceStore();
</script>
