<template>
  <div class="sett-wrap">

    <!-- Fields row -->
    <div class="sett-fields">
      <div class="sett-field">
        <q-select
          v-model="invoiceStore.form.type"
          :options="documents"
          label="Tipo de documento"
          class="fi" borderless map-options emit-value
          popup-content-class="fi-popup"
        />
      </div>
      <div class="sett-field">
        <q-input
          class="fi" borderless stack-label
          v-model="invoiceStore.form.emission_date"
          type="datetime-local"
          label="Data de emissão"
          :disable="user.role != 'admin'"
        />
      </div>
      <div class="sett-field">
        <Payment v-model:payment="invoiceStore.form.paymentId" />
      </div>
      <q-slide-transition>
        <div v-if="showBankSelect" class="sett-field">
          <q-select
            v-model="invoiceStore.form.bank"
            :options="bankStore.data.data"
            option-label="name"
            option-value="id"
            emit-value map-options
            label="Conta bancária"
            class="fi" borderless
            popup-content-class="fi-popup"
            :loading="loadingBanks"
          >
            <template #selected-item="scope">
              <span style="font-size: var(--fs-body); color:var(--text)">
                {{ scope.opt?.name?.length > 12 ? scope.opt.name.slice(0, 12) + '…' : scope.opt?.name }}
              </span>
            </template>
          </q-select>
        </div>
      </q-slide-transition>
      <q-slide-transition>
        <div v-if="showAmountField" class="sett-field">
          <q-input
            v-if="invoiceStore.form.customer.parentId || invoiceStore.form.customer.internId"
            class="fi" borderless
            v-model.number="invoiceStore.form.co_payment"
            type="number" min="1" step="0.001"
            label="Co-pagamento"
          />
          <q-input
            v-else
            class="fi" borderless
            v-model.number="invoiceStore.form.amount_received"
            type="number" min="1" step="0.001"
            label="Montante entregue"
          />
        </div>
      </q-slide-transition>
      <q-slide-transition>
        <div v-if="showDocumentReference" class="sett-field">
          <q-select
            v-model="invoiceStore.form.invoiceId"
            class="fi" borderless use-input
            option-label="reference"
            input-debounce="500"
            @filter="filterFunction"
            :options="refOptions"
            @update:model-value="fetchRefData"
            popup-content-class="fi-popup"
            label="Referência do documento"
          />
        </div>
      </q-slide-transition>
      <q-slide-transition>
        <div v-if="showReasonField" class="sett-field">
          <q-input
            class="fi" borderless
            v-model="invoiceStore.form.reasonInssuance"
            label="Motivo de emissão"
          />
        </div>
      </q-slide-transition>
    </div>

    <!-- Summary panel -->
    <div class="sett-bar">

      <!-- Subtotal + Desconto -->
      <div class="sum-rows">
        <div class="sum-row">
          <span class="sum-row__label">Subtotal</span>
          <span class="sum-row__val">{{ fmt(total) }}</span>
        </div>
        <div class="sum-row">
          <span class="sum-row__label">Desconto</span>
          <span class="sum-row__val sum-row__val--neg">-{{ fmt(discount) }}</span>
        </div>
      </div>

      <!-- Total (fills remaining space) -->
      <div class="sum-total">
        <span class="sum-total__label">Total a pagar</span>
        <span class="sum-total__val">{{ fmt(total - discount) }}</span>
      </div>

      <!-- Actions -->
      <div class="sett-actions">
        <div v-if="user.role === 'admin'" class="sett-print">
          <q-radio v-model="shape" val="termal" label="Térmica" dense color="primary" />
          <q-radio v-model="shape" val="a4" label="A4" dense color="primary" />
        </div>
        <q-btn
          v-if="showInvoiceSubmit || showReceiptSubmit"
          unelevated no-caps
          color="primary"
          icon="las la-file-invoice"
          label="Emitir"
          class="emit-btn full-width"
          @click="showInvoiceSubmit ? onSubmit() : onSubmitReceipt()"
          :loading="invoiceStore.loadings.loadingCreate"
        />
      </div>

    </div>

  </div>
</template>

<script setup>
import { openProtectedFile } from "src/utils/protected-file";
import { SessionStorage } from "quasar";
import { api } from "src/boot/axios";
import { useInvoice } from "src/composables/invoice";
import { useSearch } from "src/composables/search";
import { useInvoiceStore } from "src/stores/invoice";
import { useBankStore } from "src/stores/bank";
import { showNotify } from "src/utils/notify";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Payment from "../components/Payment.vue";

const { total, discount } = useInvoice();
const shape = ref("termal");
const user = SessionStorage.getItem("alfavida_user");
const invoiceStore = useInvoiceStore();
const bankStore = useBankStore();
const loadingBanks = ref(false);

