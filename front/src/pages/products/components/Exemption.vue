<template>
  <q-select
    v-model="exemptionId"
    label="Motivo de isenção"
    standout="bg-teal-8 text-white"
    :options="data"
    option-value="id"
    :option-label="(val) => `${val.code} - ${val.description}`"
    map-options
    emit-value
    :loading
  />
</template>
<script setup>
import { useCommom } from "src/composables/commom";

const { loading, data } = useCommom("exemptions");

const exemptionId = defineModel("exemption");
</script>
