<template>
  <div class="q-px-md">
    <div class="row justify-between q-gutter-md q-pb-md">
      <div>
        <div class="text-h6 text-weight-regular">Relatório Médico Diário</div>
        <div class="text-grey-8">
          Aqui estão as actualizações dos últimos 7 dias
        </div>
      </div>
      <div class="row items-center q-gutter-md">
        <q-input square outlined v-model="date" dense type="date" label="Dia" />
        <q-btn
          color="red-8"
          icon="las la-file-pdf"
          label="Baixar PDF"
          @click="onClick"
        />
      </div>
    </div>
    <div class="row q-col-gutter-md">
      <div class="col-3 q-gutter-sm">
        <Attendance />
        <Graph></Graph>
      </div>
      <div class="col-4 q-gutter-sm">
        <Laboratory />
        <GraphLaboratory />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import Attendance from "./graphs/Attendance.vue";
import Graph from "./graphs/Graph.vue";
import GraphLaboratory from "./graphs/lab/GraphLaboratory.vue";
import Laboratory from "./graphs/lab/Laboratory.vue";
const date = ref(new Date().toISOString().slice(0, 10));
</script>
