<template>
  <div class="data-page" v-if="attendance">
    <!-- Header -->
    <div class="view-header q-px-md q-pt-md">
      <div class="vh-left">
        <q-btn flat round dense icon="las la-arrow-left" color="grey-5" size="sm"
          @click="$router.push({ name: 'recepcao-historico' })" />
        <div>
          <div class="vh-ref">{{ attendance.reference }}</div>
          <div class="vh-time">{{ fmtDateTime(attendance.createdAt) }}</div>
        </div>
      </div>
      <span class="status-badge" :class="statusClass(attendance.status)">
        {{ statusLabel(attendance.status) }}
      </span>
    </div>

    <!-- Info cards -->
    <div class="q-px-md q-pt-md row q-col-gutter-md">
      <!-- Patient card -->
      <div class="col-md-4 col-xs-12">
        <div class="info-card">
          <div class="ic-header">
            <q-icon name="las la-user" size="14px" style="color: var(--st-ok)" />
            <span>Paciente</span>
          </div>
          <div class="ic-avatar">{{ initials(attendance.customer?.name) }}</div>
          <div class="ic-name">{{ attendance.customer?.name }}</div>
          <div class="ic-sub">{{ attendance.customer?.phone ?? '—' }}</div>
        </div>
      </div>

      <!-- Service -->
      <div class="col-md-4 col-xs-12">
        <div class="info-card">
          <div class="ic-header">
            <q-icon name="las la-file-invoice" size="14px" style="color: var(--st-info)" />
            <span>Serviço</span>
          </div>
          <div v-if="attendance.service">
            <div class="ic-name">{{ attendance.service.name }}</div>
            <div class="ic-sub" v-if="attendance.service.unit_price">
              {{ fmt(attendance.service.unit_price) }} Kz
            </div>
          </div>
          <div v-else class="ic-body" style="color:var(--text-faint)">Não definido</div>
        </div>
      </div>

      <!-- Note -->
      <div class="col-md-4 col-xs-12">
        <div class="info-card">
          <div class="ic-header">
            <q-icon name="las la-sticky-note" size="14px" style="color:var(--text-faint)" />
            <span>Observação</span>
          </div>
          <div class="ic-body">{{ attendance.note ?? 'Sem observação.' }}</div>
        </div>
      </div>

      <!-- Receptionist -->
      <div class="col-md-4 col-xs-12">
        <div class="info-card">
          <div class="ic-header">
            <q-icon name="las la-user-tie" size="14px" style="color:var(--text-faint)" />
            <span>Recepcionista</span>
          </div>
          <div class="ic-body">{{ attendance.receptionist?.name ?? '—' }}</div>
        </div>
      </div>
    </div>

    <!-- Status stepper -->
    <div class="q-px-md q-pt-md">
      <div class="stepper-card">
        <div
          v-for="(step, i) in steps"
          :key="step.key"
          class="step"
          :class="{
            'step--done':   stepIndex > i,
            'step--active': stepIndex === i,
          }"
        >
          <div class="step-dot">
            <q-icon v-if="stepIndex > i" name="las la-check" size="12px" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <div class="step-label">{{ step.label }}</div>
          <div v-if="i < steps.length - 1" class="step-line" />
        </div>
      </div>
    </div>

    <!-- Triagem -->
    <div class="q-px-md q-pt-md">
      <div class="section-card">
        <div class="sc-header">
          <div class="sc-title">
            <q-icon name="las la-heartbeat" size="15px" style="color: var(--st-ok)" />
            Triagem
          </div>
          <span v-if="!attendance.screening" class="sc-empty-label">Ainda não realizada</span>
        </div>

        <div v-if="attendance.screening" class="screening-grid">
          <div class="sg-item" v-for="field in screeningFields" :key="field.key">
            <div class="sg-label">{{ field.label }}</div>
            <div class="sg-value" :class="critClass(attendance.screening[field.key])">
              {{ screeningValue(attendance.screening, field.key) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Consulta -->
    <div class="q-px-md q-pt-md q-pb-md">
      <div class="section-card">
        <div class="sc-header">
          <div class="sc-title">
            <q-icon name="las la-stethoscope" size="15px" style="color: var(--st-info)" />
            Consulta médica
          </div>
          <span v-if="!attendance.consultation" class="sc-empty-label">Ainda não iniciada</span>
        </div>

        <div v-if="attendance.consultation" class="consult-body">
          <div class="cb-row">
            <span class="cb-label">Médico</span>
            <span class="cb-val">{{ attendance.consultation.doctor?.name ?? '—' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="loading" class="att-state">
    <q-spinner-dots color="primary" size="28px" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { api } from "src/boot/axios";

const route = useRoute();
const loading = ref(false);
const attendance = ref(null);

const steps = [
  { key: "WAITING",         label: "Registado" },
  { key: "IN_SCREENING",    label: "Triagem" },
  { key: "WAITING_DOCTOR",  label: "Aguarda médico" },
  { key: "IN_CONSULTATION", label: "Consulta" },
  { key: "COMPLETED",       label: "Concluído" },
];

const statusOrder = steps.map((s) => s.key);
const stepIndex = computed(() =>
  Math.max(0, statusOrder.indexOf(attendance.value?.status))
);

const statusLabel = (s) => ({
  WAITING: "Em espera", IN_SCREENING: "Em triagem", SCREENED: "Triado",
  WAITING_DOCTOR: "Aguarda médico", IN_CONSULTATION: "Em consulta",
  COMPLETED: "Concluído", CANCELED: "Cancelado",
}[s] ?? s);

const statusClass = (s) => ({
  WAITING: "badge-waiting", IN_SCREENING: "badge-screening",
  SCREENED: "badge-screened", WAITING_DOCTOR: "badge-waiting-doctor",
  IN_CONSULTATION: "badge-consultation", COMPLETED: "badge-done",
  CANCELED: "badge-canceled",
}[s] ?? "");

const screeningFields = [
  { key: "weight",         label: "Peso (kg)" },
  { key: "height",         label: "Altura (cm)" },
  { key: "bloodPressure",  label: "Pressão arterial" },
  { key: "heartbeatRate",  label: "Freq. cardíaca" },
  { key: "breathingRate",  label: "Freq. respiratória" },
  { key: "oxygen",         label: "Oxigênio" },
  { key: "fever",          label: "Febre" },
];

const critMap = { GREEN: "crit-green", ORANGE: "crit-orange", RED: "crit-red" };
const critClass = (val) => critMap[val] ?? "";

const screeningValue = (s, key) => {
  if (key === "bloodPressure") return s.bloodPressureDescription || s[key] || "—";
  return s[key] ?? "—";
};

const fmt = (val) =>
  new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(val) || 0);

const initials = (name) =>
  name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() ?? "?";

const fmtDateTime = (val) =>
  new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(val));

const fetchData = async () => {
  loading.value = true;
  const { data } = await api.get(`attendances/${route.params.id}`);
  attendance.value = data.data;
  loading.value = false;
};

onMounted(fetchData);
</script>

<style scoped lang="scss">
/* ── Header ── */
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vh-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vh-ref  { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text); font-family: monospace; }
.vh-time { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }

/* ── Status badges (shared) ── */
.status-badge {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600;
  padding: 4px 12px; border-radius: var(--r-pill);
}
.badge-waiting        { color: var(--text-muted); background: var(--surface-3); }
.badge-screening      { color: var(--st-info-text); background: rgba(66,153,225,0.10); }
.badge-screened       { color: var(--st-purple-text); background: rgba(128,90,213,0.10); }
.badge-waiting-doctor { color: var(--st-warn-text); background: rgba(237,137,54,0.10); }
.badge-consultation   { color: var(--chip-info); background: rgba(49,130,206,0.10); }
.badge-done           { color: var(--st-ok-text); background: rgba(50,185,137,0.10); }
.badge-canceled       { color: var(--danger); background: rgba(229,62,62,0.10); }

/* ── Info cards ── */
.info-card {
  background: var(--surface);
  border-radius: var(--r-control);
  border: 1px solid var(--border);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
}

.ic-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin-bottom: 4px;
}

