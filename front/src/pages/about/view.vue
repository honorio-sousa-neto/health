<template>
  <div>
    <div class="text-h5">
      {{ store.data.data.name }}
    </div>
    <div class="text-grey-9">
      <div>NIF: {{ store.data.data.nif }}</div>
      <div>Contacto: {{ store.data.data.phone }}</div>
      <div>Email: {{ store.data.data.email }}</div>
      <div>Endereço: {{ store.data.data.address }}</div>
    </div>
  </div>
</template>
<script setup>
import { useCompanyStore } from "src/stores/company";
const store = useCompanyStore();
</script>
