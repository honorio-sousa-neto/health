<template>
  <div>
    <q-checkbox
      v-model="store.form.enf"
      @update:model-value="fetchData('ENF')"
      label="Clínica geral"
    />

    <q-slide-transition>
      <div class="q-pl-xl" v-show="store.form.enf">
        <OptionsGroup v-model:selected="selected" :rows="options" />
      </div>
    </q-slide-transition>
  </div>
</template>
<script setup>
import { usePackage } from "src/composables/package";
import OptionsGroup from "./OptionsGroup.vue";
import { useInternStore } from "src/stores/intern";
import { watch } from "vue";
const store = useInternStore();
const { fetchData, options, selectAll, selectAllFunction, selected } =
  usePackage("ENF");
const services = defineModel("services");

watch(selected, (newest) => {
  if (newest.length) services.value = newest.map((item) => item.id);
});
</script>
