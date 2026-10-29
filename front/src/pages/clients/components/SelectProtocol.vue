<template>
  <q-select
    v-model="protocol"
    :loading
    :options="data"
    map-options
    emit-value
    option-label="name"
    option-value="id"
    label="Protocolo"
    borderless
    class="fi"
  />
</template>

<script setup>
import { useCommom } from "src/composables/commom";
const { data, loading } = useCommom("protocols");
const protocol = defineModel("protocol");
</script>

