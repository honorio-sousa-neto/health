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
      <div class="text-grey-8">Financeiro</div>
    </div>
    <div class="q-pt-md">
      <VueApexCharts
        height="400"
        type="line"
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
  xaxis: {
    categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
  },
  legend: {
    position: "top",
  },
};
const series = [
  {
    name: "Contas pagas",
    data: [30, 40, 45, 50, 49, 60, 70, 91],
  },
  {
    name: "Contas a receber",
    data: [300, 480, 465, 570, 9, 560, 570, 391],
  },
];
</script>
<style scoped>
.graph__wrapper {
  min-height: 500px;
  width: auto;
  border-radius: var(--r-panel);
  background: var(--st-warn-tint);
  padding: 16px;
}
</style>
