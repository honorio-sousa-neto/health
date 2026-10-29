<template>
  <q-select
    v-model="observation"
    option-label="name"
    option-value="id"
    :options="options"
    label="Observação"
    emit-value
    map-options
    :rules="[required]"
    standout="bg-teal text-white"
  />
</template>
<script setup>
import { useCommom } from "src/composables/commom";
import { required } from "src/utils/validation";
import { onMounted, reactive } from "vue";
const { fetchAll } = useCommom("categories/services/index");

const observation = defineModel();
const options = reactive([]);
const fetchData = async () => {
  const data = await fetchAll();
  options.splice(0, options.length, ...data);
};
onMounted(() => {
  fetchData();
});
</script>
