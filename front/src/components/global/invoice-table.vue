<template>
  <div class="row q-pa-md justify-between">
    <div class="col row q-gutter-sm">
      <q-select
        outlined
        dense
        v-model="store.pagination.category"
        type="text"
        :rules="[required]"
        label="Categoria"
        :options="[
          { label: 'Facturas', value: 'FT' },
          { label: 'Recibos', value: 'RC' },
          { label: 'Factura-Recibo', value: 'FR' },
          { label: 'Nota de crédito', value: 'NC' },
          { label: 'Nota de débito', value: 'ND' },
          { label: 'Proforma', value: 'PP' },
        ]"
        emit-value
        map-options
        class="col-2"
        @update:model-value="fetchData"
      />
      <q-input
        dense
        filled
        class="col-4"
        debounce="300"
        placeholder="Pesquisar por referência..."
        v-model="store.pagination.meta.search"
        @update:model-value="fetchData"
      />
      <div v-if="['admin'].includes(user.role)">
        <q-radio v-model="shape" val="termal" label="Impressora térmica" />
        <q-radio v-model="shape" val="a4" label="A4" />
      </div>
    </div>
    <div class="q-gutter-sm">
      <q-btn
        color="grey-4"
        text-color="grey-9"
        no-caps
        label="Ordenar por"
        icon="sort"
      >
        <!-- <q-menu>
            <div style="min-width: 150px">
              <div>
                <q-radio v-model="shape" val="line" label="Nome" />
              </div>
              <div>
                <q-radio v-model="shape" val="line" label="Data de criação" />
              </div>
            </div>
          </q-menu> -->
      </q-btn>
      <q-btn
        color="grey-4"
        text-color="grey-9"
        no-caps
        label="Novo"
        icon="las la-plus"
        @click="$router.push({ name: 'emitir-documento' })"
      >
        <q-tooltip> Criar novo registro </q-tooltip>
      </q-btn>
    </div>
  </div>
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
      rowsNumber: store.pagination.meta.totalPages,
    }"
  >
    <template v-slot:body-cell-actions="props">
      <q-td :props="props">
        <printButton :type="shape" :id="props.row.id" />
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
    @update-search="store.index"
  />
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useInvoiceStore } from "src/stores/invoice";
import Pagination from "./Pagination.vue";
import editDestroy from "../global/edit-destroy.vue";
import printButton from "../global/print-button.vue";
const selected = ref([]);
import { SessionStorage } from "quasar";

const user = SessionStorage.getItem("alfavida_user");
const addNew = ref(false);
const shape = ref("termal");
const props = defineProps({
  columns: {
    type: Array,
    default: [],
  },
  storeName: {
    type: String,
  },
  path: {
    type: Object,
    default: {
      add: null,
      edit: null,
    },
  },
});

const store = useInvoiceStore();

const fetchData = async () => {
  await store.index();
};
onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped></style>
