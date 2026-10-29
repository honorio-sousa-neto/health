<template>
  <div class="page-content page-bg">

    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h6 text-weight-semibold">Fecho do Dia</div>
        <div class="text-caption text-grey-5">Faturamento por área no dia seleccionado</div>
      </div>
      <q-btn
        v-if="areas.length"
        unelevated no-caps color="primary"
        icon="las la-file-pdf" label="Exportar PDF"
        :loading="exportingPdf"
        @click="exportPdf"
      />
    </div>

    <!-- Filter bar -->
    <div class="filter-bar q-mb-lg">
      <q-input
        v-model="date"
        type="date"
        class="fi"
        borderless
        label="Dia"
        style="min-width:160px"
      />
      <q-btn
        unelevated no-caps color="primary"
        icon="las la-search" label="Gerar"
        :loading="loading"
        :disable="!date"
        @click="fetchData"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-box">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- Results -->
    <template v-else-if="areas.length">

      <div class="fecho-date-banner q-mb-lg">
        <q-icon name="las la-calendar-check" size="18px" style="color: var(--st-ok)" />
        <span>{{ fmtDate(date) }}</span>
      </div>

      <!-- Area cards -->
      <div class="fecho-grid q-mb-lg">
        <div v-for="area in areas" :key="area.key" class="fecho-card">
          <div class="fecho-card__icon" :style="{ background: area.iconBg }">
            <q-icon :name="area.icon" size="20px" :style="{ color: area.color }" />
          </div>
          <div class="fecho-card__info">
            <div class="fecho-card__label">{{ area.label }}</div>
            <div class="fecho-card__value">{{ fmtMoney(area.total) }}</div>
          </div>
        </div>
      </div>

      <!-- Total bar -->
      <div class="fecho-total q-mb-lg">
        <span class="fecho-total__label">Total do dia</span>
        <span class="fecho-total__value">{{ fmtMoney(grandTotal) }}</span>
      </div>

      <!-- Payment methods -->
      <div v-if="payments.length" class="fecho-payments">
        <div class="fecho-payments__header">
          <q-icon name="las la-credit-card" size="15px" style="color: var(--text-faint)" />
          <span>Métodos de pagamento</span>
        </div>
        <div class="fecho-payments__list">
          <div
            v-for="p in payments" :key="p.name"
            class="fecho-pay-row"
            :class="{ 'fecho-pay-row--unpaid': p.name === 'Sem pagamento' }"
          >
            <span class="fecho-pay-name">{{ p.name }}</span>
            <span
              class="fecho-pay-value"
              :class="{ 'fecho-pay-value--unpaid': p.name === 'Sem pagamento' }"
            >{{ fmtMoney(p.total) }}</span>
          </div>
        </div>
      </div>

    </template>

    <!-- Empty states -->
    <div v-else-if="!loading && fetched" class="state-box">
      <q-icon name="las la-inbox" size="40px" style="color:var(--text-disabled)" />
      <span class="state-text">Sem faturamento registado para este dia</span>
    </div>
    <div v-else-if="!loading && !fetched" class="state-box">
      <q-icon name="las la-calculator" size="40px" style="color:var(--text-disabled)" />
      <span class="state-text">Seleccione o dia e clique em <strong>Gerar</strong></span>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useFetchApi } from "src/composables/api";
import { printFecho } from "src/utils/reports/report";

const { index } = useFetchApi();

const date = ref(new Date().toISOString().slice(0, 10));
const loading = ref(false);
const fetched = ref(false);
const exportingPdf = ref(false);

// ── Area definitions ───────────────────────────────────────────
const AREA_META = [
  { key: "Enfermaria",            label: "Clínica Geral",   icon: "las la-stethoscope",  color: "#8b5cf6", iconBg: "#faf5ff" },
  { key: "Laboratório",           label: "Laboratório",     icon: "las la-flask",         color: "#06b6d4", iconBg: "#ecfeff" },
  { key: "Imagiologia",           label: "Imagiologia",     icon: "las la-x-ray",         color: "#6366f1", iconBg: "#eef2ff" },
  { key: "Ecografia",             label: "Ecografia",       icon: "las la-wave-square",   color: "#0ea5e9", iconBg: "#f0f9ff" },
  { key: "Estomatologia",         label: "Estomatologia",   icon: "las la-tooth",         color: "#f97316", iconBg: "#fff7ed" },
  { key: "Especialidade",         label: "Especialidade",   icon: "las la-user-md",       color: "#a855f7", iconBg: "#fdf4ff" },
  { key: "Farmácia",              label: "Farmácia",        icon: "las la-pills",         color: "#22c55e", iconBg: "#f0fdf4" },
];

