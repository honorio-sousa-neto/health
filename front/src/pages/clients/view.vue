<template>
  <q-card flat class="q-my-md">
    <div class="text-h5">{{ store.form.name }}</div>
    <div>
      Contacto: <span class="text-grey-7">{{ store.form.phone }}</span>
    </div>
    <div>
      Assegurado por:
      <span class="text-grey-7">{{
        store.form.insuranceId ? store.form.insurance.name : "Nenhum"
      }}</span>
    </div>
    <div>
      Parceiro:
      <span class="text-grey-7">{{
        store.form.partnerId ? store.form.partner.name : "Nenhum"
      }}</span>
    </div>
    <div>
      Protocol:
      <span class="text-grey-7">{{
        store.form.protocolId ? store.form.protocol.name : "Nenhum"
      }}</span>
    </div>
  </q-card>
  <q-card flat>
    <div class="row q-gutter-sm q-pb-md">
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
        rowsNumber: store.pagination.meta.totalPage,
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
import { useCustomerStore } from "src/stores/customer";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { columns } from "src/utils/columns/invoice";
import printButton from "src/components/global/print-button.vue";
const store = useCustomerStore();
const route = useRoute();
const status = ref("POR_PAGAR");
const fetchData = async (s) => {
  status.value = ["PAGO", "POR_PAGAR"].includes(s) ? s : status.value;
  await store.myInvoices(route.params.id, status.value);
};
onMounted(() => {
  fetchData();
});
</script>
