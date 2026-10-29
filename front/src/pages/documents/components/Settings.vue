<template>
  <q-card square class="q-px-md" flat>
    <q-separator spaced v-if="$q.screen.lt.md" />
    <div class="q-mb-md">
      <q-input
        dense
        standout="text-bold"
        v-model="invoiceStore.form.emission_date"
        type="datetime-local"
        class="q-mb-md"
        label="Data de emissão"
        :disable="user.role != 'admin'"
      >
      </q-input>
      <Payment v-model:payment="invoiceStore.form.paymentId" />
      <q-input
        v-if="invoiceStore.form.type == 'NC'"
        class="q-mt-md"
        v-model="invoiceStore.form.reasonInssuance"
        type="text"
        label="Motivo de emissão"
        standout="text-bold"
        dense
      />
    </div>
    <div class="">
      <div class="text-body1 text-bold q-mb-sm">Totais</div>

      <div class="row q-gutter-md">
        <div class="col-5">Subtotal</div>
        <div class="text-bold">
          {{
            new Intl.NumberFormat("de-DE", {
              currency: "AOA",
              style: "currency",
            }).format(total)
          }}
        </div>
      </div>
      <div class="row q-gutter-md">
        <div class="col-5">Desconto</div>
        <div class="text-bold">
          {{
            new Intl.NumberFormat("de-DE", {
              currency: "AOA",
              style: "currency",
            }).format(discount)
          }}
        </div>
      </div>

      <div class="row q-gutter-md">
        <div class="col-5">Total a pagar</div>
        <div class="text-bold">
          {{
            new Intl.NumberFormat("de-DE", {
              currency: "AOA",
              style: "currency",
            }).format(total - discount)
          }}
        </div>
      </div>

      <div v-if="['FR', 'RC'].includes(invoiceStore.form.type)">
        <div
          v-if="
            invoiceStore.form.customer.parentId ||
            invoiceStore.form.customer.internId
          "
          class="q-mt-sm"
        >
          <q-input
            outlined
            dense
            v-model.number="invoiceStore.form.co_payment"
            type="number"
            min="1"
            class="text-white"
            step="0.001"
            standout="text-white bg-teal-8"
            label="Co-pagamento"
          />
        </div>
        <div class="q-mt-sm" v-else>
          <q-input
            outlined
            dense
            v-model.number="invoiceStore.form.amount_received"
            type="number"
            min="1"
            class="text-white"
            step="0.001"
            standout="text-white bg-teal-8"
            label="Montante entregue"
          />
        </div>
      </div>

      <div v-if="['admin'].includes(user.role)" class="row q-gutter-sm q-mt-sm">
        <q-radio v-model="shape" val="termal" label="Impressora térmica" />
        <q-radio v-model="shape" val="a4" label="A4" />
      </div>
      <div class="row q-gutter-sm q-mt-sm">
        <q-btn
          outline
          color="teal-8"
          class="col"
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
import { ref, watch, computed } from "vue";
import { useInvoiceStore } from "src/stores/invoice";
import { showNotify } from "src/utils/notify";
import { api } from "src/boot/axios";
import { useInvoice } from "src/composables/invoice";
import Payment from "./Payment.vue";
const { total, discount } = useInvoice();
import { SessionStorage } from "quasar";
import { useRoute, useRouter } from "vue-router";
import { useAttendingStore } from "src/stores/attending";

const shape = ref("termal");
const user = SessionStorage.getItem("alfavida_user");
const invoiceStore = useInvoiceStore();

