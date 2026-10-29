<template>
  <q-select
    v-model="insurance"
    :loading
    :options="data"
    map-options
    emit-value
    option-label="name"
    option-value="id"
    label="Seguradora"
    borderless
    class="fi"
  />
</template>

<script setup>
import { useCommom } from "src/composables/commom";
const { data, loading } = useCommom("insurances");
const insurance = defineModel("insurance");
</script>

