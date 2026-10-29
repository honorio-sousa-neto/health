<template>
  <div class="row q-col-gutter-md">
    <div v-for="(section, index) in sections" :key="index" class="col-6">
      <div>
        <div class="text-body2 text-uppercase text-bold">
          {{ section.name }}
        </div>
        <div class="row items-center" v-for="service in section.Service">
          <q-checkbox v-model="exams" :val="service.id" />
          <div>
            {{ service.name }}
            {{ service.description ? ` (${service.description}) ` : "" }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { api } from "src/boot/axios";
let loading = ref(false);
let sections = reactive([]);

const emit = defineEmits(["change"]);
const exams = defineModel("exams", { default: [] });
const fetchExams = async () => {
  try {
    loading.value = true;
    const { data } = await api.get("services/laboratory/list");
    sections.splice(0, sections.length, ...data.data.subCategories);
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};

onMounted(() => {
  fetchExams();
});

watch(
  () => exams,
  () => {
    emit("change");
  },
  {
    deep: true,
  }
);
</script>
