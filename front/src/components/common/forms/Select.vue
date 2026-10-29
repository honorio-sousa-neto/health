<template>
  <q-select
    v-model="model"
    :options
    :label
    standout="bg-teal text-white"
    filled
    emit-value
    map-options
  />
</template>
<script setup>
const model = defineModel();
defineProps({
  options: {
    type: Array,
    default: [],
  },
  label: {
    type: String,
    default: "Label",
  },
});
</script>
