<template>
  <q-card flat class="q-my-md">
    <div class="text-h5">{{ store.currentService.name }}</div>
    <div class="text-grey-7">{{ store.currentService.description }}</div>
    <div class="text-grey-7">{{ store.currentService.category }}</div>
    <div class="q-mt-md">
      <div class="text-h6 text-weight-regular">
        Preço unitário:
        <span class="text-bold">
          {{ new Intl.NumberFormat("de-DE", { currency: "AOA", style: "currency" }).format(store.currentService.unit_price) }}
        </span>
      </div>
<div v-if="store.currentService.classificacao" class="text-h6 text-weight-regular">
        Classificação:
        <q-badge
          :color="store.currentService.classificacao === 'Alfa' ? 'green' : store.currentService.classificacao === 'Beta' ? 'orange' : 'red'"
          :label="store.currentService.classificacao"
          class="q-ml-sm text-subtitle1"
        />
      </div>
      <div class="text-h6 text-weight-regular">
        Desconto:
        <span class="text-bold">
          {{ new Intl.NumberFormat("de-DE", { currency: "AOA", style: "currency" }).format(store.currentService.discount) }}
        </span>
      </div>
    </div>
  </q-card>
</template>
<script setup>
import { useServiceStore } from "src/stores/service";

const store = useServiceStore();
</script>
