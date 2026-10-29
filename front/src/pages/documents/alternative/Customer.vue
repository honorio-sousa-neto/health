<template>
  <div class="cust-root">

    <!-- Search -->
    <q-select
      v-model="invoiceStore.form.customer"
      label="Pesquisar cliente…"
      class="fi"
      borderless
      use-input
      option-label="name"
      option-value="id"
      input-debounce="500"
      @filter="filterFunction"
      :options="options"
      popup-content-class="fi-popup"
    />

    <!-- Customer card + benefits -->
    <q-slide-transition>
      <div v-if="invoiceStore.form.customer?.name" class="q-mt-sm">

        <!-- Mini customer info row -->
        <div class="cust-info-row">
          <q-icon name="las la-user-circle" size="15px" class="cust-info-icon" />
          <span class="cust-info-name">{{ invoiceStore.form.customer.name }}</span>
          <span v-if="invoiceStore.form.customer.phone" class="cust-info-sep">·</span>
          <span v-if="invoiceStore.form.customer.phone" class="cust-info-phone">
            {{ invoiceStore.form.customer.phone }}
          </span>
        </div>

        <!-- Benefit chips -->
        <div v-if="allBenefits.length > 1" class="q-mt-sm">
          <div class="benefit-section-label">Faturar como</div>
          <div class="benefit-chips-row">
            <button
              v-for="opt in allBenefits"
              :key="opt.value"
              class="bchip"
              :class="[`bchip--${opt.type}`, { 'bchip--on': activeBenefit === opt.value }]"
              :disabled="opt.disabled"
              @click="selectBenefit(opt)"
            >
              <q-icon :name="opt.icon" size="12px" />
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Fallback when no benefits exist -->
        <div v-else class="q-mt-xs">
          <q-checkbox
            left-label dense color="primary"
            v-model="invoiceStore.form.asNormal"
            label="Sem benefícios"
            style="font-size: var(--fs-label); color:var(--text-muted)"
          />
        </div>
      </div>
    </q-slide-transition>

    <!-- Attendance + Clinical process — two columns -->
    <q-slide-transition>
      <div v-if="invoiceStore.form.customer?.id" class="assoc-grid q-mt-sm">

        <!-- Atendimento -->
        <div>
          <div class="assoc-label">
            <q-icon name="las la-hospital-alt" size="12px" style="color: var(--st-info)" />
            Atendimento
            <span class="assoc-opt">(opcional)</span>
          </div>
          <q-select
            v-model="invoiceStore.form.attendanceId"
            :options="attendanceOptions"
            option-value="id"
            option-label="label"
            emit-value map-options clearable
            class="fi" borderless
            placeholder="Selecionar…"
            :loading="loadingAttendances"
            popup-content-class="fi-popup"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label style="font-size: var(--fs-body); font-weight:600">{{ scope.opt.reference }}</q-item-label>
                  <q-item-label caption>
                    {{ scope.opt.serviceName }} · {{ scope.opt.date }}
                    <span class="att-status" :class="`ast--${scope.opt.status.toLowerCase()}`">
                      {{ scope.opt.statusLabel }}
                    </span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Processo clínico -->
        <div>
          <div class="assoc-label">
            <q-icon name="las la-stethoscope" size="12px" style="color: var(--st-purple)" />
            Processo clínico
            <span class="assoc-opt">(preenche itens)</span>
          </div>
          <q-select
            v-model="clinicalProcess"
            :options="clinicalProcessOptions"
            option-label="label"
            clearable
            class="fi" borderless
            placeholder="Selecionar…"
            :loading="loadingClinical"
            popup-content-class="fi-popup"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label style="font-size: var(--fs-body); font-weight:600">{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>
                    <span class="cp-type-chip" :class="`cpt--${scope.opt.type}`">
                      {{ cpTypeLabel(scope.opt.type) }}
                    </span>
                    <span class="cp-status-chip" :class="`cps--${scope.opt.status}`">
                      {{ cpStatusLabel(scope.opt.status) }}
                    </span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

      </div>
    </q-slide-transition>

  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useInvoiceStore } from "src/stores/invoice";
import { api } from "src/boot/axios";
const invoiceStore = useInvoiceStore();

/* ─── Customer search ─────────────────────────────────────────── */
const options = ref([]);
const filterFunction = async (val, update) => {
  try {
    if (!val) return;
    update(async () => {
      const { data } = await api.get("customers/filter/search", { params: { search: val } });
      options.value = data.data;
    });
  } catch (_) {}
};

