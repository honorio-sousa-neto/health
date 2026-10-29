<template>
  <q-form @submit="onSubmit" @reset="onReset">
    <div class="q-gutter-sm">
      <q-select
        v-model="form.type"
        :options="[
          { label: 'Singular', value: 'single' },
          { label: 'Familiar', value: 'familiar' },
          { label: 'Gestante', value: 'pregnancy' },
        ]"
        label="Tipo de pacote"
        option-value="value"
        emit-value
        map-options
        standout="bg-teal text-white"
        option-label="label"
      />

      <InputText v-model:value="form.name" label="Nome do pacote" />
      <InputNumber
        v-model:value="form.amount"
        :label="
          form.type !== 'familiar'
            ? 'Custo do pacote'
            : 'Custo do chefe de família'
        "
      />

      <q-slide-transition>
        <div v-show="form.type == 'familiar'" class="q-py-sm">
          <div class="text-bold q-mb-md q-ml-sm">Agregados</div>
          <div class="q-gutter-sm row">
            <InputNumber
              v-model:value="form.aggregations.first"
              label="Custo de 1º agregado"
              class="col"
            /><InputNumber
              v-model:value="form.aggregations.second"
              label="Custo de 2º agregado"
              class="col"
            /><InputNumber
              v-model:value="form.aggregations.third"
              label="Custo de 3º agregado"
              class="col"
            /><InputNumber
              v-model:value="form.aggregations.afterThird"
              label="Custo do 4º agregado em diante"
              class="col"
            />
          </div>
        </div>
      </q-slide-transition>
      <div class="text-bold q-ml-sm">Serviços incluídos</div>
      <Services
        v-model:services="form.services"
        v-model:internTax="form.internTax"
        v-model:examBoundary="form.examBoundary"
      />
      <!-- <div class="column items-start">
        <div class="row q-gutter-md items-center q-my-xs">
          <div class="text-bold">Clínica geral</div>
          <div>
            <q-btn
              dense
              flat
              color="primary"
              icon="las la-plus-square"
              @click="open.enf = !open.enf"
            />
          </div>
        </div>
        <q-slide-transition>
          <div v-show="open.enf">
            <EnfOptions v-model:services="services.enfermary" />
          </div>
        </q-slide-transition>
        <div class="row q-gutter-md items-center q-my-xs">
          <div class="text-bold">Laboratório</div>
          <div>
            <q-btn
              dense
              flat
              color="primary"
              icon="las la-plus-square"
              @click="open.lab = !open.lab"
            />
          </div>
        </div>
        <q-slide-transition>
          <div v-show="open.lab">
            <LabOptions v-model:services="services.laboratory" />
          </div>
        </q-slide-transition>
        <div class="row q-gutter-md items-center q-my-xs">
          <div class="text-bold">Farmácia</div>
          <div>
            <q-btn
              dense
              flat
              color="primary"
              icon="las la-plus-square"
              @click="open.pharma = !open.pharma"
            />
          </div>
        </div>
        <q-slide-transition>
          <div v-show="open.pharma">
            <FarOptions v-model:services="services.pharma" />
          </div>
        </q-slide-transition>
        <div class="row q-gutter-md items-center q-my-xs">
          <div class="text-bold">Imagiologia (Raio-X)</div>
          <div>
            <q-btn
              dense
              flat
              color="primary"
              icon="las la-plus-square"
              @click="open.rx = !open.rx"
            />
          </div>
        </div>
        <q-slide-transition>
          <div v-show="open.rx">
            <RxOptions v-model:services="services.radio" />
          </div>
        </q-slide-transition>
        <div class="row q-gutter-md items-center q-my-xs">
          <div class="text-bold">Imagiologia (Ecografia)</div>
          <div>
            <q-btn
              dense
              flat
              color="primary"
              icon="las la-plus-square"
              @click="open.eco = !open.eco"
            />
          </div>
        </div>
        <q-slide-transition>
          <div v-show="open.eco">
            <EcoOptions v-model:services="services.ecography" />
          </div>
        </q-slide-transition>
      </div> -->
      <!-- <div>
        <div class="text-bold">Taxa de comparticipação no internamento</div>
        <div class="row">
          <q-input
            v-model.number="form.internTax"
            outlined
            class="col-5 q-mb-sm"
            type="number"
            label="Escreva aqui..."
            hint="Taxa de comparticipação em %, indique um número entre 0 a 100"
          />
        </div>
      </div> -->
    </div>
    <div class="q-mt-md q-gutter-md">
      <SubmitButton :loading="loading" type="submit" />
      <ResetButton type="reset" />
    </div>
  </q-form>
</template>
<script setup>
import ResetButton from "src/components/common/buttons/ResetButton.vue";
import SubmitButton from "src/components/common/buttons/SubmitButton.vue";
import InputNumber from "src/components/common/forms/InputNumber.vue";
import InputText from "src/components/common/forms/InputText.vue";
import { useCreateUpdate } from "src/composables/create-update";
import { useInternStore } from "src/stores/intern";
import { onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
import Services from "./Services.vue";
const store = useInternStore();
const emits = defineEmits(["create", "getName"]);
const route = useRoute();
const open = reactive({
  enf: false,
  lab: false,
  pharma: false,
  rx: false,
  eco: false,
});
const { fetchOne } = useCreateUpdate("interns");
let form = reactive({
  name: null,
  amount: null,
  type: "single",
  internTax: null,
  examBoundary: null,
  aggregations: {
    first: null,
    second: null,
    third: null,
    afterThird: null,
  },
  services: [],
});

let services = reactive({
  laboratory: [],
  ecography: [],
  enfermary: [],
  radio: [],
  pharma: [],
});

onMounted(async () => {
  if (route.params.id) {
    const data = await fetchOne(route.params.id);
    Object.assign(store.form.services, data.services);
    Object.assign(form, data);
    if (!data.aggregations?.first)
      form.aggregations = {
        first: null,
        second: null,
        third: null,
        afterThird: null,
      };
    emits("getName", { id: form.id, name: form.name });
  }
});

const onSubmit = async () => {
  emits("create", form);
};
</script>
<style>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
