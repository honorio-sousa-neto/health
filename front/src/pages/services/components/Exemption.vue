<template>
  <q-select
    v-model="exemptionId"
    label="Motivo de isenção"
    class="fi"
    borderless
    popup-content-class="fi-popup"
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
