<template>
  <div>
    <div
      style="position: sticky; top: 140px; z-index: 5"
      class="bg-teal-6 text-white q-pa-sm row items-center justify-between"
    >
      <div>Sinais vitais</div>
      <div v-if="!justRead">
        <q-btn
          color="white"
          icon="las la-edit"
          flat
          dense
          round
          @click="isEditing = !isEditing"
        />
        <q-btn
          flat
          color="white"
          dense
          icon="las la-save"
          round
          :loading="store.loadings.loadingCreate"
          @click="saveChanges"
        >
          <q-tooltip> Guardar dados </q-tooltip>
        </q-btn>
      </div>
    </div>
    <q-slide-transition>
      <q-list v-show="isEditing" bordered>
        <q-item dense class="row items-center">
          <div class="col-6">Frequência cardíaca (bpm)</div>
          <div class="col">
            <q-input
              v-model.number="store.form.heartRate"
              dense
              borderless
              type="number"
              placeholder="Digite aqui..."
            />
          </div>
        </q-item>
        <q-item dense class="row items-center">
          <div class="col-6">Temperatura (°C)</div>
          <div class="col">
            <q-input
              v-model.number="store.form.temperature"
              dense
              borderless
              type="number"
              placeholder="Digite aqui..."
            />
          </div>
        </q-item>
        <q-item dense class="row items-center">
          <div class="col-6">Frequência respiratória (rpm)</div>
          <div class="col">
            <q-input
              v-model.number="store.form.breathingRate"
              dense
              borderless
              type="number"
              placeholder="Digite aqui..."
            />
          </div>
        </q-item>
        <q-item dense class="row items-center">
          <div class="col-6">Pressão arterial (mmHg)</div>
          <div class="col">
            <q-input
              v-model="store.form.bloodPressure"
              dense
              borderless
              type="text"
              placeholder="Digite aqui..."
            />
          </div>
        </q-item>
        <q-item dense class="row items-center">
          <div class="col-6">Saturação do oxigênio (%)</div>
          <div class="col">
            <q-input
              v-model.number="store.form.oxygenSaturation"
              dense
              borderless
              type="number"
              placeholder="Digite aqui..."
            />
          </div>
        </q-item>
      </q-list>
    </q-slide-transition>
    <q-slide-transition>
      <div v-show="!isEditing" bordered class="q-pa-md">
        <div class="text-h6 text-weight-light">
          <span class="text-bold">{{ store.form.heartRate }}</span> bpm
        </div>
        <div class="text-h6 text-weight-light">
          <span class="text-bold">{{ store.form.temperature }}</span> °C
        </div>
        <div class="text-h6 text-weight-light">
          <span class="text-bold">{{ store.form.breathingRate }}</span> rpm
        </div>
        <div class="text-h6 text-weight-light">
          <span class="text-bold">{{ store.form.bloodPressure }}</span> mmHg
        </div>
        <div class="text-h6 text-weight-light">
          <span class="text-bold">{{ store.form.oxygenSaturation }}</span> %
        </div>
      </div>
    </q-slide-transition>
  </div>
</template>
<script setup>
import { useVitalStore } from "src/stores/vital";
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
const props = defineProps({
  justRead: {
    type: Boolean,
    default: false,
  },
});
const store = useVitalStore();
const isEditing = ref(props.justRead);
const saveChanges = async () => {
  try {
    await store.create(store.form);
  } catch (error) {}
};
const route = useRoute();
onMounted(async () => {
  await store.show(route.params.id);
});

onUnmounted(() => {
  store.onReset();
});
</script>
