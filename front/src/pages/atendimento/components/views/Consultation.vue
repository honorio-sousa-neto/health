<template>
  <div>
    <div>
      <div class="text-h6">{{ consultation.consultation.name }}</div>
      <div class="text-caption">
        {{ consultation.consultation.description }}
      </div>
    </div>
    <div class="q-mt-md q-gutter-sm">
      <div class="text-bold text-teal-8">Motivo da consulta</div>
      <div class="q-ml-lg">
        <span>
          {{ consultation.reasonOfConsultation }}
        </span>
      </div>
      <div class="text-bold text-teal-8">História clínica</div>
      <div class="q-ml-lg">
        {{ consultation.historyClinic.value }}
      </div>
      <div class="text-bold text-teal-8">
        Dados positivos quanto ao exame físico
      </div>
      <div class="q-ml-lg">
        {{ consultation.byExamPhysics }}
      </div>
      <div class="text-bold text-teal-8">
        Dados positivos quanto ao interrogatório
      </div>
      <div class="q-ml-lg">
        {{ consultation.byQuestioning }}
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  consultation: {
    type: Object,
    default: {
      consultation: {
        name: null,
        area: null,
        description: null,
      },
      physicsExam: null,
      requests: [],
      doctor: {
        name: null,
      },
      symptoms: [],
      historyClinic: {},
    },
  },
  exams: [],
});
</script>
