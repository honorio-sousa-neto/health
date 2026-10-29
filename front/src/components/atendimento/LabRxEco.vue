<template>
  <div class="q-mt-md">
    <div class="text-bold q-my-sm">Pedidos de exame</div>
    <q-select
      v-model="store.form.serviceType"
      dense
      outlined
      style="width: 250px"
      :options="[
        { value: 'P0', label: 'Protocolo 0' },
        { value: 'P25', label: 'Protocolo 25' },
        { value: 'P50', label: 'Protocolo 50' },
        { value: 'P75', label: 'Protocolo 75' },
        { value: 'SI', label: 'Seguro interno' },
        { value: 'SE', label: 'Seguro externo' },
        { value: 'SJK', label: 'Seguro J.Karina' },
        { value: 'CG', label: 'Clínico geral' },
        { value: 'C', label: 'Campanha' },
        { value: 'G', label: 'Ginecologia' },
        { value: 'PN', label: 'Pré-natal' },
        { value: 'O', label: 'Obstetrícia' },
        { value: 'P', label: 'Particular' },
      ]"
      label="Tipo de serviço"
      map-options
      emit-value
    />
    <exam-form-select v-model:exams="store.form.requests" />
  </div>
</template>
<script setup>
import ExamFormSelect from "./ExamFormSelect.vue";
import { useConsultationAttendingStore } from "src/stores/consultation-attending";
const store = useConsultationAttendingStore();
</script>