/* ─── Attendance picker ───────────────────────────────────────── */
const attendanceOptions = ref([]);
const loadingAttendances = ref(false);

const attStatusLabel = (s) => ({
  WAITING: "Em espera", IN_SCREENING: "Em triagem", SCREENED: "Triado",
  WAITING_DOCTOR: "Aguarda médico", IN_CONSULTATION: "Em consulta",
  COMPLETED: "Concluído", CANCELED: "Cancelado",
}[s] ?? s);

const fmtDate = (val) =>
  new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" })
    .format(new Date(val));

const loadAttendances = async (cId) => {
  attendanceOptions.value = [];
  invoiceStore.form.attendanceId = null;
  if (!cId) return;
  loadingAttendances.value = true;
  try {
    const { data } = await api.get(`attendances/by-customer/${cId}`);
    attendanceOptions.value = (data?.data ?? []).map((a) => ({
      id: a.id,
      reference: a.reference,
      label: `${a.reference} · ${a.service?.name ?? "—"} · ${fmtDate(a.createdAt)}`,
      serviceName: a.service?.name ?? "—",
      serviceId: a.service?.id ?? null,
      servicePrice: a.service?.unit_price ?? 0,
      date: fmtDate(a.createdAt),
      status: a.status,
      statusLabel: attStatusLabel(a.status),
    }));

    // Restore preset attendance ID set before navigation (e.g. from AddPage)
    if (invoiceStore.form.presetAttendanceId) {
      const preset = attendanceOptions.value.find(a => a.id === invoiceStore.form.presetAttendanceId);
      if (preset) invoiceStore.form.attendanceId = preset.id;
      invoiceStore.form.presetAttendanceId = null;
    }
  } catch (_) {}
  finally { loadingAttendances.value = false; }
};

/* ─── Clinical process picker ────────────────────────────────── */
const clinicalProcess = ref(null);
const clinicalProcessOptions = ref([]);
const loadingClinical = ref(false);

const cpTypeLabel = (t) => ({ consultation: "Consulta", observation: "Observação", surgery: "Cirurgia" }[t] ?? t);
const cpStatusLabel = (s) => ({ pending: "Pendente", running: "Em curso", done: "Concluído" }[s] ?? s);

const loadClinicalProcesses = async (cId) => {
  clinicalProcessOptions.value = [];
  clinicalProcess.value = null;
  if (!cId) return;
  loadingClinical.value = true;
  try {
    const [conRes, obsRes, surRes] = await Promise.all([
      api.get(`consultations/by-customer/${cId}`),
      api.get(`observations/by-customer/${cId}`),
      api.get(`surgeries/by-customer/${cId}`),
    ]);
    const consultations = (conRes.data?.data ?? []).map((c) => ({
      id: c.id, type: "consultation", status: c.status,
      label: `Consulta · ${fmtDate(c.createdAt)}`,
    }));
    const observations = (obsRes.data?.data ?? []).map((o) => ({
      id: o.id, type: "observation", status: o.status,
      label: `Observação · ${o.service?.name ?? "—"} · ${fmtDate(o.createdAt)}`,
    }));
    const surgeries = (surRes.data?.data ?? []).map((s) => ({
      id: s.id, type: "surgery", status: s.status,
      label: `Cirurgia · ${s.service?.name ?? "—"} · ${fmtDate(s.createdAt)}`,
    }));
    clinicalProcessOptions.value = [...consultations, ...observations, ...surgeries];
  } catch (_) {}
  finally { loadingClinical.value = false; }
};

watch(() => invoiceStore.form.customer?.id, (cId) => {
  const id = cId ?? null;
  loadAttendances(id);
  loadClinicalProcesses(id);
});

// When an attendance is selected, auto-populate invoice items with its service
// (skip if items are already filled, e.g. set by AddPage before navigation)
watch(() => invoiceStore.form.attendanceId, (attId) => {
  if (!attId) return;
  if (invoiceStore.form.invoiceItems.length > 0) return;
  const att = attendanceOptions.value.find(a => a.id === attId);
  if (!att?.serviceId) return;
  invoiceStore.form.invoiceItems = [{
    quantity: 1,
    total: att.servicePrice,
    discount: 0,
    unit_price: att.servicePrice,
    name: att.serviceName,
    description: null,
    id: att.serviceId,
  }];
});

