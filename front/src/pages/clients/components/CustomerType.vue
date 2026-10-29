<template>
  <q-select
    v-model="type"
    :options="options"
    label="Tipo de cliente"
    map-options
    emit-value
    standout="bg-teal text-white"
    @update:model-value="$emit('fetch')"
  />
</template>
<script setup>
const emit = defineEmits(["fetch"]);
const type = defineModel();
const options = [
  {
    label: "Normal",
    value: "normal",
  },
  {
    label: "Protocolos",
    value: "protocol",
  },
  {
    label: "Seguro interno",
    value: "internInsurance",
  },
  {
    label: "Seguro externo",
    value: "externalInsurance",
  },
];
</script>
