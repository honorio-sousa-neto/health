<template>
  <q-card flat class="q-my-md">
    <div class="text-h5">{{ store.currentProtocol.name }}</div>
    <div class="text-grey-7">{{ store.currentProtocol.value }}</div>
  </q-card>
</template>
<script setup>
import { useProtocolStore } from "src/stores/protocol";

const store = useProtocolStore();
</script>
