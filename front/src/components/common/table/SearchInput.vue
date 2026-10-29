<template>
  <q-input
    standout="bg-primary text-white"
    v-model="search"
    type="text"
    label="Pesquisa..."
    dense
  >
    <template #append>
      <q-icon name="las la-search" />
    </template>
  </q-input>
</template>
<script setup>
import { watch } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

const search = defineModel("search");
const emits = defineEmits(["fetch"]);

watch(search, (oldValue, newValue) => {
  router.push({
    query: {
      search: search.value,
    },
  });
  emits("fetch");
});
</script>
