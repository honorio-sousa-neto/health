<template>
  <div class="fit">
    <q-table
      :rows="store.data.data"
      :columns="columns"
      row-key="id"
      v-model:selected="selected"
      flat
      ref="tableRef"
      square
      dense
      class="custom-table"
      selection="multiple"
      hide-pagination
      @request="store.index"
      :loading="store.loadings.loadingAll"
      :filter="store.pagination.meta.search"
      :pagination="{
        page: store.pagination.meta.page,
        rowsPerPage: store.pagination.meta.perPage,
        rowsNumber: store.pagination.meta.totalPage,
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
          >
            <q-tooltip v-model="showing"> Ver detalhes </q-tooltip>
          </q-btn>
        </q-td>
      </template>
      <template v-slot:bottom>
        <div class="full-width q-py-xs row items-center justify-between">
          <div class="col-6 row q-gutter-md items-center">
            <div class="col-3">
              <q-select
                v-model="store.pagination.meta.perPage"
                :options="[3, 5, 7, 10, 15]"
                label="Por página"
                filled
                dense
                @update:model-value="fetchData"
              />
            </div>
            <div class="text-bold">
              Total de registros:
              <span>{{ store.pagination.meta.total }}</span>
            </div>
          </div>
          <q-pagination
            v-model="store.pagination.meta.page"
            color="grey-8"
            :max="store.pagination.meta.totalPages"
            @update:model-value="fetchData"
            :max-pages="8"
          />
        </div>
      </template>
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
    </q-table>
    <q-dialog v-model="addNew">
      <q-card style="width: 700px; max-width: 92vw">
        <q-card-section class="">
          <div class="text-h6 q-mb-md">Criar</div>
          <Form></Form>
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
import editDestroy from "src/components/global/edit-destroy.vue";
import Form from "src/components/atendimento/Form.vue";
import { showNotify } from "src/utils/notify";
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
  await store.index("DOCTOR_ONE");
};

const socket = io(api.defaults.baseURL.slice(0, -4));

onMounted(() => {
  // tableRef.value.requestServerInteraction();
  fetchData();
  socket.on("attendance:screening", (attending) => {
    if (attending.stage == "DOCTOR_ONE") {
      showNotify("NOVO PACIENTE NA LISTA", true);
      store.data.data.unshift(attending);
    }
  });
});

onUnmounted(() => {
  store?.onReset();
});
</script>
