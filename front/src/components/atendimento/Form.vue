<template>
  <div>
    <customer v-model:customer="store.form.customerId" />
    <div class="q-py-md column fit justify-between">
      <div>
        <div v-if="step == 1" class="row q-col-gutter-md">
          <div
            v-for="option in options"
            :key="option.value"
            @click="
              () => {
                currentOption = option.value;
                step = 2;
              }
            "
            class="col-3"
          >
            <div class="card-consultation flex flex-center">
              {{ option.label }}
            </div>
          </div>
        </div>
        <q-slide-transition>
          <div v-if="step == 2 && currentOption == 'consultation'">
            <consultation-cards @back="step = 1" />
          </div>
        </q-slide-transition>
        <q-slide-transition>
          <div v-if="step == 2 && currentOption == 'exam'">
            <exam-cards
              v-model:selected="store.form.requestExams"
              @back="step = 1"
            />
          </div>
        </q-slide-transition>
      </div>
    </div>
    <div style="position: absolute; left: 16px; bottom: 16px">
      <q-btn
        color="primary"
        icon="las la-save"
        label="Solicitar serviço"
        @click="onClick"
        :loading="store.loading"
      />
    </div>
  </div>
</template>
<script setup>
import { useAttendingStore } from "src/stores/attending";
import customer from "../create-document/customer.vue";
import ConsultationCards from "./ConsultationCards.vue";
const confirm = ref(false);
import ExamCards from "./ExamCards.vue";
import { ref, watch } from "vue";
const currentOption = ref(null);
const step = ref(1);

watch(step, (current) => {
  if (current == 1) {
    store.onReset();
  }
});
const store = useAttendingStore();
const options = [
  {
    label: "Consulta",
    value: "consultation",
  },
  {
    label: "Exame",
    value: "exam",
  },
];

const emits = defineEmits(["finished"]);
const onClick = async (stage) => {
  const { success } = await store.create({
    customerId: store.form.customerId.id || store.form.customerId,
    consultationId: store.form.consultationId,
    stage: store.form.consultationId ? "SCREENING" : "EXAM",
    requestExams: store.form.requestExams,
  });
  success && emits("finished");
};
</script>
<style lang="scss">
.card-consultation {
  height: 180px;
  background-color: $teal-8;
  color: aliceblue;
  font-size: 28pt;
  cursor: pointer;
}
</style>
