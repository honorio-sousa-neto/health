<template>
  <q-select
    v-model="categoryId"
    standout="bg-teal-8 text-white"
    :options="categoryStore.data"
    label="Categoria"
    option-value="id"
    option-label="name"
    map-options
    emit-value
    :rules="[required]"
  />
</template>
<script setup>
import { required } from "src/utils/validation";
import { onMounted } from "vue";
import { useCategoryStore } from "src/stores/category";
const categoryStore = useCategoryStore();

const categoryId = defineModel("category");

onMounted(() => {
  categoryStore.index();
});
</script>
