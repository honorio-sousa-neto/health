<template>
  <q-form @submit="onSubmit" @reset="onReset">
    <div>
      <SelectCustomer v-model="form.customer" class="q-mb-sm" />
      <q-slide-transition>
        <div v-show="form.customer.name">
          <div class="q-px-md q-py-sm">
            <div>
              NIF:
              <span class="q-ml-sm text-teal text-bold">{{
                form.customer.nif
              }}</span>
            </div>
            <div>
              Nome:
              <span class="q-ml-sm text-teal text-bold">{{
                form.customer.name
              }}</span>
            </div>
            <div>
              Endereço:
              <span class="q-ml-sm text-teal text-bold">{{
                form.customer.address
              }}</span>
            </div>
            <div>
              Telefone:
              <span class="q-ml-sm text-teal text-bold">{{
                form.customer.phone
              }}</span>
            </div>
          </div>
          <div>
            <q-input
              v-model="form.insuranceNumber"
              label="Número de seguro"
              standout="bg-teal text-white"
              :rules="[(val) => !!val || 'Campo obrigatório']"
              lazy-rules
            />
          </div>
        </div>
      </q-slide-transition>
    </div>
    <div class="row q-gutter-sm">
      <q-btn
        label="Submit"
        rounded
        icon="las la-save"
        type="submit"
        color="primary"
      />
      <q-btn
        label="Cancelar"
        rounded
        icon="las la-times"
        type="reset"
        color="red"
        @click="$emit('close')"
      />
    </div>
  </q-form>
</template>
<script setup>
import SelectCustomer from "src/pages/signing/components/SelectCustomer.vue";
import { reactive } from "vue";
import { useInsuranceStore } from "src/stores/insurance";
const insuranceStore = useInsuranceStore();
let form = reactive({
  customer: {
    nif: "",
    name: "",
    address: "",
    phone: "",
  },
  insuranceNumber: "",
});
const props = defineProps({
  insuranceId: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["close"]);
const onSubmit = async () => {
  const response = await insuranceStore.attachCustomer(props.insuranceId, {
    customerId: form.customer.id,
    insuranceNumber: form.insuranceNumber,
  });
  if (response.success) {
    emit("close");
  }
};
</script>
