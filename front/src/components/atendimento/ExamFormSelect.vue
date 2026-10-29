<template>
  <div class="row q-mt-md q-col-gutter-md">
    <div v-for="section in store.data" class="col-6">
      <div class="text-body1 text-bold">
        {{ section.name }}
      </div>
      <div class="q-pl-md">
        <div v-for="exam in section.exams">
          <q-checkbox v-model="exam.selected" :label="exam.name" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useSectionStore } from "src/stores/section";
import { SessionStorage } from "quasar";
const user = SessionStorage.getItem("alfavida_user");
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";

const store = useSectionStore();
const route = useRoute();
const exams = defineModel("exams");
onMounted(async () => {
  await store.index();
});

watch(
  () => store.data,
  () => {
    let examsValue = [];
    store.data.forEach((section) => {
      section.exams.forEach((exam) => {
        if (exam.selected) {
          examsValue.push(exam.id);
        }
      });
    });
    exams.value = examsValue;
  },
  { deep: true, immediate: true }
);
</script>