// ── Raw data ───────────────────────────────────────────────────
const rawData = ref({});
const payments = ref([]);

const areas = computed(() =>
  AREA_META
    .map((m) => ({ ...m, total: rawData.value[m.key] ?? 0 }))
    .filter((a) => a.total > 0)
);

const grandTotal = computed(() => areas.value.reduce((s, a) => s + a.total, 0));

// ── Fetch ──────────────────────────────────────────────────────
const fetchData = async () => {
  loading.value = true;
  fetched.value = false;
  rawData.value = {};
  payments.value = [];
  try {
    const { data: res } = await index("balances", {
      params: { range: date.value, type: "daily" },
    });
    rawData.value = Object.values(res.categories ?? res).reduce((acc, item) => {
      acc[item.categoryName] = item.total;
      return acc;
    }, {});
    payments.value = res.payments ?? [];
  } finally {
    loading.value = false;
    fetched.value = true;
  }
};

// ── PDF ────────────────────────────────────────────────────────
const exportPdf = async () => {
  exportingPdf.value = true;
  try {
    printFecho(rawData.value, { date: date.value, payments: payments.value });
  } finally {
    exportingPdf.value = false;
  }
};

// ── Formatters ─────────────────────────────────────────────────
const fmtMoney = (v) =>
  new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 }).format(v ?? 0);

const fmtDate = (d) =>
  d ? new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(d + "T12:00:00")) : "";
</script>

<style scoped lang="scss">
// ── Filter bar ───────────────────────────────────────────────────
.filter-bar {
  display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap;
  padding: 14px 16px; background: var(--surface);
  border: 1.5px solid var(--border); border-radius: var(--r-control);
}

// ── Date banner ──────────────────────────────────────────────────
.fecho-date-banner {
  display: flex; align-items: center; gap: 8px;
  font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text);
  padding: 8px 14px; background: var(--st-ok-tint);
  border: 1.5px solid #b7f0d8; border-radius: var(--r-sm);
  width: fit-content;
}

// ── Area cards grid ──────────────────────────────────────────────
.fecho-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.fecho-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px; background: var(--surface);
  border: 1.5px solid var(--border); border-radius: var(--r-control);
  &:hover { background: var(--surface-2); border-color: var(--border-control); }
}

.fecho-card__icon {
  width: 44px; height: 44px; border-radius: var(--r-sm); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}

.fecho-card__label {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px;
}

.fecho-card__value {
  font-size: var(--fs-section); line-height: var(--lh-tight); font-weight: 800; color: var(--text);
}

// ── Total bar ────────────────────────────────────────────────────
.fecho-total {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; background: #1e293b; border-radius: var(--r-control);
}

.fecho-total__label {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;
}

.fecho-total__value {
  font-size: 22px; font-weight: 800; color: var(--st-ok-text);
}

// ── State box ────────────────────────────────────────────────────
.state-box { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 0; }
.state-text { font-size: var(--fs-body); line-height: var(--lh-body); color: var(--text-muted); }

// ── Payment methods ───────────────────────────────────────────────
.fecho-payments {
  background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-control); overflow: hidden;
}

.fecho-payments__header {
  display: flex; align-items: center; gap: 7px;
  padding: 11px 16px; background: var(--surface-3);
  border-bottom: 1px solid var(--border);
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-faint);
  text-transform: uppercase; letter-spacing: 0.5px;
}

.fecho-payments__list { padding: 4px 0; }

.fecho-pay-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  &:not(:last-child) { border-bottom: 1px solid var(--border); }
}

.fecho-pay-name { font-size: var(--fs-body); line-height: var(--lh-body); color: var(--st-info-text); font-weight: 500; }
.fecho-pay-value { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text); }

.fecho-pay-row--unpaid {
  background: var(--st-warn-tint);
  border-top: 1px dashed #fde68a !important;
}
.fecho-pay-row--unpaid .fecho-pay-name { color: var(--chip-warn); }
.fecho-pay-value--unpaid { color: var(--chip-warn); }
</style>
