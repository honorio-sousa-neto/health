<template>
  <div>
    <div class="text-bold">Altura</div>
    <div class="q-mb-xs text-teal">{{ (height / 100).toFixed(2) }}m</div>
    <div class="text-bold">Peso</div>
    <div class="q-mb-xs text-teal">{{ weight }} Kg</div>
    <div class="text-bold">Fuma</div>
    <div class="q-mb-xs text-teal">{{ isSmoker ? "Sim" : "Não" }}</div>
    <div class="text-bold">Consome bebidas alcoólicas</div>
    <div class="q-mb-xs text-teal">{{ isDrinker ? "Sim" : "Não" }}</div>

    <div class="text-bold">Doente crónico</div>
    <div class="q-mb-xs text-teal">{{ isChronicPatient ? "Sim" : "Não" }}</div>
    <div class="q-mb-xs text-teal">{{ chronicIll ?? "" }}</div>

    <div class="text-bold">Temperatura</div>
    <div class="q-mb-xs text-teal">{{ scores[fever] }}</div>

    <div class="text-bold">Pressão arterial</div>
    <div class="q-mb-xs text-teal">
      {{ scores[bloodPressure] || "Desconhecido" }}
    </div>
    <div class="text-bold">Frequência cardíaca</div>
    <div class="q-mb-xs text-teal">
      {{ scores[heartbeatRate] || "Desconhecido" }}
    </div>
    <div class="text-bold">Oxigênio</div>
    <div class="q-mb-xs text-teal">{{ scores[oxygen] || "Desconhecido" }}</div>
  </div>
</template>
<script setup>
const scores = {
  GREEN: "BOA",
  ORANGE: "MAL",
  RED: "GRAVE",
};
defineProps({
  age: {
    type: String,
  },
  height: {
    type: String,
  },
  weight: {
    type: String,
  },
  fever: {
    type: String,
  },
  pulse: {
    type: String,
  },
  breathingRate: {
    type: String,
  },
  heartbeatRate: {
    type: String,
  },
  bloodPressure: {
    type: String,
  },
  oxygen: {
    type: String,
  },
  isDrinker: {
    type: Boolean,
  },
  isSmoker: {
    type: Boolean,
  },
  isChronicPatient: {
    type: Boolean,
  },
  chronicIll: {
    type: String,
  },
});
</script>
