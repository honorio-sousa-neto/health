<template>
  <q-select
    v-model="paymentId"
    :options="data"
    label="Método de pagamento"
    standout="bg-teal-8 text-white"
    option-label="name"
    dense
    option-value="id"
    :disable="!['FR', 'RC'].includes(invoiceStore.form.type)"
  />
  <q-slide-transition>
    <div v-if="choiceBank">
      <q-radio
        v-for="bank in optionsBank"
        :key="bank.id"
        v-model="bankChoose"
        :val="bank.id"
        :label="`${bank.name}`"
      />
    </div>
  </q-slide-transition>
</template>
<script setup>
import { api } from "src/boot/axios";
import { useCommom } from "src/composables/commom";
import { useInvoiceStore } from "src/stores/invoice";
import { computed, watch, ref } from "vue";

const { fetchAll, data } = useCommom("payments");

const paymentId = defineModel("payment");
const bankChoose = defineModel("bank");
const invoiceStore = useInvoiceStore();
const choiceBank = computed(() => {
  if (!paymentId.value) return false;
  if (paymentId.value.code == "D") {
    bankChoose.value = "";
    return false;
  }
  return true;
});

const optionsBank = ref([]);
watch(choiceBank, async (current) => {
  if (current) {
    const { data } = await api.get("banks");
    optionsBank.value = data.data;
  }
});
</script>
