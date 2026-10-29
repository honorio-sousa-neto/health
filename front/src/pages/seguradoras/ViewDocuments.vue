<template>
  <Breadcrumbs>
    <template #children>
      <q-breadcrumbs-el
        label="Seguradoras"
        active-class="text-h6 text-weight-regular"
        class="text-grey"
        :to="{ name: 'lista-seguradoras' }"
      />
      <q-breadcrumbs-el
        :label="insurance.insurance.name"
        active-class="text-h6 text-weight-regular"
        class="text-grey"
        :to="{
          name: 'editar-seguradora',
          params: { id: insurance.insurance.id },
        }"
      />
      <q-breadcrumbs-el
        :label="'Contas'"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{
          name: 'ver-contas',
        }"
      />
    </template>
  </Breadcrumbs>
  <q-card
    style="
      position: sticky;
      top: 55px;
      right: 0;
      background-color: white;
      z-index: 11;
    "
    flat
  >
    <q-card-section>
      <div class="row justify-between">
        <div class="row items-center q-gutter-sm">
          <div
            class="text-grey-8 text-bold text-caption"
            @click="
              () => {
                query.status = 'PAGO';
                $router.push({ query: { status: 'PAGO' } });
                fetchInvoice();
              }
            "
          >
            Pago
          </div>
          <div
            class="text-red-8 text-bold text-h6 underline"
            @click="
              () => {
                query.status = 'POR_PAGAR';
                $router.push({ query: { status: 'POR_PAGAR' } });
                fetchInvoice();
              }
            "
          >
            Por pagar
          </div>
        </div>
        <div>
          <ExportExcel />
        </div>
      </div>
      <div class="q-py-md text-body1">
        <div>
          Total:
          <span style="font-size: 12pt" class="text-bold">{{
            new Intl.NumberFormat("de-DE", {
              style: "currency",
              currency: "AOA",
            }).format(insurance.sum)
          }}</span>
        </div>
        <div>
          Maior fatura:
          <span style="font-size: 12pt" class="text-bold">{{
            new Intl.NumberFormat("de-DE", {
              style: "currency",
              currency: "AOA",
            }).format(insurance.maximum)
          }}</span>
        </div>
        <div>
          Número de faturas:
          <span style="font-size: 12pt" class="text-bold">{{
            insurance.count
          }}</span>
        </div>
      </div>
    </q-card-section>
  </q-card>
  <div class="q-px-md">
    <IndexInsuranceInvoice
      @fetch-data="fetchInvoice"
      v-model:perpage="query.perPage"
      v-model:page="query.page"
      v-model:search="query.search"
      :totalPages="query.totalPages"
      :data="data"
    />
  </div>
</template>
<script setup>
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import { useFetchData } from "src/composables/fetch-data";
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import IndexInsuranceInvoice from "./components/IndexInsuranceInvoice.vue";
import ExportExcel from "./components/ExportExcel.vue";

const { fetchData, query, loading } = useFetchData();
const route = useRoute();
const insurance = reactive({
  insurance: {
    name: null,
    id: null,
  },
  minimun: 0,
  maximum: 0,
  average: 0,
  count: 0,
  sum: 0,
});

const data = ref([]);
const fetchInvoice = async () => {
  data.value = await fetchData(`insurances/invoices/${route.params.id}`);
};

const fetchOne = async () => {
  const response = await fetchData(
    `insurances/invoices/debt-and-payment/${route.params.id}`
  );
  console.log(response);
  Object.assign(insurance, response);
};

onMounted(() => {
  fetchOne();
  fetchInvoice();
});
</script>
