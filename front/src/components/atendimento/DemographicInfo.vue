<template>
  <div>
    <div
      style="position: sticky; top: 140px; z-index: 5"
      class="bg-teal-4 text-white q-pa-sm row items-center justify-between"
    >
      <div>Informações demográficas</div>
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
          <div class="col-3">Idade</div>
          <div class="col">
            <q-input
              v-model.number="store.form.age"
              dense
              borderless
              type="number"
              placeholder="Digite aqui..."
              max="150"
              :rules="[(val) => val < 150 || 'Insira uma idade válida']"
            />
          </div>
        </q-item>
        <q-item dense class="row items-center">
          <div class="col-3">Altura (cm)</div>
          <div class="col">
            <q-input
              v-model.number="store.form.height"
              dense
              step="0.01"
              borderless
              type="number"
              max="300"
              placeholder="Digite aqui..."
              :rules="[(val) => val < 300 || 'Insira uma altura válida']"
            />
          </div>
        </q-item>
        <q-item dense class="row items-center q-mb-md">
          <div class="col-3">Género</div>
          <div class="col q-gutter-sm">
            <q-radio
              v-model="store.form.gender"
              dense
              val="MALE"
              label="Masculino"
            />
            <q-radio
              v-model="store.form.gender"
              dense
              val="FEMALE"
              label="Feminino"
            />
          </div>
        </q-item>
      </q-list>
    </q-slide-transition>
    <q-slide-transition>
      <div v-show="!isEditing" bordered class="q-pa-md">
        <div class="text-h6 text-weight-light">
          <span class="text-bold">{{ store.form.age }}</span> anos de idade
        </div>
        <div class="text-h6 text-weight-light">
          <span class="text-bold">{{ store.form.height }}</span> cm de altura
        </div>
        <div class="text-h6 text-weight-bold">
          {{ store.form.gender == "MALE" ? "Masculino" : "Feminino" }}
        </div>
      </div>
    </q-slide-transition>
  </div>
</template>
<script setup>
import { useDemographicStore } from "src/stores/demographic";
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
const props = defineProps({
  justRead: {
    type: Boolean,
    default: false,
  },
});
const store = useDemographicStore();
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
