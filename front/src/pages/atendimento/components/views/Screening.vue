<template>
  <div
    style="
      position: sticky;
      top: 60px;
      left: 0;
      right: 0;
      z-index: 99;
      background-color: white;
    "
  >
    <div class="text-h6">
      {{ customer.name }}
    </div>
    <div class="">
      <div>
        Contacto: <span class="text-bold">{{ customer.phone }}</span>
      </div>
      <div>
        Endereço: <span class="text-bold">{{ customer.address }}</span>
      </div>
      <div v-if="screening?.age">
        <div>
          Idade: <span class="text-bold">{{ screening?.age || " - " }}</span>
        </div>
        <div>
          Altura:
          <span class="text-bold">{{ screening?.height || " - " }} cm</span>
        </div>
        <div>
          Peso:
          <span class="text-bold">{{ screening?.weight || " - " }} kg</span>
        </div>

        <div class="text-bold text-teal-8 q-mt-md">Sinais vitais</div>
        <div>
          Temperatura:
          <span class="text-bold"
            >{{ screening?.temperature || " - " }} ºC</span
          >
        </div>
        <div>
          Pulso:
          <span class="text-bold">{{ screening?.pulse || " - " }} bpm</span>
        </div>
        <div>
          Frequência cardíaca:
          <span class="text-bold"
            >{{ screening?.heartbeatRate || " - " }} bpm</span
          >
        </div>
        <div>
          Frequência respiratória:
          <span class="text-bold"
            >{{ screening?.breathingRate || " - " }} rpm</span
          >
        </div>
        <div>
          Pressão arterial:
          <span class="text-bold"
            >{{ screening?.bloodPressure || " - " }} mmHg</span
          >
        </div>
      </div>
    </div>
    <q-separator spaced />
  </div>
</template>
<script setup>
defineProps({
  customer: {
    type: Object,
    default: {
      name: null,
      phone: null,
      address: null,
    },
  },
  screening: {
    type: Object,
    default: {
      age: null,
      height: null,
      weight: null,
    },
  },
});
</script>
