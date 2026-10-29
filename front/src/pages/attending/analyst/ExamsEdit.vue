<template>
  <q-card class="q-mt-md" bordered flat square>
    <div class="q-pa-sm bg-teal-8 text-white">Exames requeridos</div>
    <div class="q-px-md" v-if="justRead">
      <div v-for="exam in exams">
        <div class="text-h6">
          {{ exam.service.name }}
          {{ exam.service.description ? ` (${exam.service.description})` : "" }}
        </div>
        <div>
          Resultado: <span class="text-bold">{{ exam.result }}</span>
        </div>
        <div>
          Notas: <span class="text-bold">{{ exam.notes }}</span>
        </div>
      </div>
    </div>
    <div v-else class="q-px-md q-pb-md">
      <div v-for="exam in form" :key="exam.id">
        <div class="row justify-between items-center q-gutter-md q-my-xs">
          <div class="col">
            {{ exam.service.name }}
            {{
              exam.service.description ? ` (${exam.service.description})` : ""
            }}
          </div>
          <div class="col">
            <q-input
              outlined
              dense
              v-model="exam.result"
              type="text"
              label="Resultado"
            />
          </div>
          <div class="col">
            <q-input
              outlined
              dense
              v-model="exam.notes"
              type="text"
              label="Nota"
            />
          </div>
        </div>
      </div>
      <q-btn
        color="primary"
        icon="las la-save"
        label="Enviar resultado ao médico"
        @click="onClick"
      />
    </div>
  </q-card>
</template>
<script setup>
import { useAttendingStore } from "src/stores/attending";
import { reactive } from "vue";
import { useRoute } from "vue-router";
const store = useAttendingStore();
const props = defineProps({
  exams: {
    type: Array,
    defauult: [],
  },
  justRead: {
    type: Boolean,
    default: false,
  },
});

const form = reactive([...props.exams]);
const route = useRoute();
const onClick = async () => {
  let payload = [];

  for (const item of form) {
    console.log(item);
    payload.push({
      id: item.id,
      notes: item.notes,
      result: item.result,
    });
  }
  const { success } = await store.updateExamsAttending(
    payload,
    route.params.id
  );

  if (success) {
    await store.update({ stage: "DOCTOR_TWO" }, route.params.id);
  }
};
</script>
