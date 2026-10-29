<template>
  <div>
    <div class="row justify-between">
      <div class="col-3">
        <q-input v-model="date" dense outlined type="date" label="Dia" />
      </div>
      <!-- <div>
        <q-btn
          color="green-10"
          icon="check"
          label="Validar"
          @click="closeAccount"
          :loading="loadingClosing"
        />
      </div> -->
    </div>

    <q-table
      class="q-mt-md"
      flat
      bordered
      square
      :rows="rows"
      :columns="columns"
      row-key="name"
      :pagination="{ rowsPerPage: 0 }"
      :loading="loading"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            icon="las la-eye"
            flat
            color="primary"
            dense
            @click="
              $router.push({
                name: 'balanco-view',
                params: { category: areas[props.row.category] },
                query: { ...period },
              })
            "
            round
          />
        </q-td>
      </template>
    </q-table>
    <div class="row q-mt-md text-h6 justify-end q-gutter-md">
      <div>Total:</div>
      <div class="text-h6">
        {{
          new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "AOA",
          }).format(total)
        }}
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useFetch } from "src/composables/fetch";
import { useNotify } from "src/composables/notify";
import { useFetchApi } from "src/composables/api";
const { index } = useFetchApi();
const { notify } = useNotify();
const today = new Date();
const { store } = useFetch();
const day = String(today.getDate()).padStart(2, "0");
const month = String(today.getMonth() + 1).padStart(2, "0"); // Mês é indexado de 0 a 11, então adicionamos 1
const year = today.getFullYear();
const date = ref(`${year}-${month}-${day}`);

const areas = {
  Laboratório: "LAB",
  Enfermaria: "ENF",
  Farmácia: "FAR",
  Estomatologia: "EST",
  Ecografia: "ECO",
  "Raio-X": "RX",
  Especialidade: "ESP",
};
const loading = ref(false);
const rows = ref([]);
const total = ref(0);
const columns = [
  {
    name: "category",
    align: "left",
    field: "category",
    label: "Categoria",
  },
  {
    name: "total",
    align: "right",
    field: "total",
    label: "Total",
    format: (val) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(val),
  },
  {
    name: "actions",
    align: "right",
    field: "actions",
    label: "Acções",
  },
];

const fetchData = async () => {
  loading.value = true;
  const { data } = await index("balances", {
    params: {
      range: date.value,
      type: "daily",
    },
  });
  rows.value = data;
  total.value = 0;
  rows.value.forEach((item) => (total.value += item.total));
  loading.value = false;
};
const period = computed(() => {
  const [year, month, day] = date.value.split("-");
  return { year, month, day };
});
const loadingClosing = ref(false);
const closeAccount = async () => {
  try {
    loadingClosing.value = true;
    const form = {
      type: "daily",
      day: date.value,
      specialities: rows.value.map((item) => ({
        description: item.category,
        amount: item.total,
      })),
    };
    const { data, message, status } = await store(
      "account-closure/create-account",
      form
    );
    notify(status, message, "top-right");
    loadingClosing.value = false;
  } catch (error) {}
};

watch(date, () => {
  fetchData();
});

onMounted(() => {
  fetchData();
});
</script>
