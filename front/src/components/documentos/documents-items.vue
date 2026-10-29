<template>
  <div>
    <q-table
      title="Itens da Factura"
      :rows="produtos"
      :columns="columns"
      row-key="name"
      flat
      dense
    >
      <template v-slot:top>
        <div class="column full-width">
          <div class="text-h6 q-mb-md">Itens da Factura</div>
          <div class="row justify-between">
            <div class="row items-center q-mb-md">
              <q-btn
                color="primary"
                round
                icon="add"
                outline
                size="sm"
                @click="$emit('openDialog')"
              />
              <div class="q-ml-md">Adicionar</div>
            </div>
            <div class="text-body1">
              Total a pagar:
              <span class="text-bold">
                {{
                  new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "AOA",
                  }).format(total)
                }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </q-table>
  </div>
</template>
<script setup>
import { computed, ref } from "vue";
const props = defineProps(["produtos", "total", "protocol"]);
defineEmits(["openDialog"]);
const columns = [
  {
    name: "title",
    field: "item",
    label: "Produto / serviço",
    align: "left",
  },
  {
    name: "decription",
    field: "description",
    label: "Descrição",
    align: "left",
  },
  {
    name: "unit_price",
    field: "unit_price",
    label: "Preço unitário",
    align: "left",
    format: (val, row) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(val),
  },
  {
    name: "quantity",
    field: "quantity",
    label: "Quantidade",
    align: "left",
  },
  {
    name: "discount",
    field: "discount",
    label: "Desconto",
    align: "left",
    format: (val, row) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(row?.discount * row.quantity),
  },
  {
    name: "total",
    field: "total",
    label: "Total",
    align: "left",
    format: (val, row) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(row?.quantity * row?.total),
  },
];
const loading = ref(false);
</script>
