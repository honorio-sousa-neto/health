<template>
  <Breadcrumbs>
    <template #children>
      <q-breadcrumbs-el
        label="Exames"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{ name: 'criar-exame' }"
      />
    </template>
  </Breadcrumbs>

  <div class="q-pa-md">
    <FormExam />
  </div>
</template>
<script setup>
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import Form from "./components/Form.vue";
import FormExam from "./components/FormExam.vue";
import List from "./components/List.vue";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useExamsStore } from "src/stores/exams";

const confirm = ref(false);
const store = useExamsStore();
const route = useRoute();
const fetchData = async () => {
  try {
    const { success } = await store.show(route.params.id);
  } catch (error) {}
};

watch(confirm, async (current) => {
  if (current) {
    await store.show(route.params.examId);
  }
});

onMounted(() => {
  fetchData();
});
</script>
