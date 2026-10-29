<template>
  <div class="q-px-md">
    <div class="text-h6">
      {{ store.currentExam?.attending?.customer?.name }}
    </div>
    <div class="text-body1 text-grey-8">
      <div class="row">
        <div>Contacto:</div>
        <span class="q-ml-sm text-bold">{{
          store.currentExam?.attending?.customer?.phone
        }}</span>
      </div>
      <div class="row">
        <div>Género:</div>
        <span class="q-ml-sm text-bold">{{
          store.currentExam?.gender == "MALE" ? "MASCULINO" : "FEMININO"
        }}</span>
      </div>
      <div class="row">
        <div>Idade:</div>
        <span class="q-ml-sm text-bold">{{ store.currentExam?.age }}</span>
      </div>
      <div class="row">
        <div>Altura:</div>
        <span class="q-ml-sm text-bold"
          >{{ store.currentExam?.height }} cm</span
        >
      </div>
      <div class="row">
        <div>Peso:</div>
        <span class="q-ml-sm text-bold"
          >{{ store.currentExam?.weight }} Kg</span
        >
      </div>
    </div>
    <div class="q-mt-md text-body1 text-teal-9">
      <div class="text-h5">Sinais vitais</div>
      <div class="row">
        <div>Temperatura:</div>
        <span class="q-ml-sm text-bold"
          >{{ store.currentExam?.temperature }} (Celsius)</span
        >
      </div>
      <div class="row">
        <div>Pulso:</div>
        <span class="q-ml-sm text-bold"
          >{{ store.currentExam?.pulse }} (bpm)</span
        >
      </div>
      <div class="row">
        <div>Frequência cardíaca:</div>
        <span class="q-ml-sm text-bold"
          >{{ store.currentExam?.heartbeatRate }} (bpm)</span
        >
      </div>
      <div class="row">
        <div>Frequência respiratória:</div>
        <span class="q-ml-sm text-bold"
          >{{ store.currentExam?.breathingRate }} (rpm)</span
        >
      </div>
      <div class="row">
        <div>Pressão arterial:</div>
        <span class="q-ml-sm text-bold"
          >{{ store.currentExam?.bloodPressure }} (mmHg)</span
        >
      </div>
    </div>
  </div>
</template>
<script setup>
import { useScreeningStore } from "src/stores/screening";
import { onMounted } from "vue";
import { useRoute } from "vue-router";

const store = useScreeningStore();
const route = useRoute();
const fetchData = async () => {
  try {
    await store.show(route.params.id);
  } catch (error) {}
};

onMounted(() => {
  fetchData();
});
</script>
