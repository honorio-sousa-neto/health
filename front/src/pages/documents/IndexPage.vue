<template>
  <ListaPagina
    titulo="Documentos emitidos"
    :contexto="contexto"
    apoio="Facturas, recibos e notas. O estado é o da liquidação, não o da emissão."
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="!!pagination.search || !!pagination.category"
    texto-vazio="Ainda não há documentos emitidos."
    @recarregar="fetchAll"
  >
    <template #accoes>
      <select v-model="tipo" class="lp-filtro" aria-label="Filtrar por tipo" @change="aoFiltrar">
        <option v-for="o in TIPOS" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
      </select>

      <select v-model="formato" class="lp-filtro" aria-label="Formato de impressão">
        <option value="termal">Imprimir em térmica</option>
        <option value="a4">Imprimir em A4</option>
      </select>

      <NewRegist to="emitir-documento" rotulo="Emitir documento" />
    </template>

    <template #linha-accoes="{ linha }">
      <q-item v-close-popup clickable @click="imprimir(linha.id)">
        <q-item-section avatar><q-icon name="las la-print" size="18px" /></q-item-section>
        <q-item-section>Imprimir em {{ formato === "termal" ? "térmica" : "A4" }}</q-item-section>
      </q-item>
      <q-item
        v-close-popup clickable
        @click="$router.push({ name: 'emitir-documento-form', query: { id: linha.id } })"
      >
        <q-item-section avatar><q-icon name="las la-coins" size="18px" /></q-item-section>
        <q-item-section>Liquidar</q-item-section>
      </q-item>
    </template>
  </ListaPagina>
</template>

<script setup>
import { openProtectedFile } from "src/utils/protected-file";
/**
 * Os documentos emitidos.
 *
 * O tipo era uma cápsula colorida por tipo — seis cores para seis siglas que
 * já se distinguem por serem siglas. O estado era outra cápsula. Passam a
 * coluna de texto e a estado em ponto e rótulo, como no resto das listas.
 *
 * O selector de formato de impressão era um par de botões no meio dos
 * filtros, sem dizer sobre o que actuava. Passa a `select` ao lado da acção
 * que usa, e o item do menu de linha diz em que formato vai imprimir.
 */
import { computed, ref } from "vue";
import { api } from "src/boot/axios";
import NewRegist from "src/components/common/buttons/NewRegist.vue";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { useCommom } from "src/composables/commom";
import { kwanza } from "src/utils/format";

const { loading, data, pagination, fetchAll } = useCommom("invoices");
const formato = ref("termal");
const tipo = ref("");

const TIPOS = [
  { label: "Todos os tipos", value: "" },
  { label: "Factura", value: "FT" },
  { label: "Factura-recibo", value: "FR" },
  { label: "Recibo", value: "RC" },
  { label: "Proforma", value: "PP" },
  { label: "Nota de débito", value: "ND" },
  { label: "Nota de crédito", value: "NC" },
];

const contexto = computed(() => {
  const partes = [];
  if (pagination.search) partes.push(`a filtrar por \u201c${pagination.search}\u201d`);
  const rotulo = TIPOS.find((t) => t.value === tipo.value && t.value)?.label;
  if (rotulo) partes.push(rotulo.toLowerCase());
  return partes.join(" \u00b7 ");
});

const cliente = (linha) =>
  ["RC", "ND", "NC"].includes(linha.type)
    ? linha.invoiceSource?.customer?.name ?? null
    : linha.customer?.name ?? null;

const colunas = [
  { name: "type", label: "Tipo", field: "type", align: "left" },
  { name: "reference", label: "Referência", field: "reference", align: "left" },
  { name: "customer", label: "Cliente", field: cliente, align: "left", ordenavel: true },
  {
    name: "emission_date", label: "Data", field: "emission_date", align: "left", ordenavel: true,
    format: (v) =>
      v
        ? new Date(v).toLocaleDateString("pt-PT", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })
        : "\u2014",
  },
  {
    name: "status", label: "Estado", field: "status", align: "left", estado: true,
    format: (v) => (v === "POR_PAGAR" ? "Por pagar" : "Pago"),
    tom: (v) => (v === "POR_PAGAR" ? "aviso" : "ok"),
  },
  {
    name: "total", label: "Total", field: "total",
    numerico: true, ordenavel: true, format: (v) => kwanza(v),
  },
  { name: "actions", label: "Acções", align: "right" },
];

const aoFiltrar = () => {
  pagination.category = tipo.value || undefined;
  pagination.page = 1;
  fetchAll();
};

const imprimir = (id) => {
  const url =
    formato.value === "termal"
      ? `${api.defaults.baseURL}/reports/termal/printing/${id}/second`
      : `${api.defaults.baseURL}/reports/${id}/second`;
  openProtectedFile(url, "_blank", "noreferrer");
};
</script>
