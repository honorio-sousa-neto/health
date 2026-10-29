<template>
  <q-card flat class="q-my-md">
    <div class="text-h5">{{ store.form.name }}</div>
    <div>
      NIF: <span class="text-grey-7">{{ store.form.nif }}</span>
    </div>
    <div>
      Contacto: <span class="text-grey-7">{{ store.form.phone }}</span>
    </div>
    <div>
      Email: <span class="text-grey-7">{{ store.form.email }}</span>
    </div>
    <div>
      Endereço: <span class="text-grey-7">{{ store.form.address }}</span>
    </div>
  </q-card>
</template>
<script setup>
import { useSupplierStore } from "src/stores/supplier";
import { useRoute } from "vue-router";

const store = useSupplierStore();
</script>
