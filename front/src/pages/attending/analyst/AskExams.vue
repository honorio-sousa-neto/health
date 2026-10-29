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
            <q-select
              v-if="storeName == 'service' || storeName == 'material'"
              outlined
              dense
              v-model="store.pagination.category"
              type="text"
              label="Categoria"
              :options="[
                { label: 'Enfermaria', value: 'ENF' },
                { label: 'Farmácia', value: 'FAR' },
                { label: 'Laboratório', value: 'LAB' },
                { label: 'Estomatologia', value: 'EST' },
                { label: 'Ecografia', value: 'ECO' },
                { label: 'Raio-X', value: 'RX' },
                { label: 'Especialidade', value: 'ESP' },
              ]"
              emit-value
              map-options
              class="col-md-6 col-xs-12"
              @update:model-value="fetchData"
            />
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
            flat
            dense
            round
            color="teal-8"
            icon="las la-eye"
            @click="
              $router.push({
                name: 'editar-atendimento',
                params: { id: props.row.id },
              })
            "
          />
        </q-td>
      </template>
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          {{ props.row.status == "AVAILABLE" ? "Disponível" : "Indisponível" }}
          <q-badge
            rounded
            :color="`${
              props.row.status == 'AVAILABLE' ? 'green-10' : 'red-10'
            }`"
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
    <!-- <div class="row justify-between q-px-md">
      <div class="col-6 row q-gutter-md items-center">
        <div>
          <q-select
            v-model="store.pagination.meta.perPage"
            :options="[3, 5, 7, 10, 15]"
            label="Por página"
            filled
            dense
            @update:model-value="fetchData"
          />
        </div>
        <div>
          Total de registros: <span>{{ store.pagination.meta.total }}</span>
        </div>
      </div>
      <q-pagination
        v-model="store.pagination.meta.page"
        color="grey-8"
        :max="store.pagination.meta.totalPages"
        @update:model-value="fetchData"
      />
    </div> -->
    <q-dialog v-model="addNew">
      <q-card style="width: 700px; max-width: 92vw">
        <q-card-section class="">
          <div class="text-h6 q-mb-md">Criar</div>
          <div>
            <slot name="formulary"></slot>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useDynamicStore } from "src/composables/dynamicStore";
import { api } from "src/boot/axios";
import io from "src/utils/socket";
import editDestroy from "src/components/global/edit-destroy.vue";
import { useAttendingStore } from "src/stores/attending";
const selected = ref([]);
const addNew = ref(false);

import { columns } from "src/utils/columns/attending";

const store = useAttendingStore();
const tableRef = ref();
const fetchData = async () => {
  await store.index("EXAM");
};
const socket = io(api.defaults.baseURL.slice(0, -4));
onMounted(() => {
  // tableRef.value.requestServerInteraction();
  fetchData();
  socket.on("attendance:screening", (attending) => {
    if (attending.stage == "EXAM") {
      showNotify("NOVO PACIENTE NA LISTA", true);
      store.data.data.unshift(attending);
    }
  });
});

onUnmounted(() => {
  store?.onReset();
});
</script>
