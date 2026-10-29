<template>
  <q-card flat square>
    <q-card-section>
      <div class="text-h5">{{ store.currentInvoice.customer.name }}</div>
      <div>
        Contacto:
        <span class="text-grey-7">{{
          store.currentInvoice.customer.phone
        }}</span>
      </div>
      <div>
        Assegurado por:
        <span class="text-grey-7">{{
          store.currentInvoice.customer.insuranceId
            ? store.currentInvoice.customer.insurance.name
            : "-"
        }}</span>
      </div>
      <div>
        Parceiro:
        <span class="text-grey-7">{{
          store.currentInvoice.customer.partnerId
            ? store.currentInvoice.customer.partner.name
            : "-"
        }}</span>
      </div>
      <div>
        Protocol:
        <span class="text-grey-7">{{
          store.currentInvoice.customer.protocolId
            ? store.currentInvoice.customer.protocol.name
            : "Nenhum"
        }}</span>
      </div>
      <q-separator color="white" />
    </q-card-section>
  </q-card>
  <q-separator />
</template>
<script setup>
import { useInvoiceStore } from "src/stores/invoice";
const store = useInvoiceStore();
</script>
