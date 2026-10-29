<template>
  <q-btn color="teal-8" icon="las la-file-excel" label="Exportar" no-caps>
    <q-menu square>
      <q-list class="q-pa-md" style="min-width: 200px">
        <q-input outlined v-model="range" type="month" label="Mês" />
        <q-btn
          color="primary"
          label="Concluir"
          @click="exportExcel"
          class="q-mt-md full-width"
          :disable="!range"
        />
      </q-list>
    </q-menu>
  </q-btn>
</template>
<script setup>
import { openProtectedFile } from "src/utils/protected-file";
import { api } from "src/boot/axios";
import { ref } from "vue";
const range = ref(null);

const exportExcel = () => {
  try {
    let [year, month] = range.value.split("-");
    month = Number(month);
    openProtectedFile(
      api.defaults.baseURL +
        `/reports/download/excel/report?year=${year}&month=${month}`,
      "_blank",
      "noreferrer"
    );
  } catch (error) {}
};
</script>
