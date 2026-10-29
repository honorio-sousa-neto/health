<template>
  <div>
    <div class="text-bold q-ml-sm">Motivo da consulta</div>
    <div class="q-ml-md q-mb-sm">{{ form.reasonOfConsultation }}</div>

    <div class="text-bold q-ml-sm">História clínica</div>
    <div class="q-ml-md q-mb-sm">{{ form.historyClinic.value }}</div>

    <div class="text-bold q-ml-sm">Dados positivos quanto ao exame físico</div>
    <div class="q-ml-md q-mb-sm">{{ form.byExamPhysics }}</div>

    <div class="text-bold q-ml-sm">
      Dados positivos quanto ao interrogatório
    </div>
    <div class="q-ml-md q-mb-sm">{{ form.byQuestioning }}</div>
  </div>
</template>
<script setup>
import { SessionStorage } from "quasar";
import { api } from "src/boot/axios";
import { onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
const user = SessionStorage.getItem("alfavida_user");
let form = reactive({
  historyClinic: {
    value: null,
  },
  reasonOfConsultation: null,
  byExamPhysics: null,
  byQuestioning: null,
  doctorId: user.id,
  status: "InProgress",
});
const route = useRoute();

const fetchData = async () => {
  const { data } = await api.get(
    `medical-consultations/${route.params.consultationId}`
  );
  Object.assign(form, data.data);
};

onMounted(() => {
  fetchData();
});
</script>