.ic-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent) 0%, #26a69a 100%);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700;
}

.ic-name { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 600; color: var(--text-2); }
.ic-sub  { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }
.ic-body { font-size: var(--fs-body); color: var(--text-3); line-height: 1.5; }

/* ── Stepper ── */
.stepper-card {
  background: var(--surface);
  border-radius: var(--r-control);
  border: 1px solid var(--border);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 0;
  overflow-x: auto;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  min-width: 80px;
}

.step-dot {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--border); color: var(--text-faint);
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700;
  transition: all 0.2s;
  position: relative; z-index: 1;
}

.step--done .step-dot  { background: #32b989; color: #fff; }
.step--active .step-dot { background: var(--surface); border: 2px solid var(--st-ok); color: var(--st-ok-text); }

.step-label {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600;
  color: var(--text-faint); text-align: center;
  margin-top: 6px; white-space: nowrap;
}
.step--done .step-label  { color: var(--st-ok-text); }
.step--active .step-label { color: var(--text-2); }

.step-line {
  position: absolute;
  top: 13px; left: 50%; right: -50%;
  height: 2px;
  background: var(--border);
  z-index: 0;
}
.step--done .step-line { background: var(--accent); }

/* ── Section card ── */
.section-card {
  background: var(--surface);
  border-radius: var(--r-control);
  border: 1px solid var(--border);
  overflow: hidden;
}

.sc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-soft);
}

.sc-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-body); line-height: var(--lh-body);
  font-weight: 700;
  color: var(--text-2);
}

.sc-empty-label {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  color: var(--text-faint);
}

/* ── Screening grid ── */
.screening-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0;
}

.sg-item {
  padding: 12px 16px;
  border-right: 1px solid var(--surface-3);
  border-bottom: 1px solid var(--surface-3);

  &:last-child { border-right: none; }
}

.sg-label {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.sg-value {
  font-size: var(--fs-title); line-height: var(--lh-tight);
  font-weight: 600;
  color: var(--text-2);
}

.crit-green  { color: var(--st-ok-text); }
.crit-orange { color: var(--st-warn-text); }
.crit-red    { color: var(--danger); }

/* ── Consultation ── */
.consult-body { padding: 14px 16px; }

.cb-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--surface-3);

  &:last-child { border-bottom: none; }
}

.cb-label { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); width: 80px; flex-shrink: 0; }
.cb-val   { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 500; color: var(--text-2); }

/* ── Loading state ── */
.att-state {
  display: flex; flex-direction: column;
  align-items: center; gap: 8px;
  padding: 60px 0; color: var(--text-faint); font-size: var(--fs-label); line-height: var(--lh-tight);
}
</style>
