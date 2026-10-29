<template>
  <div class="vp-wrap">

    <!-- Top bar -->
    <div class="vp-topbar">
      <q-btn flat round dense icon="las la-arrow-left" color="grey-6"
        @click="$router.push({ name: 'historico-exame' })" />
      <div class="vp-topbar-title">
        <q-icon name="las la-file-medical-alt" size="15px" style="color: var(--st-purple)" />
        Resultados de exames
      </div>
      <q-btn
        v-if="consultation"
        flat no-caps dense
        icon="las la-file-pdf"
        label="Exportar PDF"
        color="grey-7"
        style="margin-left:auto; border-radius: var(--r-sm); font-size: var(--fs-label)"
        @click="exportPdf"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="vp-state">
      <q-spinner-dots color="purple" size="28px" />
    </div>

    <template v-else-if="consultation">

      <!-- Patient card -->
      <div class="vp-patient-card">
        <div class="vpc-avatar">{{ initials(consultation.screening?.customer?.name) }}</div>
        <div class="vpc-info">
          <div class="vpc-name">{{ consultation.screening?.customer?.name ?? '—' }}</div>
          <div class="vpc-meta">
            <span v-if="age" class="vpc-chip">
              <q-icon name="las la-birthday-cake" size="12px" />
              {{ age }} anos
            </span>
            <span v-if="consultation.screening?.customer?.phone" class="vpc-chip">
              <q-icon name="las la-phone" size="12px" />
              {{ consultation.screening.customer.phone }}
            </span>
            <span v-if="consultation.doctor?.name" class="vpc-chip vpc-chip--doctor">
              <q-icon name="las la-user-md" size="12px" />
              Dr. {{ consultation.doctor.name }}
            </span>
            <span class="vpc-chip vpc-chip--date">
              <q-icon name="las la-calendar" size="12px" />
              {{ fmtDate(consultation.createdAt) }}
            </span>
          </div>
        </div>
        <div class="vpc-stats">
          <div class="vpc-stat">
            <span class="vpc-stat-val">{{ allExams.length }}</span>
            <span class="vpc-stat-label">Exames</span>
          </div>
          <div class="vpc-stat-divider" />
          <div class="vpc-stat">
            <span class="vpc-stat-val vpc-stat--normal">{{ countNormal }}</span>
            <span class="vpc-stat-label">Normais</span>
          </div>
          <div class="vpc-stat-divider" />
          <div class="vpc-stat">
            <span class="vpc-stat-val vpc-stat--altered">{{ countAltered }}</span>
            <span class="vpc-stat-label">Alterados</span>
          </div>
        </div>
      </div>

      <!-- Exam result cards -->
      <div class="vp-exams">
        <div v-for="req in allExams" :key="req.id" class="vp-exam-card">

          <!-- Exam header -->
          <div class="vec-head">
            <div class="vec-name">
              <q-icon name="las la-vial" size="14px" style="color: var(--st-purple)" />
              {{ req.exam?.name ?? '—' }}
            </div>
            <span
              v-if="req.resultColor"
              class="vec-result-chip"
              :class="req.resultColor === 'GREEN' ? 'vrc--normal' : 'vrc--altered'"
            >
              <q-icon :name="req.resultColor === 'GREEN' ? 'las la-check-circle' : 'las la-exclamation-circle'" size="11px" />
              {{ req.resultColor === 'GREEN' ? 'Normal' : 'Alterado' }}
            </span>
            <span v-else-if="!req.paid" class="vec-result-chip vrc--pending">
              <q-icon name="las la-lock" size="11px" />
              Não faturado
            </span>
            <span v-else class="vec-result-chip vrc--pending">
              Sem resultado
            </span>
          </div>

          <!-- Structured results (fields) -->
          <div v-if="hasFields(req)" class="vec-body">
            <template v-for="(f, fi) in getFields(req)" :key="fi">
              <div v-if="f.input === 'SECTION'" class="vec-section">
                <q-icon name="las la-layer-group" size="11px" style="color: var(--st-purple)" />
                {{ f.label }}
              </div>
              <div v-else class="vec-field-row">
                <div class="vec-field-label">
                  {{ f.label }}
                  <span v-if="f.unit" class="vec-unit">{{ f.unit }}</span>
                </div>
                <div class="vec-field-value">{{ f.value || '—' }}</div>
                <div v-if="f.reference" class="vec-ref">Ref: {{ f.reference }}</div>
              </div>
            </template>
          </div>

          <!-- Free-text result -->
          <div v-else-if="req.resultText" class="vec-body">
            <div class="vec-text-result">{{ req.resultText }}</div>
          </div>

          <!-- No result yet -->
          <div v-else-if="req.paid" class="vec-no-result">
            Resultado não registado
          </div>

        </div>
      </div>

    </template>

    <!-- Not found -->
    <div v-else class="vp-state">
      <q-icon name="las la-exclamation-circle" size="36px" style="color:var(--text-disabled)" />
      <span>Consulta não encontrada</span>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCreateUpdate } from "src/composables/create-update";
import { printExamResult } from "src/utils/reports/examResult";
import { useCompanyStore } from "src/stores/company";

const route        = useRoute();
const router       = useRouter();
const companyStore = useCompanyStore();
const { fetchOne } = useCreateUpdate("consultations");

const loading      = ref(true);
const consultation = ref(null);

const exportPdf = () => {
  const c = companyStore.data?.data;
  printExamResult({
    clinic:  { name: c?.nome ?? c?.name, phone: c?.phone, address: c?.address },
    patient: {
      name:     consultation.value?.screening?.customer?.name,
      phone:    consultation.value?.screening?.customer?.phone,
      birthday: consultation.value?.screening?.customer?.birthday,
    },
    doctor: { name: consultation.value?.doctor?.name },
    date:   consultation.value?.createdAt,
    exams:  allExams.value,
  });
};

