<template>
  <Breadcrumbs>
    <template #children>
      <q-breadcrumbs-el
        label="Fluxo"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{ name: 'fluxo' }"
      />
    </template>
  </Breadcrumbs>

  <div class="q-pa-md row q-gutter-sm">
    <ButtonFancy
      v-for="bank in banks"
      :key="bank.id"
      :outline="currentBank !== bank.id"
      :label="bank.name"
      @click="updateData(bank.id)"
    />
  </div>

  <ViewResume
    v-bind="metrics"
    :destination="currentBank"
    :rows="rows"
    :query="query"
    @fetch-again="updateData(currentBank)"
    @page-change="onPageChange"
  />
</template>

<script setup>
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import { useCommom } from "src/composables/commom";
import { useFlow } from "src/composables/flow";
import { ref } from "vue";
import ButtonFancy from "./component/ButtonFancy.vue";
import ViewResume from "./component/ViewResume.vue";

const { query, tableData, rows, metrics, loadAll } = useFlow("flows");
const { data: banks } = useCommom("banks");

const currentBank = ref("Caixa");

const updateData = (destination) => {
  currentBank.value = destination;
  loadAll(destination);
};

const onPageChange = (page) => {
  query.page = page;
  tableData();
};
</script>
