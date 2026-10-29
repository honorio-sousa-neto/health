<template>
  <div style="height: calc(100vh - 56px)">
    <CreateDocument />
  </div>
</template>
<script setup>
import CreateDocument from "src/components/create-document/index.vue";
import { useFetch } from "src/composables/fetch";
import { computed, onMounted } from "vue";
import { SessionStorage } from "quasar";

const user = SessionStorage.getItem("alfavida_user");
const { index } = useFetch();

import { reactive, ref, watch } from "vue";
import { useAttendingStore } from "src/stores/attending";
import { useRoute } from "vue-router";
import { useInvoiceStore } from "src/stores/invoice";
const productsDialog = ref(false);
const invoice = ref([]);
const form = reactive({
  document: "FT",
  items: [],
  payment: "",
  emission_date: "",
  client: null,
  amount_received: null,
  source: null,
  attendant: user.id,
});

const text = ref(null);

const protocol = ref(0);
const insuranced = ref(false);
const invoices = ref([]);

const total = computed(() => {
  let result = 0;
  if (form.document == "FR" || "FT") {
    form.items.forEach((item) => {
      result += item.total * item.quantity;
    });
  } else if (form.document == "RC") {
    return invoice.value[0]?.total || 0;
  }
  return result;
});
watch(
  () => form.document,
  async (current) => {
    if (current == "RC") {
      await fetchInvoices();
    }
    // onReset();
    invoice.value = [];
  }
);

const fetchInvoices = async () => {
  const { data } = await index("documents/invoice");
  invoices.value = data;
};

watch(
  () => invoice,
  (current) => {
    if (current.value[0]?.total) {
      total.value = current.value[0]?.total;
      form.source = current.value[0]?.reference;
      form.items = current.value[0]?.items;
      form.client = current.value[0]?.client?._id;
    } else {
      // onReset();
    }
  },
  {
    deep: true,
  }
);

watch(
  () => form.client,
  (current) => {
    if (current) {
      form.items = [];
    }
  }
);

const onReset = () => {
  Object.assign(form, {
    document: "FT",
    items: [],
    payment: "",
    emission_date: "",
    client: null,
    amount_received: null,
    source: null,
    attendant: user.id,
  });
};

const saved = async () => {
  onReset();
  invoice.value = [];
  if (form.document == "RC") await fetchInvoices();
};

const isValid = computed(() => {
  if (form.document == "FT") {
    if (!form.items.length) return false;
    if (!form.client) return false;
    return true;
  } else if (form.document == "FR") {
    if (!form.payment) return false;
    if (!form.items.length) return false;
    if (!form.client) return false;
    if (form.amount_received < total.value) return false;
    return true;
  } else if (form.document == "RC") {
    if (!form.payment) return false;
    if (!form.source) return false;
    if (!form.amount_received) return false;
    if (form.amount_received < total.value) return false;
    return true;
  }
});

const onGetProtocol = (payload) => {
  protocol.value = payload.protocol;
  insuranced.value = payload.insuranced;
};
const storeAttending = useAttendingStore();
const route = useRoute();

const store = useInvoiceStore();
const fetchData = async () => {
  try {
    const { data } = await storeAttending.show(route.params.attendingId);

    store.onReset();
    store.form.customerId = data.data.customer;
    const exams = data.data.requests.length
      ? data.data.requests
      : data.data.consultation.requests;
    console.log(exams);
    store.form.invoiceItems = exams.map((item) => ({
      quantity: 1,
      total: item.exam.service.unit_price,
      discount: item.exam.service.discount,
      unit_price: item.exam.service.unit_price,
      name: item.exam.service.name,
      description: item.exam.service.description,
      id: item.exam.service.id,
    }));
  } catch (error) {
    console.log(error.message);
  }
};

store.form.emission_date = new Date(
  new Date().getTime() - new Date().getTimezoneOffset() * 60000
)
  .toISOString()
  .slice(0, 16);
onMounted(() => {
  if (route.params) {
    fetchData();
  }
});
</script>
