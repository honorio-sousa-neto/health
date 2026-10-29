<template>
  <div class="graph__wrapper">
    <div class="row q-gutter-md items-center">
      <q-btn
        icon="las la-coins"
        dense
        color="teal lighten-4"
        @click="onClick"
        style="border-radius: var(--r-sm)"
      />
      <div class="text-grey-8">Proveniência dos pacientes</div>
    </div>
    <div class="q-pt-md">
      <VueApexCharts
        height="300"
        type="pie"
        :options="options"
        :series="series"
      ></VueApexCharts>
    </div>
  </div>
</template>
<script setup>
import VueApexCharts from "vue3-apexcharts";
const options = {
  chart: {
    id: "vuechart-example",
  },
  labels: ["Particular", "Livre", "Colaborador", "Seguro"],
  legend: {
    position: "right", // Posição da legenda (pode ser 'top', 'bottom', 'left', 'right')
    formatter: (label, opts) => {
      // Formata cada item da legenda para exibir o rótulo e o valor absoluto
      return `${label}: ${opts.w.globals.series[opts.seriesIndex]}`;
    },
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 400,
        },
        legend: {
          position: "bottom",
        },
      },
    },
  ],
  tooltip: {
    y: {
      formatter: function (value) {
        return `${value}`; // Exibe cada valor como uma porcentagem
      },
    },
  },
};
const series = [2, 0, 1, 0];
</script>
<style scoped>
.graph__wrapper {
  min-height: 400px;
  width: auto;
  border-radius: var(--r-panel);
  background: var(--st-warn-tint);
  padding: 16px;
}
</style>
