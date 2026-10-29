<template>
  <q-card class="fit row justify-between" square>
    <div class="col-md-8 col-sm-12 col-xs-12">
      <div>
        <documentsType />
      </div>
      <div v-if="['FR', 'FT', 'PP'].includes(store.form.type)" class="q-mx-md">
        <customer v-model:customer="store.form.customerId" />
      </div>
      <div v-else>
        <viewCustomer />
      </div>
      <Items
        class="col-md-8 col-xs-12"
        v-if="['FR', 'FT', 'PP'].includes(store.form.type)"
        v-model:items="store.form.invoiceItems"
      />
      <viewItems class="col-md-8" v-else />
    </div>
    <q-separator :vertical="$q.screen.gt.xs" />
    <div class="col-md col-xs-12 col-sm-12">
      <div class="row">
        <settings class="col" />
      </div>
    </div>
  </q-card>
</template>
<script setup>
import { useInvoiceStore } from "src/stores/invoice";
import documentsType from "../documentos/documents-type.vue";
import customer from "./customer.vue";
import Items from "./items.vue";
import settings from "./settings.vue";
import viewCustomer from "./view-customer.vue";
import viewItems from "./view-items.vue";

const store = useInvoiceStore();
</script>
