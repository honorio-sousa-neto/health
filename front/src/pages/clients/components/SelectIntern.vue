<template>
  <q-select
    v-model="intern"
    :loading
    :options="data"
    map-options
    emit-value
    option-label="name"
    option-value="id"
    label="Pacote"
    standout="bg-teal-8 text-white"
  />
</template>
<script setup>
import { useCommom } from "src/composables/commom";
import { watch } from "vue";
const { data, loading } = useCommom("interns");
const intern = defineModel("intern");
const emit = defineEmits(["load"]);
watch(
  intern,
  (current) => {
    const find = data.find((item) => item.id == current);
    emit("load", find);
  },
  { deep: true, immediate: true }
);
</script>
