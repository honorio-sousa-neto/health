<template>
  <div>Definições</div>
  <q-separator spaced />
  <div class="q-gutter-sm">
    <q-input
      v-model="emission_date"
      stack-label
      outlined
      type="datetime-local"
      label="Data de emissão"
      dense
    />
    <div v-if="document == 'RC' || document == 'FR' || isAttending">
      <q-select
        stack-label
        v-model="payment"
        :options="payments"
        label="Forma de pagamento"
        outlined
        dense
        emit-value
        map-options
        class="q-mb-sm"
      />
      <q-input
        stack-label
        v-model.number="amount_received"
        label="valor recebido"
        outlined
        dense
        :required="['FR', 'RC'].includes(document)"
        type="number"
        :rules="[(val) => val >= total || 'Valor recebido não cobre a Factura']"
      />
      <div v-if="amount_received > total">
        Troco:
        {{
          new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "AOA",
          }).format(amount_received - total)
        }}
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineModel, onMounted, ref } from "vue";
import { useFetch } from "src/composables/fetch";

const emission_date = defineModel("emission");
const payment = defineModel("payment");
const amount_received = defineModel("amount");
const { index } = useFetch();
defineProps({
  total: {
    type: Number,
  },
  document: {
    type: String,
  },
  isAttending: {
    type: Boolean,
  },
});

const emit = defineEmits(["getPayment"]);

const loadingPayments = ref(false);
const payments = ref([]);

const fetchData = async () => {
  try {
    loadingPayments.value = true;
    const { data } = await index("payments");
    payments.value = data.map((item) => ({
      label: item.title,
      value: item.id,
    }));
    emit("getPayment", payments.value[0].value);
    loadingPayments.value = false;
  } catch (error) {}
};

onMounted(() => {
  fetchData();
});
</script>
