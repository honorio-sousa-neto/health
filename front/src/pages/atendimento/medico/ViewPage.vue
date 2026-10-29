<template>
  <div class="q-px-md" v-if="store.currentAttending.customer.name">
    <Screening
      :screening="store.currentAttending.screening"
      :customer="store.currentAttending.customer"
    />
    <Consultation :consultation="store.currentAttending.consultation" />
    <div>
      <div class="text-bold text-teal-8">Resultado dos exames solicitados</div>
    </div>
    <div class="row q-ml-lg">
      <div class="col" v-for="exam in store.currentAttending.exams">
        <Exams :data="exam.result" />
      </div>
    </div>
    <div>
      <div class="text-bold text-teal-8">Diagnóstico</div>
    </div>
    <div class="row q-ml-lg q-mb-xl">
      {{ storeConsultation.currentData.diagnosis }}
    </div>
  </div>
  <q-inner-loading :showing="store.loading">
    <q-spinner-gears size="50px" color="primary" />
  </q-inner-loading>
</template>
<script setup>
import { useAttendingStore } from "src/stores/attending";
import Exams from "../components/views/Exams.vue";
import Screening from "../components/views/Screening.vue";
import Consultation from "../components/views/Consultation.vue";
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useConsultationAttendingStore } from "src/stores/consultation-attending";

const store = useAttendingStore();
const route = useRoute();
const router = useRouter();
const storeConsultation = useConsultationAttendingStore();
const fetchData = async () => {
  try {
    await storeConsultation.show(route.params.id);
    await store.show(storeConsultation.currentData.attending.id);
  } catch (error) {}
};

const onSubmit = async () => {
  try {
    const { success } = await storeConsultation.update(
      {
        stage: "CONCLUDE",
        status: "COMPLETED",
        diagnosis: storeConsultation.form.diagnosis,
      },
      store.currentAttending.consultation.id
    );

    if (success) router.push({ name: "medico-lista-resultado-exames" });
  } catch (error) {
    console.log(error.message);
  }
};

onMounted(() => {
  fetchData();
});
</script>
