<template>
  <q-select
    v-model="paymentId"
    :options="store.data.data"
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
        v-for="bank in storeBank.data.data"
        :key="bank.id"
        v-model="invoiceStore.form.bank"
        :val="bank.id"
        :label="`${bank.name}`"
      />
    </div>
  </q-slide-transition>
</template>
<script setup>
import { useBankStore } from "src/stores/bank";
import { useInvoiceStore } from "src/stores/invoice";
import { usePaymentStore } from "src/stores/payment";
import { computed, onMounted, watch } from "vue";
const paymentId = defineModel("payment");
const store = usePaymentStore();
const storeBank = useBankStore();
const invoiceStore = useInvoiceStore();

const choiceBank = computed(() => {
  if (!invoiceStore.form.paymentId) return false;
  if (invoiceStore.form.paymentId.code == "D") {
    invoiceStore.form.bank = "";
    return false;
  }
  return true;
});

watch(choiceBank, async (current) => {
  console.log("Hey");
  if (current) {
    await storeBank.index();
  }
});
onMounted(async () => {
  await store.index();
});
</script>
