<template>
  <div class="row">
    <div class="col-3">
      <q-input
        v-model="form.month"
        type="month"
        label="Mês"
        outlined
        @update:model-value="fetchData"
      />
    </div>
  </div>
  <div class="q-py-md">
    <q-table
      class="my-sticky-column-table"
      :rows="rows.filter((item) => item.materialCategory == 'LAB')"
      :columns="columns"
      row-key="name"
      bordered
      :pagination="{ rowsPerPage: 0 }"
      hide-bottom
      flat
    >
      <template v-slot:top>
        <div class="full-width row justify-between">
          <div class="text-h5">Laboratório</div>
          <div class="text-h6">
            Custo total:
            <span>{{
              new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "AOA",
              }).format(
                rows
                  .filter((material) => material.materialCategory === "LAB")
                  .flatMap((material) =>
                    material.operations
                      .filter((op) => op.type === "SAIDA")
                      .map((op) => op.quantity * material.materialPrice)
                  )
                  .reduce((acc, curr) => acc + curr, 0)
              )
            }}</span>
          </div>
        </div>
      </template>
    </q-table>
  </div>
  <div class="q-py-md">
    <q-table
      class="my-sticky-column-table"
      :rows="rows.filter((item) => item.materialCategory == 'FAR')"
      :columns="columns"
      row-key="name"
      bordered
      :pagination="{ rowsPerPage: 0 }"
      hide-bottom
      flat
    >
      <template v-slot:top>
        <div class="full-width row justify-between">
          <div class="text-h5">Farmácia</div>
          <div class="text-h6">
            Custo total:
            <span>{{
              new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "AOA",
              }).format(
                rows
                  .filter((material) => material.materialCategory === "FAR")
                  .flatMap((material) =>
                    material.operations
                      .filter((op) => op.type === "SAIDA")
                      .map((op) => op.quantity * material.materialPrice)
                  )
                  .reduce((acc, curr) => acc + curr, 0)
              )
            }}</span>
          </div>
        </div>
      </template>
    </q-table>
  </div>
  <div class="q-py-md">
    <q-table
      title="Enfermaria"
      class="my-sticky-column-table"
      :rows="rows.filter((item) => item.materialCategory == 'ENF')"
      :columns="columns"
      row-key="name"
      bordered
      :pagination="{ rowsPerPage: 0 }"
      hide-bottom
      flat
    >
      <template v-slot:top>
        <div class="full-width row justify-between">
          <div class="text-h5">Farmácia</div>
          <div class="text-h6">
            Custo total:
            <span>{{
              new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "AOA",
              }).format(
                rows
                  .filter((material) => material.materialCategory === "ENF")
                  .flatMap((material) =>
                    material.operations
                      .filter((op) => op.type === "SAIDA")
                      .map((op) => op.quantity * material.materialPrice)
                  )
                  .reduce((acc, curr) => acc + curr, 0)
              )
            }}</span>
          </div>
        </div>
      </template>
    </q-table>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref, computed } from "vue";
import { useFetch } from "src/composables/fetch";

const { store } = useFetch();
const form = reactive({
  month: "2024-06",
});

const rows = ref([]);

const loading = ref(false);
const columns = computed(() => [
  {
    name: "material",
    field: "materialName",
    label: "Material",
    align: "left",
  },
  {
    name: "stockInitial",
    field: (row) => row?.operations[0].stockInitial,
    label: "Stock inicial",
    align: "center",
  },
  {
    name: "entradas",
    field: (row) => {
      const entradas = row.operations.filter(
        (operation) => operation.type == "ENTRADA"
      );
      let balance = 0;
      entradas.forEach((entrada) => {
        balance += entrada.quantity;
      });
      return balance;
    },
    label: "Entradas",
    align: "center",
  },
  {
    name: "1",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 1
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "1",
    align: "left",
  },
  {
    name: "2",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 2
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "2",
    align: "left",
  },
  {
    name: "3",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 3
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "3",
    align: "left",
  },
  {
    name: "4",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 4
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "4",
    align: "left",
  },
  {
    name: "5",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 5
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "5",
    align: "left",
  },
  {
    name: "6",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 6
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "6",
    align: "left",
  },
  {
    name: "7",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 7
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "7",
    align: "left",
  },
  {
    name: "8",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 8
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "8",
    align: "left",
  },
  {
    name: "9",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 9
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "9",
    align: "left",
  },
  {
    name: "10",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 10
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "10",
    align: "left",
  },
  {
    name: "11",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 11
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "11",
    align: "left",
  },
  {
    name: "12",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 12
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "12",
    align: "left",
  },
  {
    name: "13",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 13
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "13",
    align: "left",
  },
  {
    name: "14",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 14
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "14",
    align: "left",
  },
  {
    name: "15",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 15
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "15",
    align: "center",
  },
  {
    name: "16",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 16
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "16",
    align: "left",
  },
  {
    name: "17",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 17
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "17",
    align: "left",
  },
  {
    name: "18",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 18
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "18",
    align: "left",
  },
  {
    name: "19",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 19
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "19",
    align: "left",
  },
  {
    name: "20",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 20
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "20",
    align: "left",
  },
  {
    name: "21",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 21
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "21",
    align: "left",
  },
  {
    name: "22",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 22
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "22",
    align: "left",
  },
  {
    name: "23",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 23
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "23",
    align: "left",
  },
  {
    name: "24",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 24
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "24",
    align: "left",
  },
  {
    name: "25",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 25
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "25",
    align: "left",
  },
  {
    name: "26",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 26
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "26",
    align: "left",
  },
  {
    name: "27",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 27
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "27",
    align: "left",
  },
  {
    name: "28",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 28
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "28",
    align: "left",
  },
  {
    name: "29",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 29
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "29",
    align: "left",
  },
  {
    name: "30",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 30
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "30",
    align: "left",
  },
  {
    name: "31",
    field: (row) => row.operations,
    format: (val, row) => {
      const items = val.filter(
        (operation) => operation.type == "SAIDA" && operation.day == 31
      );
      if (!items.length) return 0;
      let balance = 0;
      items.forEach((item) => {
        balance += item.quantity;
      });
      return balance;
    },
    label: "31",
    align: "left",
  },
  {
    name: "stockFinal",
    field: (row) => row?.operations[row.operations.length - 1].stockFinal,
    label: "Stock final",
    align: "center",
    style: "background-color: green; color: white",
  },
  {
    name: "materialStockMin",
    field: `materialStockMin`,
    label: "Stock minimo",
    align: "center",
  },
  {
    name: "needs",
    field: (row) => row?.operations[row.operations.length - 1].stockFinal,
    label: "Necessidades",
    align: "center",
    format: (val, row) => val - row.materialStockMin,
  },
  {
    name: "stockFinal",
    field: "materialPrice",
    label: "Preço",
    align: "center",
    format: (val) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(val),
  },
  {
    name: "stockFinal",
    field: "materialPrice",
    label: "Custo",
    align: "center",
    format: (val, row) => {
      let total = 0;
      row.operations
        .filter((item) => item.type == "SAIDA")
        .forEach((item) => {
          total += item.quantity;
        });

      return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(total * val);
    },
    style: "background-color: grey; color: white",
  },
]);

const month = computed(() => {
  const [year, month] = form.month.split("-");
  return month;
});
const fetchData = async () => {
  try {
    loading.value = true;
    const { data } = await store("materials/stock-logs", form);
    rows.value = data;
    loading.value = false;
  } catch (error) {}
};

onMounted(() => {
  fetchData();
});
</script>
