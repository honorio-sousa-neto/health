<template>
  <div>
    <div class="q-pl-xl">
      <OptionsGroup v-model:selected="selected" :rows="options" />
    </div>
  </div>
</template>
<script setup>
import { useInternStore } from "src/stores/intern";
import OptionsGroup from "./OptionsGroup.vue";
import { usePackage } from "src/composables/package";
import { onMounted, watch } from "vue";
const store = useInternStore();
const { fetchData, options, selected } = usePackage("RX");

const services = defineModel("services");

watch(selected, (newest) => {
  if (newest.length) services.value = newest.map((item) => item.id);
});

onMounted(() => {
  fetchData("RX");
});
</script>
