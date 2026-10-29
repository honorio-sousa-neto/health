<template>
  <div class="q-px-md">
    <div class="row q-gutter-md">
      <div class="text-h6">{{ store.currentExam.name }}</div>
      <div>
        <q-btn
          color="grey"
          icon="las  la-pen"
          round
          dense
          size="sm"
          flat
          @click="confirm = !confirm"
        />
      </div>
    </div>
    <div class="text-grey-6">
      Última actualização:
      <!-- {{
        new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
        }).format(new Date(store?.currentExam?.updatedAt))
      }} -->
    </div>
    <div class="q-my-md"></div>
  </div>

  <q-dialog v-model="confirm">
    <q-card style="width: 1020px; max-width: 80vw">
      <q-card-section>
        <div class="row justify-end">
          <q-btn color="grey" icon="close" round dense v-close-popup flat />
        </div>
        <FormExam />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
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
    const { success } = await store.show(route.params.examId);
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
