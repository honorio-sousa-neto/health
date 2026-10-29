<template>
  <q-btn color="secondary" round icon="las la-print" flat @click="onPrint">
    <q-tooltip> Imprimir segunda via </q-tooltip>
  </q-btn>
  <!-- <q-btn color="green-8" round icon="las la-coins" flat @click="onClick">
    <q-tooltip> Liquidar Factura </q-tooltip>
  </q-btn> -->
</template>
<script setup>
import { openProtectedFile } from "src/utils/protected-file";
import { api } from "src/boot/axios";
const props = defineProps({
  id: {
    type: String,
  },
  print: {
    type: String,
    default: "termal",
  },
});

const onPrint = () => {
  if (props.print == "termal") {
    openProtectedFile(
      api.defaults.baseURL + `/reports/termal/printing/${props.id}/second`,
      "_blank",
      "noreferrer"
    );
  } else {
    openProtectedFile(
      api.defaults.baseURL + `/reports/${props.id}/second`,
      "_blank",
      "noreferrer"
    );
  }
};
</script>
