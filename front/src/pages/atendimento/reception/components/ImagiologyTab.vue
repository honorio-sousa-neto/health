<template>
  <TableSelectable :rows="data" v-model:selected="selected" />
</template>
<script setup>
import TableSelectable from "./TableSelectable.vue";
import { useCommom } from "src/composables/commom";
const selected = defineModel("selected");

const { data } = useCommom("imagiologies");
</script>
