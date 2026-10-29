<template>
  <div>
    <q-form @submit.prevent="onSubmit" @reset="onReset">
      <div>
        <div>
          <q-input
            outlined
            v-model="store.form.name"
            type="text"
            label="Nome"
            :rules="[required]"
            lazy-rules
          />
          <q-input
            outlined
            v-model="store.form.nif"
            type="text"
            label="NIF"
            :maxlength="14"
            class="q-mb-md"
          />
          <q-input
            outlined
            v-model="store.form.email"
            type="text"
            label="Email"
            class="q-mb-md"
          />
          <q-input
            outlined
            v-model="store.form.phone"
            type="text"
            label="Contacto telefónico"
            mask="###-###-###"
            class="q-mb-md"
            unmasked-value
          />
          <q-input
            outlined
            v-model="store.form.source"
            type="text"
            label="Origem"
            class="q-mb-md"
          />
          <q-input
            outlined
            v-model="store.form.address"
            type="text"
            label="Endereço"
            class="q-mb-md"
          />

          <q-radio v-model="model" val="protocol" label="Protocolar" />
          <q-radio v-model="model" val="insurance" label="Segurado" />
          <q-radio v-model="model" val="partner" label="Parceiro" />

          <q-slide-transition>
            <div v-if="model == 'insurance'">
              <q-select
                outlined
                v-model="store.form.insuranceId"
                :options="storeInsurance.data.data"
                label="Seguradora"
                option-label="name"
                option-value="id"
                emit-value
                map-options
                :rules="[required]"
                lazy-rules
              />
              <q-input
                outlined
                v-model="store.form.insurance_number"
                type="text"
                label="Numero de seguro"
                :rules="[required]"
                lazy-rules
              />
            </div>
          </q-slide-transition>
          <q-slide-transition>
            <div v-if="model == 'protocol'">
              <q-select
                outlined
                v-model="store.form.protocolId"
                :options="storeProtocol.data.data"
                label="Protocolo"
                option-label="name"
                option-value="id"
                clearable
                emit-value
                map-options
                :rules="[required]"
                lazy-rules
              />
            </div>
          </q-slide-transition>
          <q-slide-transition>
            <div v-if="model == 'partner'">
              <q-select
                outlined
                v-model="store.form.partnerId"
                :options="storePartner.data.data"
                label="Parceiro"
                option-label="name"
                option-value="id"
                clearable
                emit-value
                map-options
                :rules="[required]"
                lazy-rules
              />
            </div>
          </q-slide-transition>
        </div>
      </div>
      <div class="q-mt-sm q-gutter-sm">
        <q-btn
          rounded
          icon="las la-save"
          label="Salvar"
          type="submit"
          color="primary"
          :loading="store.loadings.loadingCreate"
        />
        <q-btn
          label="Limpar"
          rounded
          icon="las la-eraser"
          type="reset"
          color="primary"
          outline
        />
      </div>
    </q-form>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { required } from "src/utils/validation";
import { useCustomerStore } from "src/stores/customer";
import { useProtocolStore } from "src/stores/protocol";
import { useInsuranceStore } from "src/stores/insurance";
import { useRoute } from "vue-router";
import { usePartnerStore } from "src/stores/partner";

const store = useCustomerStore();
const storeProtocol = useProtocolStore();
const storeInsurance = useInsuranceStore();
const storePartner = usePartnerStore();

const model = ref(
  store.form?.partnerId
    ? "partner"
    : store.form?.insuranceId
    ? "insurance"
    : "protocol"
);

const route = useRoute();

const onSubmit = async () => {
  let payload = {};
  Object.assign(payload, store.form);
  if (model.value == "protocol") {
    delete payload.insuranceId;
    delete payload.insurance_number;
    delete payload.partnerId;
  } else if (model.value == "insurance") {
    delete payload.protocolId;
    delete payload.partnerId;
  } else {
    delete payload.insuranceId;
    delete payload.insurance_number;
    delete payload.protocolId;
  }
  if (route.params.id) {
    await store.update(payload, route.params.id);
  } else {
    await store.create(payload);
  }
};
const onReset = () => {
  store.onReset();
};
onMounted(async () => {
  await storeProtocol.index();
  await storeInsurance.index();
  await storePartner.index();
});

onUnmounted(() => {
  store.onReset();
});
</script>

<style scoped lang="scss">
.custom-btn {
  font-size: smaller;
  color: $primary;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
