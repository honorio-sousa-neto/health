<template>
  <div>
    <q-checkbox
      v-model="store.form.lab"
      @update:model-value="fetchData('LAB')"
      label="Laboratório"
    />
    <q-slide-transition>
      <div class="q-pl-xl" v-show="store.form.lab">
        <OptionsGroup v-model:selected="selected" :rows="options" />
      </div>
    </q-slide-transition>
  </div>
</template>
<script setup>
import { useInternStore } from "src/stores/intern";
import OptionsGroup from "./OptionsGroup.vue";
import { usePackage } from "src/composables/package";
import { watch } from "vue";
const store = useInternStore();
const { fetchData, options, selectAll, selectAllFunction, selected } =
  usePackage("LAB");

const services = defineModel("services");

watch(selected, (newest) => {
  if (newest.length) services.value = newest.map((item) => item.id);
});
</script>
