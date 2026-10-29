<template>
  <div>
    <div class="q-ml-xl">
      <OptionsGroup v-model:selected="selected" :rows="options" />
    </div>
  </div>
</template>
<script setup>
import { usePackage } from "src/composables/package";
import OptionsGroup from "./OptionsGroup.vue";
import { watch, onMounted } from "vue";
const { fetchData, options, selected } = usePackage("FAR");

const services = defineModel("services");

watch(selected, (newest) => {
  if (newest.length) services.value = newest.map((item) => item.id);
});

onMounted(() => {
  fetchData("FAR");
});
</script>
