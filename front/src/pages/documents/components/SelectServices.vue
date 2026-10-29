<template>
  <div class="q-mt-md">
    <q-input
      v-model="filter"
      standout="bg-teal-8 text-white"
      type="text"
      label="Pesquisar..."
    />
  </div>
  <q-scroll-area style="width: 100%; height: 480px">
    <OptionsGroup v-bind:rows="services" v-model:selected="selected" :filter />
  </q-scroll-area>
  <q-btn
    class="q-my-md"
    color="primary"
    icon="las la-check"
    label="Concluir"
    @click="addToTable"
  />
</template>
<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { useCreateUpdate } from "src/composables/create-update";
import OptionsGroup from "src/pages/seguradoras-internas/components/OptionsGroup.vue";
import { useInvoiceStore } from "src/stores/invoice";
import { Notify } from "quasar";
const { fetchOne } = useCreateUpdate("signings");
const emit = defineEmits(["selected"]);
const filter = ref(null);
const props = defineProps({
  id: {
    type: String,
  },
});

const services = ref([]);
const intern = reactive({
  name: null,
  description: null,
  internTax: null,
});
const selected = ref([]);
const fetchData = async () => {
  const response = await fetchOne(props.id);
  services.value = response.intern.services;
  Object.assign(intern, response.intern);
};
onMounted(() => {
  fetchData();
});
const invoiceStore = useInvoiceStore();
const addToTable = () => {
  selected.value.forEach((item) => {
    const exists = invoiceStore.form.invoiceItems.find(
      (it) => item.id == it.id
    );
    if (
      invoiceStore.form.invoiceItems.find((i) =>
        i.name.toLowerCase().includes("internamento")
      )
    ) {
      Notify.create({
        message: "Internamento deve ser faturado a parte",
        type: "info",
        position: "top-right",
      });
      return;
    }
    if (
      invoiceStore.form.invoiceItems.length &&
      item.name.toLowerCase().includes("internamento")
    ) {
      Notify.create({
        message: "Internamento deve ser faturado a parte",
        type: "info",
        position: "top-right",
      });
      return;
    }
    if (!exists) {
      const internTax = intern.internTax;

      invoiceStore.form.invoiceItems.push({
        quantity: 1,
        total: item.unit_price,
        discount: item.name.toLowerCase().includes("internamento")
          ? Number(item.unit_price * ((100 - internTax) / 100).toFixed(2))
          : item.discount,
        unit_price: item.unit_price,
        name: item.name,
        description: item.description,
        id: item.id,
      });
    }
  });
  emit("selected");
};
</script>
