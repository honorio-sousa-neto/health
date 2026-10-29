<template></template>
<script setup>
import { useCompanyStore } from "src/stores/company";
import { onMounted } from "vue";

const store = useCompanyStore();

onMounted(async () => {
  await store.show();
});
</script>