const isValid = () => {
  if (invoiceStore.form.type == "FT" || invoiceStore.form.type == "FR") {
    if (invoiceStore.form.invoiceItems.length <= 0) {
      showNotify(
        "Insira pelo menos um item a lista de serviços/produtos",
        false
      );
      return false;
    }
    // if (itensNotCoveredByInternInsurance.value > invoiceStore.form.co_payment) {
    //   showNotify(
    //     "Valor inserido deve ser igual ao superior ao co-pagamento",
    //     false
    //   );
    //   return false;
    // }
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
    if (
      invoiceStore.form.amount_received < total.value - discount.value &&
      !(
        invoiceStore.form.customer.internId ||
        invoiceStore.form.customer.parentId
      )
    ) {
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
  let group = {
    insuranceId: null,
    protocolId: null,
    partnerId: null,
    internId: null,
  };

  if (invoiceStore.form.beneficial?.includes("intern")) {
    group.internId = invoiceStore.form.beneficial?.split("@")[1];
    invoiceStore.form.asNormal = false;
  }

  if (invoiceStore.form.beneficial?.startsWith("insurance")) {
    group.insuranceId = invoiceStore.form.beneficial.split("@")[1];
    invoiceStore.form.asNormal = false;
  }

  if (invoiceStore.form.beneficial == "partner") {
    group.partnerId = invoiceStore.form.customer.partnerId;
    invoiceStore.form.asNormal = false;
  }

  if (invoiceStore.form.beneficial == "protocol") {
    group.protocolId = invoiceStore.form.customer.protocolId;
    invoiceStore.form.asNormal = false;
  }

  Object.assign(form, invoiceStore.form);

  form.invoiceItems = invoiceStore.form.invoiceItems.map((item) => ({
    serviceId: item.id,
    total: (item.total - item.discount) * item.quantity,
    price: item.unit_price,
    quantity: item.quantity,
    discount: item.discount,
  }));
  // form.customerId = invoiceStore.form.customerId;
  // form.emission_date = invoiceStore.form.emission_date;

  if (invoiceStore.form.type != "FR" && invoiceStore.form.type != "RC") {
    form.paymentId = null;
  } else {
    form.paymentId = invoiceStore.form.paymentId.id;
  }

  form.discount = discount.value;
  form.total = total.value - discount.value;
  form.asNormal = invoiceStore.form.asNormal;
  const { success, data } = await invoiceStore.create({
    ...form,
    ...group,
    medicalConsultationId: route.params.medicalConsultationId,
  });
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
    if (route.params.id) router.go(-1);
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
    bank: null,
    asNormal: false,
  };
  form.amount_received = invoiceStore.form.amount_received;
  form.invoiceId = invoiceStore.currentInvoice.id;
  form.paymentId = invoiceStore.form.paymentId.id;
  form.type = invoiceStore.form.type;
  form.userId = invoiceStore.form.userId;
  form.total = invoiceStore.currentInvoice.total;
  form.emission_date = invoiceStore.form.emission_date;
  form.emission_date = invoiceStore.form.emission_date;
  form.bank = invoiceStore.form.bank;
  form.asNormal = invoiceStore.form.asNormal;
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

const countExams = (item, boundary) => {
  let total = 0;
  if (item.exam) {
    if (item.unit_price > boundary) {
      total = total + (item.unit_price - boundary) * item.quantity;
    }
  }
  return total;
};

const countEnf = (item, tax) => {
  let total = 0;
  if (item.Hospitalization) {
    total = item.unit_price * (tax / 100);
  }
  return total;
};

const itensNotCoveredByInternInsurance = computed(() => {
  let total = 0;
  if (
    invoiceStore.form.customer.intern_insurance ||
    invoiceStore.form.customer.internInsuranceAggregate
  ) {
    const intern =
      invoiceStore.form.customer.intern_insurance.intern ||
      invoiceStore.form.customer.internInsuranceAggregate.intern;
    if (!invoiceStore.form.invoiceItems.length) return 0;
    invoiceStore.form.invoiceItems.forEach((item) => {
      if (intern.lab) {
        total = total + countExams(item, intern.examBoundary);
      } else {
        if (item.category == "LAB")
          total = total + item.unit_price * item.quantity;
      }
      if (intern.enf) {
        total = total + countEnf(item, intern.internTax);
      } else {
        if (item.category == "ENF")
          total = total + item.unit_price * item.quantity;
      }
      if (intern.rx) {
        total = total + 0;
      } else {
        if (item.category == "ECO" || item.category == "RX")
          total = total + item.unit_price * item.quantity;
      }
      if (intern.far) {
        total = total + 0;
      } else {
        if (item.category == "FAR")
          total = total + item.unit_price * item.quantity;
      }
    });

    return total;
  }
  return total;
});
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