const showBankSelect = computed(() => {
  if (!["FR", "RC"].includes(invoiceStore.form.type)) return false;
  const p = invoiceStore.form.paymentId;
  if (!p?.id) return false;
  return p.code !== "D";
});
const showAmountField = computed(() =>
  ["FR", "RC"].includes(invoiceStore.form.type),
);
const showDocumentReference = computed(() =>
  ["RC", "NC", "ND"].includes(invoiceStore.form.type),
);
const showReasonField = computed(() => invoiceStore.form.type === "NC");
const showDocumentDetails = computed(
  () => showDocumentReference.value || showReasonField.value,
);
const showSecondaryRow = computed(
  () => showDocumentDetails.value || user.role === "admin",
);
const showInvoiceSubmit = computed(() =>
  ["FT", "FR", "PP"].includes(invoiceStore.form.type),
);
const showReceiptSubmit = computed(() =>
  ["RC", "NC"].includes(invoiceStore.form.type),
);

onMounted(async () => {
  loadingBanks.value = true;
  await bankStore.index();
  loadingBanks.value = false;
});

const { filter: filterSearch } = useSearch("invoices");
const documents = computed(() => {
  let items = [
    { label: "Factura", value: "FT" },
    { label: "Factura-Recibo", value: "FR" },
    { label: "Proforma", value: "PP" },
  ];
  if (user.role == "admin") {
    items = items.concat([
      { label: "Recibo", value: "RC" },
      { label: "Nota de crédito", value: "NC" },
      { label: "Nota de débito", value: "ND" },
    ]);
  }
  return items;
});
const refOptions = ref([]);
const filterFunction = async (val, update) => {
  try {
    if (!val) return;
    update(async () => {
      const data = await filterSearch(val);
      refOptions.value = data;
    });
  } catch (error) {}
};
const fetchRefData = (val) => {
  Object.assign(invoiceStore.currentInvoice, val);
};

const fmt = (val) =>
  new Intl.NumberFormat("de-DE", { currency: "AOA", style: "currency" }).format(
    val,
  );

const isValid = () => {
  if (["FT", "FR"].includes(invoiceStore.form.type)) {
    if (!invoiceStore.form.invoiceItems.length) {
      showNotify("Insira pelo menos um item", false);
      return false;
    }
    if (!invoiceStore.form.customer.id) {
      showNotify("Insira um cliente", false);
      return false;
    }
  }
  if (["FR", "RC"].includes(invoiceStore.form.type)) {
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
  }
  return true;
};

const router = useRouter();
const route = useRoute();

const onSubmit = async () => {
  if (!isValid()) return;
  const group = {
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

  const form = { ...invoiceStore.form };
  form.invoiceItems = invoiceStore.form.invoiceItems.map((item) => ({
    serviceId: item.id,
    total: (item.total - item.discount) * item.quantity,
    price: item.unit_price,
    quantity: item.quantity,
    discount: item.discount,
    config: item.config,
  }));
  form.paymentId = ["FR", "RC"].includes(invoiceStore.form.type)
    ? (invoiceStore.form.paymentId?.id ?? null)
    : null;
  form.discount = discount.value;
  form.total = total.value - discount.value;
  form.asNormal = invoiceStore.form.asNormal;
  form.customerId = invoiceStore.form.customer.id;
  form.isAmbulatory = !!route.params.prescriptionId;

  const { success, data } = await invoiceStore.create({
    ...form,
    ...group,
    medicalConsultationId: route.params.medicalConsultationId,
  });
  if (!success) return;

  if (route.params.medicalConsultationId)
    await api.patch("request-exams/" + route.params.medicalConsultationId, {
      exams: form.invoiceItems.map((i) => i.serviceId),
    });
  if (route.params.surgeryId)
    await api.patch("surgeries/" + route.params.surgeryId, {
      paid: true,
      customerId: form.customerId,
    });
  if (route.params.administrationId)
    await api.patch("administrations/" + route.params.administrationId, {
      paid: true,
      customerId: form.customerId,
    });
  if (route.params.prescriptionId || route.params.pharmacyId)
    await api.patch(
      "prescriptions/" +
        (route.params.prescriptionId || route.params.pharmacyId),
      { paid: true },
    );
  if (route.params.prescriptionId && form.customerId) {
    try {
      await api.post("ambulatory-plans", {
        prescriptionId: route.params.prescriptionId,
        customerId: form.customerId,
      });
    } catch (_) {}
    const consultationId = invoiceStore.form.ambulatoryConsultationId;
    if (consultationId) {
      try {
        const { data: cData } = await api.get(`consultations/${consultationId}`);
        const consultation = cData?.data;
        if (consultation && consultation.status !== "done") {
          await api.patch(`consultations/${consultationId}`, {
            status: "done",
            diagnosis: consultation.diagnosis || "Ambulatório",
          });
        }
      } catch (_) {}
    }
  }
  if (route.params.observationId)
    await api.patch(`observations/${route.params.observationId}`, {
      paid: true,
    });
  if (success) {
    if (route.query.externalCustomerId) {
      try {
        await api.post("request-exams/external", {
          customerId: route.query.externalCustomerId,
          exams: form.invoiceItems.map((i) => i.serviceId),
          paid: true,
        });
      } catch (_) {}
    }
    const url =
      shape.value == "termal"
        ? api.defaults.baseURL + `/reports/termal/printing/${data.id}`
        : api.defaults.baseURL + `/reports/${data.id}`;
    openProtectedFile(url, "_blank", "noreferrer");
    if (route.params.id || route.query.externalCustomerId) router.go(-1);
  }
};

const onSubmitReceipt = async () => {
  if (!isValid()) return;
  const { success, data } = await invoiceStore.create({
    amount_received: invoiceStore.form.amount_received,
    invoiceId: invoiceStore.currentInvoice.id,
    paymentId: invoiceStore.form.paymentId?.id ?? null,
    type: invoiceStore.form.type,
    userId: invoiceStore.form.userId,
    total: invoiceStore.currentInvoice.total,
    emission_date: invoiceStore.form.emission_date,
    bank: invoiceStore.form.bank,
    asNormal: invoiceStore.form.asNormal,
    isAmbulatory: !!route.params.prescriptionId,
    reasonInssuance:
      invoiceStore.form.type == "NC" ? invoiceStore.form.reasonInssuance : "",
  });
  if (!success) return;
  if (success) {
    const url =
      shape.value == "termal"
        ? api.defaults.baseURL + `/reports/termal/printing/${data.id}`
        : api.defaults.baseURL + `/reports/${data.id}`;
    openProtectedFile(url, "_blank", "noreferrer");
  }
};
</script>

<style scoped lang="scss">
// ── Wrapper ──────────────────────────────────────────────────────
.sett-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

// ── Fields row ───────────────────────────────────────────────────
.sett-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-end;
  flex-shrink: 0;
}

