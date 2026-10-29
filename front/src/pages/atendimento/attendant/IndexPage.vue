<template>
  <div>
    <q-table
      :rows="store.data"
      :columns="columns"
      row-key="id"
      v-model:selected="selected"
      flat
      ref="tableRef"
      square
      dense
      selection="multiple"
      hide-pagination
      @request="store.index"
      :loading="store.loading"
      :filter="store.pagination.meta.search"
      :pagination="{
        page: store.pagination.meta.page,
        rowsPerPage: store.pagination.meta.perPage,
        rowsNumber: store.pagination.meta.totalPages,
      }"
    >
      <template v-slot:top>
        <div class="full-width row justify-between">
          <div class="row col-6">
            <q-input
              dense
              filled
              class="col-md-6 col-xs-12"
              debounce="300"
              placeholder="Pesquisar..."
              v-model="store.pagination.meta.search"
              @update:model-value="fetchData"
            />
          </div>
          <q-btn
            color="grey-4"
            text-color="grey-9"
            no-caps
            label="Novo"
            icon="las la-plus"
            @click="addNew = !addNew"
          />
        </div>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            color="teal-8"
            round
            flat
            icon="las la-eye"
            dense
            @click="
              $router.push({
                name: 'editar-atendimento',
                params: { id: props.row.id },
              })
            "
            :disable="user.role == 'attendant'"
          >
            <q-tooltip v-model="showing"> Ver detalhes </q-tooltip>
          </q-btn>
        </q-td>
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
    <q-dialog v-model="addNew">
      <q-card
        style="
          min-width: min(1020px, 92vw);
          max-width: 92vw;
          height: min(1020px, 88vh);
          position: relative;
        "
      >
        <q-card-section class="fit">
          <div class="text-h6">Solicitar serviço</div>
          <Form @finished="addNew = false"></Form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import io from "src/utils/socket";
import { api } from "src/boot/axios";
import { columns } from "src/utils/columns/attending";
import { onMounted, onUnmounted, ref } from "vue";
import { useAttendingStore } from "src/stores/attending";
import Pagination from "src/components/global/Pagination.vue";
import editDestroy from "src/components/global/edit-destroy.vue";
import Form from "src/components/atendimento/Form.vue";
import { showNotify } from "src/utils/notify";
import { SessionStorage } from "quasar";
const user = SessionStorage.getItem("alfavida_user");
const selected = ref([]);
const addNew = ref(false);

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

const store = useAttendingStore();
const tableRef = ref();
const fetchData = async () => {
  await store.index();
};

const socket = io(api.defaults.baseURL.slice(0, -4));

onMounted(() => {
  tableRef.value.requestServerInteraction();
  // fetchData();
});

onUnmounted(() => {
  store?.onReset();
});
</script>

<style lang="scss" scoped></style>
