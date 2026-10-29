<template>
  <q-item v-if="modo === 'item'" v-close-popup clickable @click="onPrint">
    <q-item-section avatar><q-icon name="las la-print" size="18px" /></q-item-section>
    <q-item-section>{{ rotulo }}</q-item-section>
  </q-item>

  <q-btn v-else flat round dense icon="las la-print" class="btn-icone" @click="onPrint">
    <q-tooltip>{{ rotulo }}</q-tooltip>
  </q-btn>
</template>

<script setup>
import { openProtectedFile } from "src/utils/protected-file";
/**
 * Imprimir a segunda via de um documento.
 *
 * Tinha `color="secondary"`, cor da paleta do Quasar em chrome. Ganha o modo
 * "item" para viver no menu de linha das listas, como o editar e o eliminar.
 */
import { api } from "src/boot/axios";

const props = defineProps({
  id: { type: String, required: true },
  /** "termal" (talão) ou "a4". */
  print: { type: String, default: "termal" },
  /** "botao" (ícone) ou "item" (dentro de um menu de linha). */
  modo: { type: String, default: "botao" },
  rotulo: { type: String, default: "Imprimir segunda via" },
});

const onPrint = () => {
  const url =
    props.print === "termal"
      ? `${api.defaults.baseURL}/reports/termal/printing/${props.id}/second`
      : `${api.defaults.baseURL}/reports/${props.id}/second`;
  openProtectedFile(url, "_blank", "noreferrer");
};
</script>
