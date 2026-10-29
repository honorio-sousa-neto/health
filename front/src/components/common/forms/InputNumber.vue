<template>
  <q-input
    v-model.number="value"
    standout="bg-teal text-white"
    type="number"
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
<style>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
