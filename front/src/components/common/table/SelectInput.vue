<template>
  <q-select
    v-model="category"
    :options="store.data"
    label="Área clínica"
    class="fi"
    borderless
    option-value="id"
    option-label="name"
    emit-value
    map-options
    popup-content-class="fi-popup"
  />
</template>

<script setup>
import { useCategoryStore } from "src/stores/category";
import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const store = useCategoryStore();
const router = useRouter();
const category = defineModel("category");
const emits = defineEmits(["fetch"]);

watch(category, () => {
  router.push({ query: { category: category.value } });
  emits("fetch");
});

onMounted(async () => {
  await store.index();
  if (!category.value) category.value = store.data[0]?.id;
});
</script>

