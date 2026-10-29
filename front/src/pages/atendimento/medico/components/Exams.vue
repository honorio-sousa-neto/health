<template>
  <div class="row q-col-gutter-md">
    <div v-for="section in options" class="col-6">
      <div class="text-body1 text-bold">
        {{ section.name }}
      </div>
      <div class="q-ml-md column">
        <q-checkbox
          v-for="exam in section.exams"
          v-model="exam.selected"
          :label="exam.name"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { api } from "src/boot/axios";
import { watch, onMounted, reactive } from "vue";
const props = defineProps({
  currentExams: {
    type: Array,
    default: [],
  },
});
const exams = defineModel({ default: [] });

let options = reactive([]);
const fetchData = async () => {
  const identifiers = props.currentExams.map((item) => item.examId);
  console.log(identifiers);
  const { data } = await api.get("sections");
  const result = data.data.map(({ exams, ...rest }) => ({
    exams: exams.map((exam) => ({
      ...exam,
      selected: identifiers.includes(exam.id),
    })),
    ...rest,
  }));
  Object.assign(options, result);
};
watch(
  () => props.currentExams,
  () => fetchData(),
  {
    deep: true,
    immediate: true,
  }
);
watch(
  () => options,
  (current) => {
    let data = [];
    exams.value.length = 0;
    options.forEach((item) => {
      item.exams.forEach((exam) => {
        if (exam.selected) {
          data.push(exam);
        }
      });
    });
    Object.assign(
      exams.value,
      data.map((item) => ({ examId: item.id }))
    );
  },
  { deep: true }
);

const setData = () => {};

onMounted(async () => {
  await fetchData();
});
</script>
