<template>
  <div class="q-pa-md">
    <q-table
      :rows="store.data.data"
      :columns="columnsExtra"
      row-key="id"
      flat
      dense
      class="custom-table"
      hide-pagination
      :loading="store.loadings.loadingAll"
      :filter="store.pagination.meta.search"
      :pagination="{
        page: store.pagination.meta.page,
        rowsPerPage: store.pagination.meta.perPage,
        rowsNumber: store.pagination.meta.totalPage,
      }"
    >
      <!-- <template v-slot:body-cell-open="props">
        <q-td :props="props">
          <q-btn
            color="primary"
            icon="las la-plus"
            dense
            round
            size="xs"
            @click="props.expand = !props.expand"
          />

        </q-td>
      </template> -->
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
    <div class="row footer-table justify-end items-center q-gutter-md q-px-md">
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
  </div>
</template>
<script setup>
import { useBalanceStore } from "src/stores/balance";
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { ref } from "vue";
import printButton from "src/components/global/print-button.vue";
import { columnsExtra } from "src/utils/columns/invoice";
const selected = ref([]);
const store = useBalanceStore();
const route = useRoute();
const fetchData = async () => {
  try {
    await store.index(
      {
        year: route.query.year,
        month: route.query.month,
        day: route.query.day,
      },
      route.params.category
    );
  } catch (error) {
    console.log(error.message);
  }
};
onMounted(() => {
  fetchData();
});
</script>
<style lang="scss" scoped>
.footer-table {
  position: fixed;
  bottom: 10px;
  right: 0;
  left: 0;
}
</style>
