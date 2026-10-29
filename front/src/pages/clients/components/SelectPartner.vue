<template>
  <q-select
    v-model="partner"
    :loading
    :options="data"
    map-options
    emit-value
    option-label="name"
    option-value="id"
    label="Parceiro"
    borderless
    class="fi"
  />
</template>

<script setup>
import { useCommom } from "src/composables/commom";
const { data, loading } = useCommom("partners");
const partner = defineModel("partner");
</script>

