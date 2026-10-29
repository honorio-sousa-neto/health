<template>
  <q-select
    v-model="customer"
    type="text"
    label="Pesquisa"
    standout="bg-teal-8 text-white"
    use-input
    dense
    option-label="name"
    option-value="id"
    input-debounce="500"
    @filter="filterFunction"
    :options="options"
    class="q-pr-sm"
  >
    <!-- <template v-slot:prepend>
      <q-btn
        color="teal-8 text-white"
        flat
        round
        dense
        icon="las la-plus"
        @click="isCreating = !isCreating"
      />
    </template> -->
  </q-select>
  <ViewCustomer :customer="customer" />
</template>
<script setup>
import { ref, watch } from "vue";
import { useCustomerStore } from "src/stores/customer";
import { useInvoiceStore } from "src/stores/invoice";
import ViewCustomer from "./ViewCustomer.vue";
import { useSearch } from "src/composables/search";
import { api } from "src/boot/axios";
const { filter } = useSearch("customers");
const store = useCustomerStore();
const invoiceStore = useInvoiceStore();
const customerId = defineModel();
const customer = ref({
  name: null,
});

watch(customer, (value) => {
  if (value) customerId.value = value.id;
});

const options = ref([]);
const filterFunction = async (val, update, abort) => {
  try {
    if (!val) return;
    update(async () => {
      const { data } = await api.get("customers/filter/search", {
        params: { search: val },
      });
      val = null;
      options.value = data.data;
    });
  } catch (error) {}
};
</script>
