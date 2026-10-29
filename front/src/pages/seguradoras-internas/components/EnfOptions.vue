<template>
  <div>
    <div class="q-pl-xl">
      <OptionsGroup v-model:selected="selected" :rows="options" />
    </div>
  </div>
</template>
<script setup>
import { usePackage } from "src/composables/package";
import OptionsGroup from "./OptionsGroup.vue";
import { onMounted, watch } from "vue";
const { fetchData, options, selected } = usePackage("ENF");
const services = defineModel("services");

watch(selected, (newest) => {
  if (newest.length) services.value = newest.map((item) => item.id);
});

onMounted(() => {
  fetchData("ENF");
});
</script>
