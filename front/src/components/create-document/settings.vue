<template>
  <q-card square class="q-pa-md" flat>
    <q-separator spaced v-if="$q.screen.lt.md" />
    <div class="q-mb-md">
      <q-input
        dense
        standout="bg-teal-8 text-white"
        v-model="invoiceStore.form.emission_date"
        type="datetime-local"
        class="q-mb-md"
        label="Data de emissão"
        :disable="user.role != 'admin'"
      >
      </q-input>
      <payment v-model:payment="invoiceStore.form.paymentId" />
      <q-input
        v-if="invoiceStore.form.type == 'NC'"
        class="q-mt-md"
        v-model="invoiceStore.form.reasonInssuance"
        type="text"
        label="Motivo de emissão"
        standout="bg-teal-8 text-white"
        dense
      />
    </div>
    <div class="">
      <div class="q-ml-sm text-body1 text-bold q-mb-sm">Totais</div>
      <q-list bordered separator>
        <q-item v-ripple class="bg-grey-6 text-white q-pa-none">
          <q-item-section class="q-pa-md"> Subtotal </q-item-section>
          <q-item-section class="bg-teal-8 text-white q-pa-md">
            {{
              new Intl.NumberFormat("de-DE", {
                currency: "AOA",
                style: "currency",
              }).format(total)
            }}
          </q-item-section>
        </q-item>
        <q-item v-ripple class="bg-grey-6 text-white q-pa-none">
          <q-item-section class="q-pa-md"> Desconto </q-item-section>
          <q-item-section class="bg-teal-8 text-white q-pa-md">
            {{
              new Intl.NumberFormat("de-DE", {
                currency: "AOA",
                style: "currency",
              }).format(discount)
            }}
          </q-item-section>
        </q-item>
        <q-item v-ripple class="bg-grey-6 text-white q-pa-none">
          <q-item-section class="q-pa-md"> Total a pagar </q-item-section>
          <q-item-section class="bg-teal-8 text-white q-pa-md">
            {{
              new Intl.NumberFormat("de-DE", {
                currency: "AOA",
                style: "currency",
              }).format(total - discount)
            }}
          </q-item-section>
        </q-item>

        <q-item
          v-if="['FR', 'RC'].includes(invoiceStore.form.type)"
          v-ripple
          class="bg-grey-6 text-white q-pa-none"
        >
          <q-item-section class="q-pa-md"> Pago </q-item-section>
          <q-item-section class="bg-teal-8 text-white q-px-md">
            <q-input
              borderless
              dense
              v-model.number="invoiceStore.form.amount_received"
              type="number"
              label="Digite aqui..."
              min="1"
              step="0.001"
              standout="text-white"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <div v-if="['admin'].includes(user.role)" class="row q-gutter-sm q-mt-sm">
        <q-radio v-model="shape" val="termal" label="Impressora térmica" />
        <q-radio v-model="shape" val="a4" label="A4" />
      </div>
      <div class="row q-gutter-sm q-mt-sm">
        <q-btn
          class="col"
          color="red-8"
          outline
          icon="las la-ban"
          label="Cancelar"
          @click="onClick"
        />
        <q-btn
          class="col"
          color="teal-8"
          icon="las la-save"
          label="Salvar"
          v-if="['FT', 'FR', 'PP'].includes(invoiceStore.form.type)"
          @click="onSubmit"
          :loading="invoiceStore.loadings.loadingCreate"
        />
        <q-btn
          v-if="
            invoiceStore.form.type == 'RC' || invoiceStore.form.type == 'NC'
          "
          class="col"
          color="teal-8"
          icon="las la-save"
          label="Salvar"
          @click="onSubmitReceipt"
          :loading="invoiceStore.loadings.loadingCreate"
        />
      </div>
    </div>
  </q-card>
</template>
<script setup>
import { openProtectedFile } from "src/utils/protected-file";
import { computed, ref } from "vue";
import payment from "./payment.vue";
import { useInvoiceStore } from "src/stores/invoice";
import { showNotify } from "src/utils/notify";
import { api } from "src/boot/axios";

import { SessionStorage } from "quasar";
import { useRoute, useRouter } from "vue-router";
import { useAttendingStore } from "src/stores/attending";

const shape = ref("termal");
const user = SessionStorage.getItem("alfavida_user");

