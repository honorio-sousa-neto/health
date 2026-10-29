<template>
  <div style="font-size: 12pt">
    <div>
      <div class="text-body1 text-uppercase q-mb-md">
        Consultório ({{
          storeAttending.currentAttending?.consultation.consultation?.name +
          " - " +
          storeAttending.currentAttending?.consultation.consultation
            ?.description
        }})
      </div>

      <div class="q-ml-md">
        <div>
          <Symptoms />
          <LabRxEco area="LAB" v-model:exams="lab" />
        </div>
        <div class="q-my-md">
          <q-btn
            color="teal-9"
            icon="las la-save"
            label="Salvar alterações"
            @click="onSubmit"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import LabRxEco from "src/components/atendimento/LabRxEco.vue";
import Symptoms from "./Symptoms.vue";
import { useRoute, useRouter } from "vue-router";
import { useConsultationAttendingStore } from "src/stores/consultation-attending";
import { useAttendingStore } from "src/stores/attending";
const store = useConsultationAttendingStore();
const route = useRoute();
const router = useRouter();
const storeAttending = useAttendingStore();
const onSubmit = async () => {
  try {
    const { success } = await store.create({
      attendingId: route.params.attendingId,
      ...store.form,
    });
    if (success) {
      router.push({ name: "medico-lista-atendimento" });
    }
  } catch (error) {}
};
</script>
