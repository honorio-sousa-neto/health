<template>
  <q-card flat class="q-my-md">
    <div class="text-h5">{{ store.form.name }}</div>
    <div class="text-grey-8">
      <div>NIF: {{ store.form.nif }}</div>
      <div>Endereço: {{ store.form.address || "Desconhecido" }}</div>
      <div>Contacto: {{ store.form.phone || "-" }}</div>
    </div>
    <div class="text-h6">
      Total de Facturas:
      {{
        new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "AOA",
        }).format(Number(total))
      }}
    </div>
  </q-card>
  <q-card flat>
    <div class="row q-pb-md justify-between">
      <div class="row q-gutter-sm">
        <q-btn
          size="sm"
          color="grey-4"
          text-color="red-9"
          label="Por pagar"
          @click="fetchData('POR_PAGAR')"
          icon="las la-coins"
        />
        <q-btn
          size="sm"
          color="grey-4"
          text-color="teal-9"
          icon="las la-coins"
          label="Pago"
          @click="fetchData('PAGO')"
        />
      </div>
      <div>
        <q-btn
          color="green-8"
          icon="las la-file-excel"
          label="Exportar Excel"
          no-caps
        >
          <q-menu>
            <q-list class="q-pa-md" style="min-width: 200px">
              <q-input outlined v-model="range" type="month" label="Mês" />
              <q-btn
                color="primary"
                label="Exportar"
                @click="exportExcel"
                class="q-mt-md"
                :disable="!range"
              />
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>

    <q-table
      :rows="store.data.invoices"
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
        rowsNumber: store.pagination.meta.totalPages,
      }"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <!-- <editDestroy :id="props.row.id" :store :path="path.edit" /> -->
          <printButton :id="props.row.id" />
        </q-td>
      </template>
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          {{ props.row.status }}
          <q-badge
            rounded
            :color="`${props.row.status == 'PAGO' ? 'green-10' : 'red-10'}`"
          />
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
    <div class="row justify-between q-px-md">
      <div class="col-2">
        <q-select
          v-model="store.pagination.meta.perPage"
          :options="[3, 5, 7, 10, 15]"
          label="Por página"
          filled
          dense
          @update:model-value="fetchData"
        />
      </div>
      <q-pagination
        v-model="store.pagination.meta.page"
        color="grey-8"
        :max="store.pagination.meta.totalPages"
        @update:model-value="fetchData"
      />
    </div>
  </q-card>
</template>
<script setup>
import { openProtectedFile } from "src/utils/protected-file";
import { useInsuranceStore } from "src/stores/insurance";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { columns } from "src/utils/columns/invoice";
import printButton from "src/components/global/print-button.vue";
import { api } from "src/boot/axios";
const store = useInsuranceStore();
const route = useRoute();
const total = ref(0);

const status = ref("POR_PAGAR");
const fetchData = async (s) => {
  status.value = ["PAGO", "POR_PAGAR"].includes(s) ? s : status.value;
  await store.myInvoices(route.params.id, status.value);
};

const fetchTotal = async (s) => {
  status.value = ["PAGO", "POR_PAGAR"].includes(s) ? s : status.value;

  total.value = await store.myInvoicesTotal(route.params.id, status.value);
};
onMounted(() => {
  fetchData("POR_PAGAR");
  fetchTotal("POR_PAGAR");
});

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
