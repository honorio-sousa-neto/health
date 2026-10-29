<template>
  <div class="elr-wrap">

    <!-- Loading -->
    <div v-if="loading" class="elr-state">
      <q-spinner-dots color="primary" size="24px" />
    </div>

    <!-- Empty -->
    <div v-else-if="!pending.length" class="elr-state">
      <q-icon name="las la-flask" size="32px" style="color:var(--text-disabled)" />
      <span>Sem pedidos pendentes de faturação</span>
    </div>

    <!-- Cards -->
    <div v-else class="elr-grid">
      <div v-for="item in pending" :key="item.id" class="elr-card">

        <!-- Patient header -->
        <div class="elr-card-head">
          <div class="elr-avatar">{{ initials(item.screening?.customer?.name) }}</div>
          <div class="elr-patient-info">
            <div class="elr-patient-name">{{ item.screening?.customer?.name }}</div>
            <div class="elr-doctor">
              <q-icon name="las la-user-md" size="12px" />
              {{ item.doctor?.name ?? '—' }}
            </div>
          </div>
          <div class="elr-count-badge">
            {{ item.exams.length }} exame{{ item.exams.length !== 1 ? 's' : '' }}
          </div>
        </div>

        <!-- Exam list -->
        <div class="elr-exams">
          <div v-for="exam in item.exams" :key="exam.id" class="elr-exam-row">
            <q-icon name="las la-vial" size="13px" style="color: var(--st-info); flex-shrink:0" />
            <span class="elr-exam-name">{{ exam.exam?.name }}</span>
            <span class="elr-exam-price">
              {{ exam.exam?.unit_price != null ? fmtPrice(exam.exam.unit_price) : '—' }}
            </span>
          </div>
        </div>

        <!-- Total + action -->
        <div class="elr-card-foot">
          <div class="elr-total">
            <span class="elr-total-label">Total</span>
            <span class="elr-total-value">{{ fmtPrice(totalPrice(item.exams)) }}</span>
          </div>
          <q-btn
            unelevated no-caps
            icon="las la-file-invoice-dollar"
            label="Faturar"
            color="primary"
            style="border-radius: var(--r-sm); font-size: var(--fs-label)"
            @click="$router.push({ name: 'emitir-documento-form', params: { medicalConsultationId: item.id } })"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useCommom } from "src/composables/commom";

const { loading, data } = useCommom("request-exams");

/* Only show consultations where ALL exams are still unpaid */
const pending = computed(() =>
  (data ?? []).filter((item) => item.exams?.every((e) => !e.paid))
);

const initials = (name) => {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
};

const fmtPrice = (v) =>
  new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2 }).format(v ?? 0) + " Kz";

const totalPrice = (exams) =>
  exams.reduce((sum, e) => sum + (e.exam?.unit_price ?? 0), 0);
</script>

<style scoped lang="scss">
.elr-wrap { width: 100%; }

.elr-state {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 40px 0; color: var(--text-faint); font-size: var(--fs-body); line-height: var(--lh-body);
}

.elr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

/* Card */
.elr-card {
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  overflow: hidden; display: flex; flex-direction: column;
  &:hover { background: var(--surface-2); border-color: var(--border-control); }
}

/* Header */
.elr-card-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; border-bottom: 1px solid var(--border-soft); background: var(--surface-2);
}
.elr-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #4299e1, var(--st-info));
  color: #fff; font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.elr-patient-info { flex: 1; min-width: 0; }
.elr-patient-name { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.elr-doctor {
  display: flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 2px;
}
.elr-count-badge {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--st-info-text);
  background: rgba(66,153,225,0.1); border: 1px solid rgba(66,153,225,0.25);
  padding: 3px 9px; border-radius: var(--r-pill); white-space: nowrap;
}

/* Exam rows */
.elr-exams { padding: 10px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.elr-exam-row {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 8px; border-radius: var(--r-sm); background: var(--surface-3);
}
.elr-exam-name  { flex: 1; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-2); font-weight: 500; }
.elr-exam-price { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); white-space: nowrap; }

/* Footer */
.elr-card-foot {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-top: 1px solid var(--border-soft);
}
.elr-total       { display: flex; flex-direction: column; gap: 1px; }
.elr-total-label { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.5px; }
.elr-total-value { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text-2); }
</style>