const invoiceStore = useInvoiceStore();
const total = computed(() => {
  let res = 0;
  if (
    invoiceStore.form.type == "PP" ||
    invoiceStore.form.type == "FT" ||
    invoiceStore.form.type == "FR"
  )
    invoiceStore.form.invoiceItems.forEach(
      (item) => (res += item.unit_price * item.quantity)
    );

  if (invoiceStore.form.type == "RC")
    return (
      invoiceStore.currentInvoice.total + invoiceStore.currentInvoice.discount
    );
  return res;
});
const discount = computed(() => {
  let res = 0;
  if (
    invoiceStore.form.type == "PP" ||
    invoiceStore.form.type == "FT" ||
    invoiceStore.form.type == "FR"
  ) {
    invoiceStore.form.invoiceItems.forEach(
      (item) => (res += item.discount * item.quantity)
    );
  }
  if (invoiceStore.form.type == "RC")
    return invoiceStore.currentInvoice.discount;
  return res;
});

const isValid = () => {
  if (invoiceStore.form.type == "FT" || invoiceStore.form.type == "FR") {
    if (invoiceStore.form.invoiceItems.length <= 0) {
      showNotify(
        "Insira pelo menos um item a lista de serviços/produtos",
        false
      );
      return false;
    }
    if (!invoiceStore.form.customerId) {
      showNotify("Insira um cliente", false);
      return false;
    }
  }

  if (invoiceStore.form.type == "FR" || invoiceStore.form.type == "RC") {
    if (!invoiceStore.form.paymentId) {
      showNotify("Insira o método de pagamento", false);
      return false;
    }
    if (invoiceStore.form.amount_received < total.value - discount.value) {
      showNotify("Insira um montante válido", false);
      return false;
    }
    if (invoiceStore.form.paymentId.code !== "D" && !invoiceStore.form.bank) {
      showNotify("Informe a conta", false);
      return false;
    }
  }

  return true;
};
const router = useRouter();
const route = useRoute();
const storeAttending = useAttendingStore();
const onSubmit = async () => {
  if (!isValid()) return;
  let form = {};

  Object.assign(form, invoiceStore.form);

  form.invoiceItems = invoiceStore.form.invoiceItems.map((item) => ({
    serviceId: item.id,
    total: (item.total - item.discount) * item.quantity,
    price: item.unit_price,
    quantity: item.quantity,
    discount: item.discount,
  }));
  form.customerId = invoiceStore.form.customerId.id;
  form.emission_date = invoiceStore.form.emission_date;
  if (invoiceStore.form.type != "FR" && invoiceStore.form.type != "RC") {
    form.paymentId = null;
  } else {
    form.paymentId = invoiceStore.form.paymentId.id;
  }

  form.discount = discount.value;
  form.total = total.value - discount.value;

  const { success, data } = await invoiceStore.create(form);
  if (!success) return;
  if (success) {
    if (route.params.attendingId) {
      storeAttending.update({ stage: "EXAM" }, route.params.attendingId);
      router.go(-1);
    }
    if (shape.value == "termal") {
      openProtectedFile(
        api.defaults.baseURL + `/reports/termal/printing/${data.id}`,
        "_blank",
        "noreferrer"
      );
    } else {
      openProtectedFile(
        api.defaults.baseURL + `/reports/${data.id}`,
        "_blank",
        "noreferrer"
      );
    }
  }
};

const onSubmitReceipt = async () => {
  if (!isValid()) return;
  let form = {
    amount_received: 0,
    invoiceId: null,
    paymentId: null,
    type: null,
    userId: null,
    total: 0,
    reasonInssuance: "",
  };
  form.amount_received = invoiceStore.form.amount_received;
  form.invoiceId = invoiceStore.currentInvoice.id;
  form.paymentId = invoiceStore.form.paymentId.id;
  form.type = invoiceStore.form.type;
  form.userId = invoiceStore.form.userId;
  form.total = invoiceStore.currentInvoice.total;
  form.emission_date = invoiceStore.form.emission_date;
  form.emission_date = invoiceStore.form.emission_date;
  if (invoiceStore.form.type == "NC") {
    form.reasonInssuance = invoiceStore.form.reasonInssuance;
  }
  const { success, data } = await invoiceStore.create(form);
  if (!success) return;

  if (success) {
    if (shape.value == "termal") {
      openProtectedFile(
        api.defaults.baseURL + `/reports/termal/printing/${data.id}`,
        "_blank",
        "noreferrer"
      );
    } else {
      openProtectedFile(
        api.defaults.baseURL + `/reports/${data.id}`,
        "_blank",
        "noreferrer"
      );
    }
  }
  // alert(JSON.stringify(form));
};
</script>
<style>
/* Estilos para esconder os botões no Chrome, Safari, Edge, Opera */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Estilos para esconder os botões no Firefox */
</style>
