<template>
  <q-card flat class="row items-center" square>
    <q-card-section class="col-md-6 col-xs-12">
      <div class="row q-gutter-md items-center">
        <q-avatar size="40px" color="teal" text-color="white">
          {{ store.form.type }}
        </q-avatar>
        <q-select
          v-model="store.form.type"
          :options="documents"
          label="Tipo de documento"
          standout="bg-teal-8 text-white"
          map-options
          emit-value
          dense
          class="col"
        />
      </div>
    </q-card-section>
    <q-card-section class="col-md-5 col-xs-12">
      <q-select
        v-if="['RC', 'NC', 'ND'].includes(store.form.type)"
        standout="bg-teal-8 text-white"
        v-model="store.form.invoiceId"
        use-input
        option-label="reference"
        input-debounce="500"
        use-chips
        dense
        @filter="filterFunction"
        :options="options"
        @update:model-value="fetchData"
        label="Inserir referência"
      />
    </q-card-section>
  </q-card>
  <q-separator />
</template>
<script setup>
import { computed, ref } from "vue";
import { useInvoiceStore } from "src/stores/invoice";
import { SessionStorage } from "quasar";
const user = SessionStorage.getItem("alfavida_user");

const store = useInvoiceStore();

const documents = computed(() => {
  let defaultItems = [
    {
      label: "Factura",
      value: "FT",
    },
    {
      label: "Factura-Recibo",
      value: "FR",
    },
    {
      label: "Proforma",
      value: "PP",
    },
  ];
  console.log(user.role);
  if (user.role == "admin") {
    defaultItems = defaultItems.concat([
      {
        label: "Recibo",
        value: "RC",
      },
      {
        label: "Nota de crédito",
        value: "NC",
      },
      {
        label: "Nota de dédito",
        value: "ND",
      },
    ]);
  }

  return defaultItems;
});

const options = ref([]);
const filterFunction = async (val, update, abort) => {
  try {
    if (!val) return;
    update(async () => {
      const data = await store.filter(val);
      val = null;
      options.value = data;
    });
  } catch (error) {}
};

const fetchData = (val) => {
  Object.assign(store.currentInvoice, val);
};
</script>
