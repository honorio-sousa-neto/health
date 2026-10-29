<template>
  <div class="q-my-md">
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      flat
      bordered
      square
      :loading="loading"
      :pagination="{ rowsPerPage: 10 }"
      selection="multiple"
      v-model:selected="selected"
      :filter="filter"
    >
      <template v-slot:top>
        <div class="row full-width justify-between q-mx-md">
          <q-input
            v-model="filter"
            type="text"
            outlined
            dense
            label="Pesquisar"
          />
          <div>
            <q-btn
              v-if="selected.length"
              color="primary"
              icon="print"
              :label="`Imprimir (${selected.length}) selecionado (s)`"
              @click="onPrint"
              no-caps
            />
          </div>
        </div>
      </template>
    </q-table>
  </div>
</template>
<script setup>
import { openProtectedFile } from "src/utils/protected-file";
import { onMounted, ref } from "vue";
import { useFetch } from "src/composables/fetch";
import { useRouter } from "vue-router";
import { api } from "src/boot/axios";

const router = useRouter();
const { index } = useFetch();
const loading = ref(false);
const rows = ref([]);
const selected = ref([]);
const filter = ref(null);

const columns = [
  {
    name: "document",
    field: "document",
    align: "left",
    label: "Documento",
    format: (val) => {
      const types = { FT: "Factura", FR: "Factura-RECIBO", RC: "RECIBO" };
      return types[val];
    },
  },
  {
    name: "reference",
    field: "reference",
    align: "center",
    label: "Referência",
  },
  {
    name: "emission_date",
    field: "emission_date",
    align: "center",
    label: "Data de emissão",
    format: (val) => {
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(val));
    },
  },
  {
    name: "paid",
    field: "paid",
    label: "Estado",
    align: "center",
    style: (row) =>
      row.paid
        ? "background-color: green; color: white"
        : "background-color: red; color: white",
    format: (val) => (val ? "Pago" : "Por pagar"),
  },
  {
    name: "total",
    field: "total",
    align: "right",
    label: "Preço",
    format: (val) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(val),
  },
];

async function fetchData() {
  try {
    loading.value = true;
    const { data } = await index("documents");
    rows.value = data;
    loading.value = false;
  } catch (error) {}
}

async function onPrint() {
  try {
    selected.value.forEach((item) => {
      openProtectedFile(
        api.defaults.baseURL + `/reports/${item.id}/second`,
        "_blank",
        "noreferrer"
      );
    });
  } catch (error) {}
}
onMounted(() => {
  fetchData();
});
</script>
