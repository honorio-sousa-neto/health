<template>
  <q-card square bordered class="my-card">
    <q-card-section class="row q-gutter-md">
      <q-select
        v-model="range"
        :options="options"
        dense
        label="Período"
        outlined
        class="col-3"
        map-options
        emit-value
        @update:model-value="fetchData"
      />
    </q-card-section>
    <q-separator spaced />
    <q-card-section>
      <div class="row q-mb-sm justify-between">
        <div>
          <q-radio v-model="document" val="FR" label="Factura-Recibo" />
          <q-radio v-model="document" val="FT" label="Factura" />
        </div>
        <!-- <q-checkbox
          left-label
          v-model="paid"
          label="Pago"
          @update:model-value="fetchData"
        /> -->
        <q-btn
          color="secondary"
          v-if="selected.length"
          icon="las la-download"
          label="Baixar selecionados"
          no-caps
          @click="onPrint"
        />
      </div>

      <div class="text-h6">
        Total:
        <span v-if="document == 'FR'">{{
          new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "AOA",
          }).format(response.paid)
        }}</span>
        <span v-else>{{
          new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "AOA",
          }).format(response.toPay)
        }}</span>
      </div>
      <div class="text-subtitle">
        Imposto de selo:
        <span v-if="document == 'FR'">{{
          new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "AOA",
          }).format(response.paid / 100)
        }}</span>
      </div>
      <q-table
        :title="paid ? 'Documentos pagos' : 'Documentos a pagar'"
        :rows="response.documents"
        flat
        :columns="columns"
        row-key="reference"
        selection="multiple"
        v-model:selected="selected"
      />
    </q-card-section>
  </q-card>
</template>
<script setup>
import { openProtectedFile } from "src/utils/protected-file";
import { computed, ref, onMounted, watch } from "vue";
import { getDateDaysBefore, getStartOfToday } from "src/utils/days";
import { useFetch } from "src/composables/fetch";
import { api } from "src/boot/axios";
const selected = ref([]);
const columns = ref([
  {
    name: "attending",
    field: (row) => row.attendantData.name,
    label: "Emitido por",
    align: "left",
  },
  {
    name: "client",
    field: (row) => row.clientData.name,
    label: "Cliente",
    align: "center",
  },
  {
    name: "total",
    field: "total",
    label: "Total",
    align: "center",
    format: (val) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(val),
  },
  {
    name: "tax",
    field: "tax",
    label: "Imposto de selo",
    align: "center",
    format: (val) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(val),
  },
  {
    name: "reference",
    field: "reference",
    label: "Referência",
    align: "center",
  },
  {
    name: "createdAt",
    field: "createdAt",
    label: "Data de emissão",
    align: "left",
    format: (val) =>
      new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(val)),
  },
]);

const { store } = useFetch();
const range = ref({
  $gte: getStartOfToday(1),
});
const options = computed(() => [
  {
    label: "Hoje",
    value: {
      $gte: getStartOfToday(1),
    },
  },
  {
    label: "Últimas 24h",
    value: {
      $gte: getDateDaysBefore(1),
    },
  },
  {
    label: "Últimas 7 dias",
    value: {
      $gte: getDateDaysBefore(7),
    },
  },
  {
    label: "Últimas 30 dias",
    value: {
      $gte: getDateDaysBefore(30),
    },
  },
  {
    label: "Tudo",
    value: {
      $lte: Date.now(),
    },
  },
]);
const document = ref("FR");
const paid = ref(false);
const response = ref({
  toPay: 0,
  paid: 0,
  documents: [],
});
const loading = ref(false);
const fetchData = async () => {
  try {
    loading.value = true;
    const { data } = await store("reports-financial", {
      range: range.value,
      document: document.value,
    });
    response.value.toPay = data.toPay;
    response.value.paid = data.paid;
    response.value.documents = data.documents;
    loading.value = false;
  } catch (error) {}
};

async function onPrint() {
  try {
    selected.value.forEach((item) => {
      openProtectedFile(
        api.defaults.baseURL + `/reports/${item._id}`,
        "_blank",
        "noreferrer"
      );
    });
  } catch (error) {
    console.log(error.message);
  }
}

watch(document, () => {
  fetchData();
});
onMounted(() => {
  fetchData();
});
</script>
