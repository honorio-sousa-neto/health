<template>
  <div class="row q-col-gutter-sm items-center">
    <div class="col-12 col-sm-6">
      <q-select
        v-model="store.form.type"
        :options="documents"
        label="Tipo de documento"
        class="fi"
        borderless
        map-options
        emit-value
        popup-content-class="fi-popup"
      />
    </div>
    <div class="col-12 col-sm-6">
      <q-select
        v-if="['RC', 'NC', 'ND'].includes(store.form.type)"
        v-model="store.form.invoiceId"
        class="fi"
        borderless
        use-input
        option-label="reference"
        input-debounce="500"
        @filter="filterFunction"
        :options="options"
        @update:model-value="fetchData"
        popup-content-class="fi-popup"
        label="Referência do documento"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useInvoiceStore } from "src/stores/invoice";
import { SessionStorage } from "quasar";
import { useSearch } from "src/composables/search";

const user = SessionStorage.getItem("alfavida_user");
const { filter } = useSearch("invoices");
const store = useInvoiceStore();

const documents = computed(() => {
  let defaultItems = [
    { label: "Factura", value: "FT" },
    { label: "Factura-Recibo", value: "FR" },
    { label: "Proforma", value: "PP" },
  ];
  if (user.role == "admin") {
    defaultItems = defaultItems.concat([
      { label: "Recibo", value: "RC" },
      { label: "Nota de crédito", value: "NC" },
      { label: "Nota de débito", value: "ND" },
    ]);
  }
  return defaultItems;
});

const options = ref([]);
const filterFunction = async (val, update) => {
  try {
    if (!val) return;
    update(async () => {
      const data = await filter(val);
      val = null;
      options.value = data;
    });
  } catch (error) {}
};

const fetchData = (val) => {
  Object.assign(store.currentInvoice, val);
};
</script>

