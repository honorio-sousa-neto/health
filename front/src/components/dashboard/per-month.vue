<template>
  <q-card flat bordered square class="my-card">
    <q-card-section>
      <VueApexCharts
        type="bar"
        height="370"
        :options="graph.options"
        :series="graph.series"
      ></VueApexCharts>
    </q-card-section>
  </q-card>
</template>
<script setup>
import { onMounted, reactive, ref } from "vue";
import { useFetch } from "src/composables/fetch";
import VueApexCharts from "vue3-apexcharts";
import Items from "../global/items.vue";

const { index } = useFetch();

let graph = reactive({
  options: {
    chart: {
      id: "vuechart-example",
    },
    xaxis: {
      categories: [],
    },
    yaxis: {
      labels: {
        show: true,
        // formmatter: (val) =>
        //   new Intl.NumberFormat("de-DE", {
        //     style: "currency",
        //     currency: "AOA",
        //   }).format(val),
      },
    },
  },
  tooltip: {
    y: {
      formatter: function (value, opts) {
        return new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "AOA",
        }).format(value);
      },
    },
  },
  series: [
    {
      name: "Facturas pagas",
      data: [],
    },
  ],
});

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const fetchData = async () => {
  try {
    const { data } = await index("dashboard/per-month");
    data.forEach((item) => {
      graph.options.xaxis.categories.push(monthNames[item.month - 1]);
      graph.series[0].data.push(item.total);
    });
  } catch (error) {}
};

onMounted(() => {
  fetchData();
});
</script>
