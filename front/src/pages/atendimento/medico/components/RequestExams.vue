<template>
  <div>
    <div class="row q-gutter-md">
      <q-btn
        color="teal-8"
        icon="las la-laptop-medical"
        label="Laboratório"
        @click="() => (tab = 'lab')"
        :outline="tab != 'lab'"
      />
      <q-btn
        color="teal-8"
        icon="las la-radiation-alt"
        label="Imagiologia"
        @click="() => (tab = 'img')"
        :outline="tab != 'img'"
      />
    </div>
    <q-tab-panels v-model="tab" animated keep-alive>
      <q-tab-panel name="lab">
        <Exams v-model="exams.data" :currentExams="currentExams" />
      </q-tab-panel>
      <q-tab-panel name="img">
        <Imagiology />
      </q-tab-panel>
    </q-tab-panels>
    <q-btn color="teal-8" label="Solicitar exame" @click="onSubmit" />
  </div>
</template>
<script setup>
import { SessionStorage } from "quasar";
import Exams from "./Exams.vue";
import Imagiology from "./Imagiology.vue";

import { api } from "src/boot/axios";
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

const user = SessionStorage.getItem("alfavida_user");
const tab = ref("lab");
const exams = reactive({
  data: [],
});

defineProps({
  currentExams: {
    type: Array,
    default: [],
  },
});

const route = useRoute();
const onSubmit = async () => {
  if (!exams.data.length) return;
  const { data } = await api.post("medical-consultations/request-exams", {
    doctorId: user.id,
    exams: exams.data,
    medicalConsultationId: route.params.consultationId,
  });
};

onMounted(() => {});
</script>
