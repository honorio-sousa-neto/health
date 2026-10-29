<template>
  <q-select
    v-model="invoiceStore.form.customer"
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
  <q-slide-transition>
    <div v-if="invoiceStore.form.customer.name">
      <q-checkbox
        left-label
        v-model="invoiceStore.form.asNormal"
        label="Não usar benefícios"
      />
      <div class="text-bold q-my-sm">Usar benefícios de...</div>
      <!-- {{ invoiceStore.form.beneficial }}
      <div>
        {{ invoiceStore.form.beneficial.split("@")[1] }}
      </div> -->
      <q-option-group
        v-model="invoiceStore.form.beneficial"
        color="primary"
        :options="optionsMode"
      />
    </div>
  </q-slide-transition>
</template>
<script setup>
import { computed, ref, watch } from "vue";
import { useCustomerStore } from "src/stores/customer";
import { useInvoiceStore } from "src/stores/invoice";
import { useSearch } from "src/composables/search";
import { api } from "src/boot/axios";
const { filter } = useSearch("customers");
const store = useCustomerStore();
const invoiceStore = useInvoiceStore();
const customerId = defineModel();
watch(
  () => invoiceStore.form.customer,
  (value) => {
    if (value) customerId.value = value.id;
  }
);
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
const isOnPeriod = (endDate) => {
  console.log(new Date());
  console.log(endDate);
  return new Date() <= new Date(endDate);
};
const optionsMode = computed(() => {
  const options = [];

  if (invoiceStore.form.customer.protocolId) {
    options.push({
      label: "Protocolo: " + invoiceStore.form.customer.protocol.name,
      value: "protocol",
    });
  }

  if (invoiceStore.form.customer.intern_insurance.length) {
    invoiceStore.form.customer.intern_insurance.forEach((intern, index) => {
      options.push({
        label: "Seguro interno: " + intern.intern.name,
        value: "intern" + "@" + intern.id,
        disable: !isOnPeriod(intern.endDate),
      });
    });
  }

  if (invoiceStore.form.customer.internInsuranceAggregate) {
    const internInsuranceAggregate =
      invoiceStore.form.customer.internInsuranceAggregate;
    options.push({
      label: "Seguro interno: " + internInsuranceAggregate.intern.name,
      value: "intern" + "@" + internInsuranceAggregate.id,
      disable: !isOnPeriod(internInsuranceAggregate.endDate),
    });
  }

  if (invoiceStore.form.customer.customersInsurance.length) {
    invoiceStore.form.customer.customersInsurance.forEach((ci) => {
      options.push({
        label: "Seguro externo: " + ci.insurance.name,
        value: "insurance@" + ci.insurance.id,
      });
    });
  }

  if (invoiceStore.form.customer.partnerId) {
    options.push({
      label: "Parceiro: " + invoiceStore.form.customer.Partner.name,
      value: "partner",
    });
  }

  return options;
});

const applyBenefitDiscount = (benefitValue) => {
  const c = invoiceStore.form.customer;
  invoiceStore.form.invoiceItems.forEach((item) => {
    if (benefitValue === "protocol") {
      const pct = c?.protocol?.value ?? 0;
      item.discount = Math.round(item.unit_price * (pct / 100));
    } else {
      item.discount = 0;
    }
  });
};

watch(
  () => invoiceStore.form.asNormal,
  (current) => {
    if (current) {
      invoiceStore.form.beneficial = null;
      applyBenefitDiscount(null);
    }
  }
);
watch(
  () => invoiceStore.form.beneficial,
  (current) => {
    if (current) {
      invoiceStore.form.asNormal = false;
    }
    applyBenefitDiscount(current);
  }
);
</script>
