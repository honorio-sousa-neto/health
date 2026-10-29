<template>
  <q-select
    v-model="invoiceStore.form.paymentId"
    :options="data"
    label="Método de pagamento"
    class="fi"
    borderless
    option-label="name"
    popup-content-class="fi-popup"
    :disable="!['FR', 'RC'].includes(invoiceStore.form.type)"
  >
    <template #selected-item="scope">
      <span style="font-size: var(--fs-body); color:var(--text)">
        {{ scope.opt?.name?.length > 12 ? scope.opt.name.slice(0, 12) + '…' : scope.opt?.name }}
      </span>
    </template>
  </q-select>
</template>

<script setup>
import { useCommom } from "src/composables/commom";
import { useInvoiceStore } from "src/stores/invoice";

const { data } = useCommom("payments");
const invoiceStore = useInvoiceStore();
</script>

