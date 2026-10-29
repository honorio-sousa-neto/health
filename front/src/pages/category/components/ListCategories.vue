<template>
  <div class="row justify-between items-center">
    <div class="text-h6">Subcategorias</div>
    <q-btn
      icon="add"
      color="primary"
      @click="addSubCategory = !addSubCategory"
      dense
      round
    />
  </div>
  <q-slide-transition>
    <div v-show="addSubCategory">
      <div class="q-pa-md">
        <Form @create="onSubmit" />
      </div>
    </div>
  </q-slide-transition>
  <div v-if="store.currentCategory.subCategories.length > 0" class="q-mt-md">
    <Item
      v-for="item in store.currentCategory.subCategories"
      :key="item.id"
      :item="item"
    />
  </div>
  <div v-else>
    <div class="text-caption">Nenhuma subcategoria encontrada</div>
  </div>
</template>
<script setup>
import { useCategoryStore } from "src/stores/category";
import { onMounted, ref } from "vue";
import Item from "./Item.vue";
import Form from "./Form.vue";
const store = useCategoryStore();
const addSubCategory = ref(false);
const props = defineProps({
  categoryId: {
    type: String,
    required: true,
  },
});

const fetchData = async () => {
  await store.show(props.categoryId);
};
const onSubmit = async (data) => {
  await store.create({ name: data.name, categoryId: props.categoryId });
  addSubCategory.value = false;
};
onMounted(() => {
  fetchData();
});
</script>
