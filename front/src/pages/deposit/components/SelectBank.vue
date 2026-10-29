<template>
  <q-select
    v-model="bank"
    :options="data"
    option-label="name"
    option-value="id"
    map-options
    emit-value
    label="Banco"
    standout="bg-teal-8 text-white"
    :loading
  />
</template>
<script setup>
import { useCommom } from "src/composables/commom";
const { loading, data } = useCommom("banks");
const bank = defineModel("bank");
</script>
