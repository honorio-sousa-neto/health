<template>
  <div class="q-gutter-sm">
    <q-input
      v-model="store.form.reasonOfConsultation"
      type="text"
      outlined
      dense
      label="Motivo de consulta"
    />
    <q-input
      v-model="store.form.historyClinic.value"
      type="text"
      outlined
      dense
      label="História clínica"
    />

    <q-input
      v-model="store.form.byExamPhysics"
      type="text"
      outlined
      dense
      label="Dados positivos quanto ao exame físico"
      rows="2"
    />
    <q-input
      v-model="store.form.byQuestioning"
      type="text"
      outlined
      dense
      label="Dados positivos quanto ao interrogatório"
      rows="2"
    />
  </div>
</template>
<script setup>
import { useQuasar } from "quasar";
import { useSymptomStore } from "src/stores/symptom";
import { onMounted, reactive, ref } from "vue";
import { SessionStorage } from "quasar";
const user = SessionStorage.getItem("alfavida_user");
import { useConsultationAttendingStore } from "src/stores/consultation-attending";
const storeSymtom = useSymptomStore();
const store = useConsultationAttendingStore();

onMounted(async () => {
  await storeSymtom.index();
});
const $q = useQuasar();
</script>
