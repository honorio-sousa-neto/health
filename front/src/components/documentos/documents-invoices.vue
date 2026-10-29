<template>
  <div>
    <q-table
      flat
      title="Facturas a liquidar"
      :rows="rows"
      :columns="columns"
      row-key="reference"
      selection="single"
      v-model:selected="invoice"
    >
      <template v-slot:top-right>
        <div class="row full-width justify-between q-mx-md">
          <div>
            Total a pagar:
            <span>{{
              new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "AOA",
              }).format(total)
            }}</span>
          </div>
        </div>
      </template>
    </q-table>
  </div>
</template>
<script setup>
import { computed } from "vue";

defineProps({
  rows: {
    type: Array,
    default: [],
  },
  // total: {
  //   type: Number,
  // },
});
const invoice = defineModel("invoice", { default: [] });
const columns = [
  {
    name: "client",
    field: (row) => row.client.name,
    align: "center",
    label: "Cliente",
  },
  {
    name: "reference",
    field: "reference",
    align: "center",
    label: "Referência",
  },
  {
    name: "emission_date",
    field: "emission_date",
    align: "left",
    label: "Data de emissão",
  },
  {
    name: "total",
    field: "total",
    align: "right",
    label: "Preço",
    format: (val) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(val),
  },
];
const total = computed(() => {
  return invoice.value[0]?.total || 0;
});
</script>
