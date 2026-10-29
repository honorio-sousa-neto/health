<template>
  <q-card flat class="q-my-md">
    <div class="text-h5">{{ store.form?.bank?.name }}</div>
    <div>
      Montante: <span class="text-grey-7">{{ store.form.amount }}</span>
    </div>
  </q-card>
</template>
<script setup>
import { useDepositStore } from "src/stores/deposit";

const store = useDepositStore();
</script>
