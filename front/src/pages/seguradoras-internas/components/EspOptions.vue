<template>
  <div>
    <q-checkbox
      v-model="store.form.esp"
      @update:model-value="fetchData('ESP')"
      label="Especialidade"
    />
    <q-slide-transition>
      <div class="q-ml-xl" v-show="store.form.esp">
        <OptionsGroup v-model:selected="selected" :rows="options" />
      </div>
    </q-slide-transition>
  </div>
</template>
<script setup>
import { usePackage } from "src/composables/package";
import { useInternStore } from "src/stores/intern";
import OptionsGroup from "./OptionsGroup.vue";
import { watch } from "vue";
const store = useInternStore();
const { fetchData, options, selectAll, selectAllFunction, selected } =
  usePackage("ESP");

const services = defineModel("services");

watch(selected, (newest) => {
  if (newest.length) services.value = newest.map((item) => item.id);
});
</script>
