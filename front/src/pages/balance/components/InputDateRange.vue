<template>
  <div class="q-px-md q-pt-sm row justify-between">
    <q-input
      v-if="$route.query.mode == 'diario'"
      v-model="day"
      type="date"
      label="Dia, mês e ano"
      class="col-3"
      stack-label
      standout="bg-teal-8 text-white"
      @update:model-value="
        () => {
          $emit('changeRange');
        }
      "
    />
    <q-input
      v-else
      v-model="month"
      class="col-3"
      stack-label
      standout="bg-teal-8 text-white"
      @update:model-value="
        () => {
          $emit('changeRange');
        }
      "
      type="month"
      label="Mês e ano"
    />
    <div v-if="$route.query.mode !== 'diario'">
      <q-btn
        color="teal"
        icon="las la-file-excel"
        label="Baixar mapa"
        @click="downloadArchive"
      />
    </div>
  </div>
</template>
<script setup>
import { openProtectedFile } from "src/utils/protected-file";
import { api } from "src/boot/axios";

defineEmits(["changeRange"]);
const day = defineModel("day");
const month = defineModel("month");

const downloadArchive = () => {
  const baseURL = api.defaults.baseURL;
  const [year, mon] = month.value.split("-");

  openProtectedFile(
    `${baseURL}/reports/download/excel/monthly-report?year=${year}&month=${mon}`
  );
};
</script>
