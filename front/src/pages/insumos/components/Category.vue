<template>
  <div class="row q-gutter-md">
    <div class="col">
      <q-select
        v-model="category"
        :options="store.data"
        label="Selecione uma categoria"
        map-options
        emit-value
        option-label="name"
        option-value="id"
        standout="bg-teal-8 text-white"
        :rules="[required]"
        lazy-rules
      />
    </div>
    <div class="col">
      <q-select
        v-model="subcategory"
        :options="store.currentCategory.subCategories"
        label="Subcategorias"
        map-options
        emit-value
        option-label="name"
        option-value="id"
        standout="bg-teal-8 text-white"
        :rules="[required]"
        lazy-rules
      />
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import { useCategoryStore } from "src/stores/category";
import { required } from "src/utils/validation";
const store = useCategoryStore();
const subcategory = defineModel("category");
const isPharma = defineModel("isPharma", { default: false });
const props = defineProps({
  currentCategory: {
    type: String,
  },
});

const category = ref(null);
const fetchCategories = async (id) => {
  if (id) {
    const response = await store.show(id);
  }
};

onMounted(async () => {
  await store.index();
});

watch(category, (current) => {
  console.log(store.data.find((item) => item.id == current));
  fetchCategories(current);
  if (
    store.data.find((item) => item.id == current).name.toLowerCase() ==
    "farmácia"
  ) {
    isPharma.value = true;
  } else {
    isPharma.value = false;
  }
});

watch(
  () => props.currentCategory,
  (current) => {
    category.value = current;
  }
);
</script>
