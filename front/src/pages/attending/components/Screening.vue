<template>
  <div class="q-px-md">
    <div class="q-pa-sm bg-teal-8 text-h6 text-white q-mb-sm">Triagem</div>
    <q-item dense class="row items-center">
      <div class="col-3">Altura</div>
      <div class="col">
        <q-input
          :readonly="store.form.stage != 'SCREENING'"
          v-model="store.form.height"
          dense
          borderless
          type="text"
          placeholder="Digite aqui..."
        />
      </div>
    </q-item>
    <q-item dense class="row items-center">
      <div class="col-3">Peso</div>
      <div class="col">
        <q-input
          :readonly="store.form.stage != 'SCREENING'"
          v-model="store.form.weight"
          dense
          borderless
          type="text"
          placeholder="Digite aqui..."
        />
      </div>
    </q-item>
    <q-item dense class="row items-center">
      <div class="col-3">Frequência cardíaca (bpm)</div>
      <div class="col">
        <q-input
          :readonly="store.form.stage != 'SCREENING'"
          v-model="store.form.heartbeatRate"
          dense
          borderless
          type="text"
          placeholder="Digite aqui..."
        />
      </div>
    </q-item>
    <q-item dense class="row items-center">
      <div class="col-3">Pulso (rpm)</div>
      <div class="col">
        <q-input
          :readonly="store.form.stage != 'SCREENING'"
          v-model="store.form.pulse"
          dense
          borderless
          type="text"
          placeholder="Digite aqui..."
        />
      </div>
    </q-item>
    <q-item dense class="row items-center">
      <div class="col-3">Temperatura (°C)</div>
      <div class="col">
        <q-input
          :readonly="store.form.stage != 'SCREENING'"
          v-model="store.form.temperature"
          dense
          borderless
          type="text"
          placeholder="Digite aqui..."
        />
      </div>
    </q-item>

    <q-item dense class="row items-center">
      <div class="col-3">Frequência respiratória (rpm)</div>
      <div class="col">
        <q-input
          :readonly="store.form.stage != 'SCREENING'"
          v-model="store.form.breathingRate"
          dense
          borderless
          type="text"
          placeholder="Digite aqui..."
        />
      </div>
    </q-item>
    <q-item dense class="row items-center">
      <div class="col-3">Pressão arterial (mmHg)</div>
      <div class="col">
        <q-input
          :readonly="store.form.stage != 'SCREENING'"
          v-model="store.form.bloodPressure"
          dense
          borderless
          type="text"
          placeholder="Digite aqui..."
        />
      </div>
    </q-item>
  </div>
  <div v-if="user.role == 'nurse'" class="q-pa-md">
    <q-btn
      color="teal-8"
      label="Enviar ao médico"
      @click="onSubmit"
      :disable="store.form.stage != 'SCREENING'"
    />
  </div>
</template>
<script setup>
import { SessionStorage } from "quasar";
import { useScreeningStore } from "src/stores/screening";
import { onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
const user = SessionStorage.getItem("alfavida_user");
const store = useScreeningStore();
const route = useRoute();
const onSubmit = async () => {
  try {
    const { success } = await store.create({
      attendingId: route.params.id,
      nurseId: user.id,
      ...store.form,
    });
  } catch (error) {
    console.log(error.message);
  }
};

onMounted(async () => {
  await store.show(route.params.id);
});

onUnmounted(() => {
  store.onReset();
});
</script>
