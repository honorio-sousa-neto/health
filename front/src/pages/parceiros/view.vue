<template>
  <q-card flat class="q-my-md">
    <div class="text-h5">{{ store.currentPartner.name }}</div>
    <div class="text-grey-8">
      <div>NIF: {{ store.currentPartner.nif }}</div>
      <div>Endereço: {{ store.currentPartner.address || "Desconhecido" }}</div>
      <div>Contacto: {{ store.currentPartner.phone || "Nenhum" }}</div>
      <div>Email: {{ store.currentPartner.email || "Nenhum" }}</div>
    </div>
  </q-card>
  <q-card flat>
    <div class="row q-gutter-sm">
      <q-btn
        size="sm"
        color="grey-4"
        text-color="red-9"
        label="Por pagar"
        @click="onClick"
        icon="las la-coins"
      />
      <q-btn
        size="sm"
        color="grey-4"
        text-color="teal-9"
        icon="las la-coins"
        label="Pago"
        @click="onClick"
      />
    </div>
  </q-card>
</template>
<script setup>
import { usePartnerStore } from "src/stores/partner";

const store = usePartnerStore();
</script>
