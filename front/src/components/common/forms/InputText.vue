<template>
  <q-input
    v-model="value"
    standout="bg-teal-8 text-white"
    type="text"
    :dense
    :label
  />
</template>
<script setup>
const value = defineModel("value");
defineProps({
  label: {
    type: String,
    default: "Label",
  },
  dense: {
    type: Boolean,
    default: false,
  },
});
</script>