const allExams = computed(() => {
  if (!consultation.value) return [];
  const list = [...(consultation.value.exams ?? [])];
  (consultation.value.observation ?? []).forEach((o) => list.push(...(o.exams ?? [])));
  (consultation.value.internment ?? []).forEach((i) => list.push(...(i.exams ?? [])));
  return list;
});

const countNormal  = computed(() => allExams.value.filter((e) => e.resultColor === "GREEN").length);
const countAltered = computed(() => allExams.value.filter((e) => e.resultColor === "RED").length);

const age = computed(() => {
  const b = consultation.value?.screening?.customer?.birthday;
  if (!b) return null;
  const bd = new Date(b);
  const today = new Date();
  let a = today.getFullYear() - bd.getFullYear();
  if (today.getMonth() < bd.getMonth() || (today.getMonth() === bd.getMonth() && today.getDate() < bd.getDate())) a--;
  return a > 0 ? a : null;
});

const hasFields = (req) => {
  const saved = Array.isArray(req.result) ? req.result : [];
  return saved.some((f) => f.input !== "SECTION");
};

const getFields = (req) => {
  const saved = Array.isArray(req.result) ? req.result : [];
  return saved;
};

const initials = (name) =>
  name?.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("") ?? "?";

const fmtDate = (val) =>
  val
    ? new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(val))
    : "—";

onMounted(async () => {
  try {
    consultation.value = await fetchOne(route.params.id);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.vp-wrap {
  display: flex; flex-direction: column; gap: 20px;
  padding: 20px 24px; max-width: 860px;
}

/* Top bar */
.vp-topbar {
  display: flex; align-items: center; gap: 10px;
}
.vp-topbar-title {
  display: flex; align-items: center; gap: 7px;
  font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text-2);
}

/* State */
.vp-state {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 80px 0; color: var(--text-faint); font-size: var(--fs-body); line-height: var(--lh-body);
}

/* Patient card */
.vp-patient-card {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  padding: 16px 20px;
}
.vpc-avatar {
  width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #b794f4, var(--st-purple));
  color: #fff; font-size: var(--fs-section); line-height: var(--lh-tight); font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.vpc-info   { flex: 1; min-width: 0; }
.vpc-name   { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text); margin-bottom: 6px; }
.vpc-meta   { display: flex; flex-wrap: wrap; gap: 6px; }
.vpc-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); background: var(--surface-3);
  border: 1px solid var(--border-strong); border-radius: var(--r-pill); padding: 3px 9px;
}
.vpc-chip--doctor { color: var(--chip-info); background: rgba(66,153,225,0.08); border-color: rgba(66,153,225,0.2); }
.vpc-chip--date   { color: var(--chip-purple); background: rgba(128,90,213,0.06); border-color: rgba(128,90,213,0.2); }

.vpc-stats {
  display: flex; align-items: center; gap: 16px;
  padding-left: 20px; border-left: 1px solid var(--border); flex-shrink: 0;
}
.vpc-stat          { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.vpc-stat-val      { font-size: var(--fs-heading); font-weight: 700; color: var(--text-2); line-height: 1; }
.vpc-stat--normal  { color: var(--st-ok-text); }
.vpc-stat--altered { color: var(--danger); }
.vpc-stat-label    { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.5px; }
.vpc-stat-divider  { width: 1px; height: 28px; background: var(--border); }

/* Exam cards */
.vp-exams { display: flex; flex-direction: column; gap: 14px; }

.vp-exam-card {
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border); overflow: hidden;
}

/* Exam head */
.vec-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; background: var(--surface-2); border-bottom: 1px solid var(--border-soft);
}
.vec-name {
  display: flex; align-items: center; gap: 7px; flex: 1;
  font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.4px;
}
.vec-result-chip {
  display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; padding: 3px 10px; border-radius: var(--r-pill);
}
.vrc--normal  { color: var(--chip-ok); background: rgba(50,185,137,0.1);  border: 1px solid rgba(50,185,137,0.3); }
.vrc--altered { color: var(--danger); background: rgba(229,62,62,0.1);   border: 1px solid rgba(229,62,62,0.3); }
.vrc--pending { color: var(--text-muted); background: var(--surface-3);               border: 1px solid var(--border-strong); }

/* Body */
.vec-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }

.vec-section {
  display: flex; align-items: center; gap: 7px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 800; color: var(--st-purple-text);
  text-transform: uppercase; letter-spacing: 0.8px;
  padding: 5px 10px; background: var(--st-purple-tint); border-radius: var(--r-sm);
}

.vec-field-row {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 2px 12px;
  align-items: center;
  padding: 12px 10px; border-radius: var(--r-sm); background: var(--surface-2);
}
.vec-field-label {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-muted);
  grid-column: 1; grid-row: 1;
}
.vec-unit {
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); font-weight: 400;
  background: var(--border); padding: 1px 6px; border-radius: var(--r-sm);
}
.vec-field-value {
  font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text);
  grid-column: 2; grid-row: 1; text-align: right; white-space: nowrap;
}
.vec-ref {
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint);
  grid-column: 1 / -1; grid-row: 2;
}

.vec-text-result {
  font-size: var(--fs-body); color: var(--text-3); line-height: 1.6; white-space: pre-wrap;
  background: var(--surface-2); border-radius: var(--r-sm); padding: 12px 14px;
}

.vec-no-result {
  padding: 16px; text-align: center;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint);
}
</style>
