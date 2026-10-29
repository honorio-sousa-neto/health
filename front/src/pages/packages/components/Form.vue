<template>
  <q-form @submit="onSubmit" @reset="onReset">
    <div class="q-gutter-sm">
      <InputText v-model:value="store.form.name" dense label="Nome" />
      <InputNumber v-model:value="store.form.amount" dense label="Preço" />
      <div>
        <q-radio v-model="store.form.type" val="single" label="Singular" />
        <q-radio v-model="store.form.type" val="familiar" label="Familiar" />
        <q-radio v-model="store.form.type" val="pregnancy" label="Gestante" />
      </div>
      <q-slide-transition>
        <div v-show="store.form.type == 'familiar'" class="q-my-sm">
          <div class="text-bold q-mb-md">Agregados</div>
          <div class="q-gutter-sm">
            <InputNumber
              v-model:value="store.form.aggregations.first"
              dense
              label="Custo de 1º agregado"
            /><InputNumber
              v-model:value="store.form.aggregations.second"
              dense
              label="Custo de 2º agregado"
            /><InputNumber
              v-model:value="store.form.aggregations.third"
              dense
              label="Custo de 3º agregado"
            /><InputNumber
              v-model:value="store.form.aggregations.afterThird"
              dense
              label="Custo do 4º agregado em diante"
            />
          </div>
        </div>
      </q-slide-transition>
      <div class="text-bold">Serviços incluídos</div>
      <div class="column items-start">
        <LabOptions v-model:services="services.lab" />
        <EnfOptions v-model:services="services.enf" />
        <FarOptions v-model:services="services.far" />
        <RxOptions v-model:services="services.rx" />
        <EspOptions v-model:services="services.esp" />
      </div>
      <div>
        <div class="text-bold">Taxa de comparticipação no internamento</div>
        <div class="row">
          <q-input
            v-model.number="store.form.internTax"
            outlined
            dense
            class="col-3"
            type="number"
            label="Escreva aqui..."
            hint="Taxa de comparticipação em %, indique um número entre 0 a 100"
          />
        </div>
      </div>
    </div>
    <div class="q-mt-md q-gutter-md">
      <SubmitButton :loading="store.loading" type="submit" />
      <ResetButton type="reset" />
    </div>
  </q-form>
</template>
<script setup>
import { useInternStore } from "src/stores/intern";
import InputNumber from "src/components/common/forms/InputNumber.vue";
import InputText from "src/components/common/forms/InputText.vue";
import SubmitButton from "src/components/common/buttons/SubmitButton.vue";
import ResetButton from "src/components/common/buttons/ResetButton.vue";
import LabOptions from "./LabOptions.vue";
import EnfOptions from "./EnfOptions.vue";
import FarOptions from "./FarOptions.vue";
import RxOptions from "./RxOptions.vue";
import EspOptions from "./EspOptions.vue";
import { onUnmounted, reactive } from "vue";
const emits = defineEmits(["create"]);
const store = useInternStore();

const services = reactive({
  lab: [],
  enf: [],
  rx: [],
  esp: [],
  far: [],
});

const onSubmit = async () => {
  store.form.services = services.lab
    .concat(services.enf)
    .concat(services.esp)
    .concat(services.far)
    .concat(services.rx);
  console.log(store.form.services);
  emits("create");
};
const onReset = () => {
  store.onReset();
};

onUnmounted(() => {
  store.onReset();
});
</script>
<style>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
