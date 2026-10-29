<template>
  <div>
    <div v-for="category in categories" :key="category.id">
      <div class="text-bold text-uppercase text-subtitle1">
        {{ category.name }}
      </div>
      <div
        class="q-ml-sm"
        v-for="subCategory in category.subCategories"
        :key="subCategory.id"
      >
        <div>
          <div class="row">
            <q-checkbox v-model="services" :val="subCategory.id" />
            <div class="q-ml-sm row q-gutter-sm">
              <div>
                <div class="text-bold">{{ subCategory.name }}</div>
                <div class="text-caption">
                  {{ subCategory.Service.map((s) => s.name).join(", ") }}
                </div>
              </div>
              <InputNumber
                v-if="subCategory.name.includes('Internamento')"
                v-model="internTax"
                dense
                label="Taxa de comparticipação no internamento"
                class="col"
              />
            </div>
          </div>
        </div>
      </div>
      <InputNumber
        v-if="category.name.includes('Laboratório')"
        v-model="examBoundary"
        dense
        label="Preço limite dos exames"
        class="col"
      />
    </div>
  </div>
</template>
<script setup>
import { api } from "src/boot/axios";
import InputNumber from "src/components/common/forms/InputNumber.vue";
import { onMounted, ref } from "vue";
const services = defineModel("services");
const internTax = defineModel("internTax");
const examBoundary = defineModel("examBoundary");
const categories = ref([]);
const fetchCategories = async () => {
  const { data } = await api.get("categories");
  console.log(data);
  categories.value = data.data;
};

onMounted(() => {
  fetchCategories();
});
</script>