watch(clinicalProcess, async (proc) => {
  if (!proc) return;
  invoiceStore.form.invoiceItems.length = 0;
  try {
    if (proc.type === "consultation") {
      const { data } = await api.get(`consultations/${proc.id}`);
      const res = data.data;
      invoiceStore.form.invoiceItems.push(
        ...(res.exams ?? []).map((item) => ({
          quantity: 1, total: item.exam.unit_price, discount: item.exam.discount,
          unit_price: item.exam.unit_price, name: item.exam.name,
          description: item.exam.description, id: item.exam.id,
        }))
      );
      if (res.observation?.length) {
        const obs = res.observation[0];
        invoiceStore.form.invoiceItems.push({
          quantity: 1, total: obs.service.unit_price, discount: obs.service.discount,
          unit_price: obs.service.unit_price, name: obs.service.name,
          description: obs.service.description, id: obs.service.id,
        });
      } else if (res.internment) {
        invoiceStore.form.invoiceItems.push({
          quantity: 1, total: res.internment.service.unit_price, discount: res.internment.service.discount,
          unit_price: res.internment.service.unit_price, name: res.internment.service.name,
          description: res.internment.service.description, id: res.internment.service.id,
        });
      }
    } else if (proc.type === "observation") {
      const { data } = await api.get(`observations/${proc.id}`);
      const res = data.data;
      invoiceStore.form.invoiceItems.push({
        quantity: 1, total: res.service.unit_price, discount: res.service.discount,
        unit_price: res.service.unit_price, name: res.service.name,
        description: res.service.description, id: res.service.id,
      });
    } else if (proc.type === "surgery") {
      const { data } = await api.get(`surgeries/${proc.id}`);
      const res = data.data;
      invoiceStore.form.invoiceItems.push({
        quantity: 1, total: res.service.unit_price, discount: res.service.discount,
        unit_price: res.service.unit_price, name: res.service.name,
        description: res.service.description, id: res.service.id,
      });
    }
  } catch (_) {}
});

/* ─── Benefits ───────────────────────────────────────────────── */
const isOnPeriod = (endDate) => new Date() <= new Date(endDate);

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

const allBenefits = computed(() => {
  const c = invoiceStore.form.customer;
  const opts = [
    { label: "Particular", value: "normal", type: "normal", icon: "las la-user", disabled: false },
  ];
  if (c?.protocolId && c?.protocol?.name) {
    opts.push({
      label: c.protocol.name,
      value: "protocol",
      type: "protocol",
      icon: "las la-file-contract",
      disabled: false,
    });
  }
  if (c?.intern_insurance?.length) {
    c.intern_insurance.forEach((item) => {
      if (item?.intern?.name) {
        opts.push({
          label: item.intern.name,
          value: `intern@${item.id}`,
          type: "intern",
          icon: "las la-shield-alt",
          disabled: !isOnPeriod(item.endDate),
        });
      }
    });
  }
  if (c?.internInsuranceAggregate?.intern?.name) {
    const agg = c.internInsuranceAggregate;
    opts.push({
      label: agg.intern.name,
      value: `intern@${agg.id}`,
      type: "intern",
      icon: "las la-shield-alt",
      disabled: !isOnPeriod(agg.endDate),
    });
  }
  if (c?.customersInsurance?.length) {
    c.customersInsurance.forEach((ci) => {
      if (ci?.insurance?.name) {
        opts.push({
          label: ci.insurance.name,
          value: `insurance@${ci.insurance.id}`,
          type: "insurance",
          icon: "las la-umbrella",
          disabled: false,
        });
      }
    });
  }
  if (c?.partnerId && c?.Partner?.name) {
    opts.push({
      label: c.Partner.name,
      value: "partner",
      type: "partner",
      icon: "las la-handshake",
      disabled: false,
    });
  }
  return opts;
});

const activeBenefit = computed(() => {
  if (invoiceStore.form.asNormal || !invoiceStore.form.beneficial) return "normal";
  return invoiceStore.form.beneficial;
});

const selectBenefit = (opt) => {
  if (opt.disabled) return;
  if (opt.value === "normal") {
    invoiceStore.form.asNormal = true;
    invoiceStore.form.beneficial = null;
    applyBenefitDiscount(null);
  } else {
    invoiceStore.form.asNormal = false;
    invoiceStore.form.beneficial = opt.value;
    applyBenefitDiscount(opt.value);
  }
};

