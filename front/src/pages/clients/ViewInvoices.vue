<template>
  <Breadcrumbs>
    <template #children>
      <q-breadcrumbs-el
        label="Clientes"
        active-class="text-h6 text-weight-regular text-teal-8"
        class="text-grey"
        :to="{ name: 'lista-clientes' }"
      />
      <q-breadcrumbs-el
        label="Contas"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{ name: 'ver-contas' }"
      />
    </template>
  </Breadcrumbs>
  <q-splitter v-model="splitterModel" style="height: calc(100vh - 60px)">
    <template v-slot:before>
      <div class="bg-grey-3 q-pa-md fit">
        <MyBenefits
          v-model="form.internId"
          @fetch="fetchAll"
          @fetch-others="fetchOthers"
        />
      </div>
    </template>
    <template v-slot:after>
      <div class="fit">
        <ViewOtherBenefits :loading v-bind="state" v-if="others" />
        <ViewBenefits :loading v-bind="state" v-else />
      </div>
    </template>
  </q-splitter>
</template>
<script setup>
import { api } from "src/boot/axios";
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import { useCreateUpdate } from "src/composables/create-update";
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import MyBenefits from "./components/MyBenefits.vue";
import ViewBenefits from "./components/ViewBenefits.vue";
import ViewOtherBenefits from "./components/ViewOtherBenefits.vue";

const splitterModel = ref(null);
const { fetchOne } = useCreateUpdate("customers");

const route = useRoute();
const loading = ref(false);
const pagination = reactive({
  page: route?.query?.page || 1,
  perPage: route?.query?.perPage || 15,
  search: route?.query?.search || "",
  totalPages: 1,
  total: 10,
});

let form = reactive({
  internId: null,
});

const customer = reactive({
  name: null,
  id: null,
});

const state = reactive({
  data: [],
  realCosts: [],
  totalRealCost: 0,
  customer: {
    name: null,
    order: "chief",
  },
});

const others = ref(false);
const map = {
  chief: "chief",
  1: "first",
  2: "second",
  3: "third",
  4: "afterThird",
};
const fetchAll = async ({
  startDate,
  endDate,
  customerId,
  internId,
  order,
}) => {
  loading.value = true;
  others.value = false;
  const {
    data: { message, success, data: response, meta },
  } = await api.get(`customers/accounts/${route.params.id}`, {
    params: {
      startDate,
      endDate,
      customerId,
      internId,
    },
  });
  loading.value = false;
  state.data.splice(0, state.data.length, ...response.items);
  state.realCosts.splice(0, state.realCosts.length, ...response.realCosts);
  state.totalRealCost = response.totalRealCost;
  state.customer = response.customer;
  state.customer.order = map[order];
};

const fetchOthers = async ({ customerId, type, source }) => {
  loading.value = true;
  others.value = true;
  const {
    data: { message, success, data: response, meta },
  } = await api.get(`customers/other-accounts/${route.params.id}`, {
    params: {
      type,
      source,
    },
  });
  loading.value = false;
  state.data.splice(0, state.data.length, ...response.items);
  state.realCosts.splice(0, state.realCosts.length, ...response.realCosts);
  state.totalRealCost = response.totalRealCost;
  state.customer = response.customer;
};

const fetchCustomer = async () => {
  const response = await fetchOne(route.params.id);
  Object.assign(customer, response);
};

onMounted(async () => {
  await fetchCustomer();
  // fetchAll();
});
</script>