.sett-field {
  flex: 1 1 160px;
  min-width: 140px;
}

// ── Summary panel ────────────────────────────────────────────────
.sett-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--st-ok-tint);
  border: 1.5px solid #d1fae5;
  border-radius: var(--r-control);
  overflow: hidden;
  min-height: 0;
}

.sum-rows {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-bottom: 1px solid #d1fae5;
}

.sum-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sum-row__label {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 500;
  color: var(--st-ok-text);
}

.sum-row__val {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text-3);

  &--neg { color: var(--danger); }
}

.sum-total {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px;
}

.sum-total__label {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--st-ok-text);
}

.sum-total__val {
  font-size: 26px;
  font-weight: 800;
  color: var(--st-ok-text);
  line-height: 1.2;
  text-align: center;
  overflow-wrap: anywhere;
}

// ── Actions ──────────────────────────────────────────────────────
.sett-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #d1fae5;
}

// ── Emit button ──────────────────────────────────────────────────
.emit-btn {
  border-radius: var(--r-sm);
  font-size: var(--fs-body); line-height: var(--lh-body);
  font-weight: 600;
  min-height: 44px;
}

// ── Print radios ─────────────────────────────────────────────────
.sett-print {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px 10px;
  background: var(--st-ok-tint);
  border: 1px solid #a7f3d0;
  border-radius: var(--r-sm);
  font-size: var(--fs-label); line-height: var(--lh-tight);

  :deep(.q-radio__label) {
    color: var(--text-3);
    font-size: var(--fs-label); line-height: var(--lh-tight);
  }
}

// ── Misc ─────────────────────────────────────────────────────────
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

// ── Responsive ───────────────────────────────────────────────────
@media (max-width: 900px) {
  .sett-wrap { grid-template-columns: repeat(2, 1fr); }
  .sett-summary { grid-column: 1 / -1; }

  .sum-card {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: stretch;
  }

  .sum-card__head { width: 100%; flex-shrink: 0; }

  .sum-rows {
    flex: 1;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    padding: 14px 14px;
    gap: 10px 20px;
  }

  .sum-row { flex-direction: column; align-items: flex-start; gap: 1px; }
  .sum-divider { display: none; }

  .sum-total {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    gap: 8px;
    border-left: 1.5px solid rgba(50, 185, 137, 0.3);
  }

  .sett-actions {
    width: 100%;
    padding: 10px 14px;
    background: var(--surface-3);
    border-top: 1.5px solid var(--border);
    flex-direction: row;
    gap: 10px;
  }

  .emit-btn { flex: 1; }
}

@media (max-width: 600px) {
  .sett-wrap { grid-template-columns: 1fr; }
  .sett-section__body { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .sett-section__body { grid-template-columns: 1fr; }
}
</style>
