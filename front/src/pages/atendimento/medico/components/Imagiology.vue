<template>
  <div class="row q-col-gutter-md">
    <q-checkbox
      class="col-6"
      v-for="imagiology in options"
      v-model="imagiology.selected"
      :label="`${imagiology.name} -- ${imagiology.description}`"
    />
  </div>
</template>
<script setup>
import { api } from "src/boot/axios";
import { computed, onMounted, reactive } from "vue";

let options = reactive([]);
const fetchData = async () => {
  const { data } = await api.get("imagiologies");
  const result = data.data.map((item) => ({ selected: false, ...item }));
  Object.assign(options, result);
};

onMounted(() => {
  fetchData();
});
</script>
