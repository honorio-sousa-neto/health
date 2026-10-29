<template>
  <q-select
    v-model="document"
    :options="documents"
    label="Categoria"
    emit-value
    map-options
    standout="bg-teal-8 text-white"
    dense
    @update:model-value="onUpdate"
  />
</template>
<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const document = defineModel("document");

const emits = defineEmits(["fetchData"]);
const documents = computed(() => {
  let defaultItems = [
    {
      label: "Factura",
      value: "FT",
    },
    {
      label: "Factura-Recibo",
      value: "FR",
    },
    {
      label: "Proforma",
      value: "PP",
    },
  ];

  defaultItems = defaultItems.concat([
    {
      label: "Recibo",
      value: "RC",
    },
    {
      label: "Nota de crédito",
      value: "NC",
    },
    {
      label: "Nota de dédito",
      value: "ND",
    },
  ]);

  return defaultItems;
});

const onUpdate = (val) => {
  router.push({ query: { category: val } });
  emits("fetchData");
};
</script>
