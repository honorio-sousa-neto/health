<template>
  <div>
    <q-form @submit.prevent="onSubmit" @reset="onReset">

      <!-- Identificação -->
      <div class="form-section-label">Identificação</div>
      <div class="row q-col-gutter-sm q-mb-sm">
        <div class="col-12">
          <q-input v-model="form.name" class="fi fi--principal" borderless label="Nome *"
            :rules="[required]" lazy-rules />
        </div>
      </div>
      <div class="row q-col-gutter-sm q-mb-lg">
        <div class="col-12 col-sm-6">
          <q-input v-model="form.nif" class="fi" borderless label="NIF" maxlength="14" />
        </div>
        <div class="col-12 col-sm-6">
          <q-input v-model="form.birthday" class="fi" borderless type="date"
            label="Data de nascimento" stack-label />
        </div>
      </div>

      <!-- Contacto -->
      <div class="form-section-label">Contacto</div>
      <div class="row q-col-gutter-sm q-mb-lg">
        <div class="col-12 col-sm-4">
          <q-input v-model="form.phone" class="fi" borderless label="Telefone *"
            mask="###-###-###" unmasked-value :rules="[required]" lazy-rules />
        </div>
        <div class="col-12 col-sm-4">
          <q-input v-model="form.email" class="fi" borderless label="E-mail" />
        </div>
        <div class="col-12 col-sm-4">
          <q-input v-model="form.address" class="fi" borderless label="Endereço" />
        </div>
      </div>

      <!-- Outros -->
      <div class="form-section-label">Outros</div>
      <div class="row q-col-gutter-sm q-mb-lg">
        <div class="col-12 col-sm-6">
          <q-input v-model="form.source" class="fi" borderless label="Origem" />
        </div>
        <div class="col-12 col-sm-6 column justify-center">
          <div class="row items-center q-gutter-md">
            <q-checkbox :model-value="form.gender === 'MALE'"
              @update:model-value="form.gender = 'MALE'"
              label="Masculino" color="primary" dense />
            <q-checkbox :model-value="form.gender === 'FEMALE'"
              @update:model-value="form.gender = 'FEMALE'"
              label="Feminino" color="primary" dense />
          </div>
        </div>
      </div>

      <!-- Associações -->
      <div class="form-section-label">Associações</div>

      <!-- Protocolo -->
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-12 col-sm-6">
          <div class="assoc-block">
            <q-checkbox v-model="isProtocol" label="Tem protocolo" color="primary" dense />
            <div v-if="isProtocol" class="q-mt-sm">
              <SelectProtocol v-model:protocol="form.protocolId" />
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6">
          <div class="assoc-block">
            <q-checkbox v-model="isPartner" label="Tem parceiro" color="primary" dense />
            <div v-if="isPartner" class="q-mt-sm">
              <SelectPartner v-model:partner="form.partnerId" />
            </div>
          </div>
        </div>
      </div>

      <!-- Seguradoras -->
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-12">
          <div class="assoc-block">
            <q-checkbox v-model="hasInsurance" label="Tem seguradora" color="primary" dense />
            <div v-if="hasInsurance" class="q-mt-sm">
              <div
                v-for="(entry, i) in form.insurances"
                :key="i"
                class="row q-col-gutter-sm q-mb-sm items-center"
              >
                <div class="col-12 col-sm-5">
                  <SelectInsurance v-model:insurance="entry.insuranceId" />
                </div>
                <div class="col-12 col-sm-5">
                  <q-input v-model="entry.insuranceNumber" class="fi" borderless label="Nº de apólice" />
                </div>
                <div class="col-auto">
                  <q-btn flat round dense icon="las la-times" color="grey-4" size="sm"
                    @click="form.insurances.splice(i, 1)" />
                </div>
              </div>
              <q-btn flat no-caps icon="las la-plus" label="Adicionar seguradora"
                color="primary" size="sm" class="q-mt-xs" @click="addInsurance" />
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <ResetButton type="reset" />
        <SubmitButton :loading type="submit" />
      </div>
    </q-form>

    <q-dialog maximized v-model="openDialog" persistent>
      <q-card class="q-pa-md">
        <div class="row justify-end">
          <q-btn color="grey" icon="close" v-close-popup flat round />
        </div>
        <SelectAggregate @saved="openDialog = false" />
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import ResetButton from "src/components/common/buttons/ResetButton.vue";
import SubmitButton from "src/components/common/buttons/SubmitButton.vue";
import { required } from "src/utils/validation";
import { onMounted, reactive, ref } from "vue";
import { useCreateUpdate } from "src/composables/create-update";
import { useRoute } from "vue-router";
import SelectAggregate from "./SelectAggregate.vue";
import SelectInsurance from "./SelectInsurance.vue";
import SelectPartner from "./SelectPartner.vue";
import SelectProtocol from "./SelectProtocol.vue";

const { fetchOne } = useCreateUpdate("customers");
const emits = defineEmits(["create", "getName", "cancel"]);
defineProps({ loading: { type: Boolean, default: false } });

const openDialog = ref(false);
const isProtocol = ref(false);
const isPartner = ref(false);
const hasInsurance = ref(false);

const form = reactive({
  name: "", nif: "", phone: "", source: "", address: "",
  birthday: null, gender: "MALE", email: "",
  protocolId: null, partnerId: null,
  insurances: [],
});

const addInsurance = () => {
  form.insurances.push({ insuranceId: null, insuranceNumber: "" });
};

const onSubmit = () => emits("create", form);
const onReset = () => emits("cancel");

const route = useRoute();
onMounted(async () => {
  if (route.params.id) {
    const data = await fetchOne(route.params.id);
    emits("getName", { name: data.name, id: data.id });
    Object.assign(form, data);
    if (data.birthday) form.birthday = data.birthday.split("T")[0];
    if (data.protocolId) isProtocol.value = true;
    if (data.partnerId) isPartner.value = true;
    if (data.customersInsurance?.length) {
      hasInsurance.value = true;
      form.insurances = data.customersInsurance.map((ci) => ({
        insuranceId: ci.insuranceId,
        insuranceNumber: ci.insuranceNumber ?? "",
      }));
    }
  }
});
</script>

<style scoped lang="scss">
.form-section-label {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text-faint);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--border-soft);
}

.assoc-block {
  background: var(--surface-3);
  border-radius: var(--r-sm);
  padding: 12px 14px;
  min-height: 48px;
}
</style>
