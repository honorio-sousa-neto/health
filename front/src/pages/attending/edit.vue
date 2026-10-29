<template>
  <q-card v-if="store.currentAttendance.customer" flat class="my-card">
    <q-card-section
      style="position: sticky; top: 56px; z-index: 7"
      class="row justify-between bg-white"
    >
      <div>
        <div class="text-h6">{{ store.currentAttendance.customer.name }}</div>
        <div class="text-caption">
          Hora de chegada:
          {{
            new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            }).format(new Date(store.currentAttendance.createdAt))
          }}
        </div>
      </div>
    </q-card-section>
    <q-card-section class="q-pt-none q-gutter-md">
      <q-slide-transition>
        <div class="row justify-between q-gutter-sm">
          <div class="col">
            <DemographicInfo />
          </div>
          <div class="col">
            <VitalSigns />
          </div>
        </div>
      </q-slide-transition>
      <div v-if="user.role == 'doctor'">
        <Symptoms />
        <Exams :observation="store.currentAttendance.observation" />
      </div>
      <div v-if="user.role == 'nurse'" class="row justify-end">
        <q-btn
          color="teal-7"
          icon-right="las la-stethoscope"
          label="Remeter ao médico"
          @click="onSubmit('DOCTOR_ONE')"
          :loading="store.loadings.loadingCreate"
        />
      </div>
    </q-card-section>
  </q-card>
  <q-inner-loading :showing="store.loadings.loadingOne">
    <q-spinner-gears size="50px" color="teal-8" />
  </q-inner-loading>
</template>
<script setup>
import DemographicInfo from "src/components/atendimento/DemographicInfo.vue";
import VitalSigns from "src/components/atendimento/VitalSigns.vue";
import Symptoms from "src/components/atendimento/Symptoms.vue";
import Exams from "src/components/atendimento/Exams.vue";
import { useAttendingStore } from "src/stores/attending";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import { SessionStorage } from "quasar";
const store = useAttendingStore();
const route = useRoute();
const user = SessionStorage.getItem("alfavida_user");

const seeScreening = ref(user.role !== "doctor");

const onSubmit = async (stage) => {
  try {
    await store.update({ stage }, route.params.id);
  } catch (error) {}
};
onMounted(() => {
  store.show(route.params.id);
});
</script>