watch(() => invoiceStore.form.beneficial, (current) => {
  if (current) invoiceStore.form.asNormal = false;
});
</script>

<style scoped lang="scss">

/* ── Customer info row ── */
.cust-info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  background: var(--surface-3);
  border-radius: var(--r-sm);
  border: 1px solid var(--border);
}
.cust-info-icon  { color: var(--text-faint); flex-shrink: 0; }
.cust-info-name  { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text); }
.cust-info-sep   { color: var(--text-disabled); font-size: var(--fs-label); line-height: var(--lh-tight); }
.cust-info-phone { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); }

/* ── Benefits ── */
.benefit-section-label {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 6px;
}

.benefit-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.bchip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--r-pill);
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid transparent;
  background: var(--surface-3);
  color: var(--text-muted);
  transition: all 0.15s;
  white-space: nowrap;

  &:disabled { opacity: 0.45; cursor: not-allowed; }

  &:not(:disabled):hover { filter: brightness(0.95); }

  /* Normal / Particular */
  &--normal {
    background: var(--surface-3);
    color: var(--text-muted);
    border-color: var(--border-strong);
    &.bchip--on { background: #4a5568; color: #fff; border-color: #4a5568; }
  }

  /* Protocol */
  &--protocol {
    background: rgba(50,185,137,0.08);
    color: var(--chip-ok);
    border-color: rgba(50,185,137,0.2);
    &.bchip--on { background: #32b989; color: #fff; border-color: var(--st-ok); }
  }

  /* Internal insurance */
  &--intern {
    background: rgba(66,153,225,0.08);
    color: var(--chip-info);
    border-color: rgba(66,153,225,0.2);
    &.bchip--on { background: #3182ce; color: #fff; border-color: var(--st-info); }
  }

  /* External insurance */
  &--insurance {
    background: rgba(128,90,213,0.08);
    color: var(--chip-purple);
    border-color: rgba(128,90,213,0.2);
    &.bchip--on { background: #805ad5; color: #fff; border-color: var(--st-purple); }
  }

  /* Partner */
  &--partner {
    background: rgba(237,137,54,0.08);
    color: var(--chip-warn);
    border-color: rgba(237,137,54,0.2);
    &.bchip--on { background: #ed8936; color: #fff; border-color: var(--st-warn); }
  }
}

/* ── Attendance + Clinical process grid ── */
.assoc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.assoc-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin-bottom: 3px;
}
.assoc-opt {
  font-weight: 400;
  text-transform: none;
  color: var(--text-faint);
  letter-spacing: 0;
  font-size: var(--fs-label); line-height: var(--lh-tight);
}

/* ── Attendance status chips ── */
.att-status {
  display: inline-block;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600;
  padding: 1px 6px;
  border-radius: var(--r-sm);
  margin-left: 4px;
}
.ast--waiting, .ast--waiting_doctor { background: var(--surface-3); color: var(--text-muted); }
.ast--in_screening  { background: rgba(66,153,225,0.1);  color: var(--chip-info); }
.ast--screened      { background: rgba(128,90,213,0.1);  color: var(--chip-purple); }
.ast--completed     { background: rgba(50,185,137,0.1);  color: var(--chip-ok); }
.ast--canceled      { background: rgba(229,62,62,0.08);  color: var(--danger); }
.ast--in_consultation { background: rgba(49,130,206,0.1); color: var(--chip-info); }

/* ── Clinical process chips ── */
.cp-type-chip {
  display: inline-block;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  padding: 1px 7px;
  border-radius: var(--r-sm);
  margin-right: 4px;
}
.cpt--consultation { background: rgba(66,153,225,0.1);  color: var(--chip-info); }
.cpt--observation  { background: rgba(128,90,213,0.1);  color: var(--chip-purple); }
.cpt--surgery      { background: rgba(229,62,62,0.08);  color: var(--danger); }

.cp-status-chip {
  display: inline-block;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600;
  padding: 1px 6px;
  border-radius: var(--r-sm);
}
.cps--pending { background: var(--surface-3); color: var(--text-muted); }
.cps--running { background: rgba(237,137,54,0.1); color: var(--chip-warn); }
.cps--done    { background: rgba(50,185,137,0.1); color: var(--chip-ok); }
</style>
