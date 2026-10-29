<template>
  <div class="q-pa-md">
    <div class="row justify-between items-center">
      <div class="row q-gutter-sm">
        <q-btn
          :color="`${store.pagination.status == 'PAGO' ? 'teal-8' : 'grey-4'}`"
          :text-color="store.pagination.status == 'PAGO' ? 'white' : 'green-9'"
          no-caps
          icon="las la-handshake"
          :label="`Recebido | ${new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'AOA',
          }).format(Number(storeFinance.data.receipt.received))}`"
          @click="
            () => {
              store.pagination.status = 'PAGO';
              fetchData();
            }
          "
          size="md"
        />
        <q-btn
          :color="`${
            store.pagination.status == 'POR_PAGAR' ? 'teal-8' : 'grey-4'
          }`"
          :text-color="
            store.pagination.status == 'POR_PAGAR' ? 'white' : 'red-9'
          "
          no-caps
          icon="las la-coins"
          :label="`A receber | ${new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'AOA',
          }).format(Number(storeFinance.data.receipt.toReceive))}`"
          @click="
            () => {
              store.pagination.status = 'POR_PAGAR';
              fetchData();
            }
          "
          size="md"
        />
      </div>
      <div>
        <q-slide-transition>
          <div
            class="row q-my-md q-gutter-sm text-h6 text-weight-medium"
            v-show="store.pagination.status == 'PAGO'"
          >
            <div>Imposto de selo:</div>
            <span>{{
              new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "AOA",
              }).format(storeFinance.data.receipt.received / 100)
            }}</span>
          </div>
        </q-slide-transition>
      </div>
    </div>

    <!-- <List /> -->
    <div class="custom-page q-pt-md">
      <q-table
        :rows="store.data.data"
        :columns="columns"
        row-key="id"
        v-model:selected="selected"
        flat
        dense
        class="custom-table"
        selection="multiple"
        hide-pagination
        :loading="store.loadings.loadingAll"
        :filter="store.pagination.meta.search"
        :pagination="{
          page: store.pagination.meta.page,
          rowsPerPage: store.pagination.meta.perPage,
          rowsNumber: store.pagination.meta.totalPage,
        }"
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <printButton :id="props.row.id" />
          </q-td>
        </template>
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <div class="row items-center justify-center q-gutter-md">
              <span>
                {{ props.row.status }}
              </span>
              <q-badge
                rounded
                :color="`${props.row.status == 'PAGO' ? 'green-10' : 'red-10'}`"
              />
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-insuranceId="props">
          <q-td :props="props">
            <q-icon
              size="sm"
              v-if="props.row.insuranceId"
              color="green-10"
              name="las la-check"
            />
            <q-icon size="sm" color="red-10" v-else name="las la-ban" />
          </q-td>
        </template>
        <template v-slot:pagination="scope">
          <q-btn
            v-if="scope.pagesNumber > 2"
            icon="first_page"
            color="grey-8"
            round
            dense
            flat
            :disable="scope.isFirstPage"
            @click="scope.firstPage"
          />

          <q-btn
            icon="chevron_left"
            color="grey-8"
            round
            dense
            flat
            :disable="scope.isFirstPage"
            @click="scope.prevPage"
          />

          <q-btn
            icon="chevron_right"
            color="grey-8"
            round
            dense
            flat
            :disable="scope.isLastPage"
            @click="scope.nextPage"
          />

          <q-btn
            v-if="scope.pagesNumber > 2"
            icon="last_page"
            color="grey-8"
            round
            dense
            flat
            :disable="scope.isLastPage"
            @click="scope.lastPage"
          />
        </template>
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
      <Pagination
        v-model:page="store.pagination.meta.page"
        v-model:perPage="store.pagination.meta.perPage"
        :total-pages="store.pagination.meta.totalPages"
        @update-search="fetchData"
      />
    </div>
  </div>
</template>
<script setup>
import List from "src/components/financeiro/List.vue";
import printButton from "src/components/global/print-button.vue";
import { useFinanceStore } from "src/stores/finance";
import { useInvoiceStore } from "src/stores/invoice";
import Pagination from "src/components/global/Pagination.vue";
import { onMounted } from "vue";
const columns = [
  {
    name: "reference",
    field: "reference",
    align: "left",
    label: "Referência",
  },
  {
    name: "customer",
    field: "customer",
    align: "left",
    label: "Cliente",
    format: (val, row) =>
      ["RC", "ND", "NC"].includes(row.type)
        ? row.invoiceSource.customer.name
        : val.name,
  },
  {
    name: "emission_date",
    field: "emission_date",
    align: "left",
    label: "Data de emissão",
    format: (val) => {
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(val));
    },
  },
  {
    name: "status",
    field: "status",
    label: "Estado",
    align: "center",
  },
  {
    name: "total",
    field: "total",
    align: "right",
    label: "Total",
    format: (val) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(val),
  },
  {
    name: "selo",
    field: "selo",
    align: "center",
    label: "Imposto de selo",
    format: (val, row) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(store.pagination.status == "PAGO" ? row.total / 100 : 0),
  },
  {
    name: "actions",
    label: "Acções",
    align: "center",
  },
];

const storeFinance = useFinanceStore();
const store = useInvoiceStore();
onMounted(async () => {
  await storeFinance.index();
  await store.indexByStatus();
});
const fetchData = async () => {
  await store.indexByStatus();
};
</script>
