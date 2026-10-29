<template>
  <div class="eel-wrap">

    <div v-if="loading" class="eel-state">
      <q-spinner-dots color="teal-8" size="22px" />
    </div>

    <div v-else-if="!groups.length" class="eel-state">
      <q-icon name="las la-user-circle" size="32px" style="color:var(--text-disabled)" />
      <span>Sem pedidos de exames externos</span>
    </div>

    <div v-else class="eel-grid">
      <div v-for="group in groups" :key="group.customerId" class="eel-card">

        <!-- Patient header -->
        <div class="eel-card-head">
          <div class="eel-avatar">{{ initials(group.customer?.name) }}</div>
          <div class="eel-patient-info">
            <div class="eel-patient-name">{{ group.customer?.name }}</div>
            <div class="eel-sub">
              <q-icon name="las la-user-circle" size="12px" />
              Paciente externo
            </div>
          </div>
          <div class="eel-count-badge">
            {{ group.exams.length }} exame{{ group.exams.length !== 1 ? 's' : '' }}
          </div>
        </div>

        <!-- Exam list -->
        <div class="eel-exams">
          <div v-for="exam in group.exams" :key="exam.id" class="eel-exam-row">
            <q-icon name="las la-vial" size="13px" :style="`color:${exam.paid ? '#32b989' : '#4299e1'}; flex-shrink:0`" />
            <span class="eel-exam-name">{{ exam.exam?.name }}</span>
            <span class="eel-price">
              {{ exam.exam?.unit_price != null ? fmtPrice(exam.exam.unit_price) : '—' }}
            </span>
          </div>
        </div>

        <!-- Total + action -->
        <div class="eel-card-foot">
          <div class="eel-total">
            <span class="eel-total-label">Total</span>
            <span class="eel-total-value">{{ fmtPrice(totalPrice(group.exams)) }}</span>
          </div>
          <div class="eel-actions">
            <q-chip
              v-if="group.exams.every(e => e.paid)"
              dense color="teal-1" text-color="teal-9"
              icon="las la-check-circle" label="Pago"
              style="font-size: var(--fs-label)"
            />
            <q-btn
              v-else
              unelevated no-caps
              icon="las la-file-invoice-dollar"
              label="Faturar"
              color="primary"
              style="border-radius: var(--r-sm); font-size: var(--fs-label)"
              @click="$router.push({ name: 'emitir-documento-form', params: { medicalConsultationId: group.customerId }, query: { externalExams: group.exams.map(e => e.id).join(',') } })"
            />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { api } from "src/boot/axios";
import io from "src/utils/socket";

const loading = ref(false);
const groups  = ref([]);

const load = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("request-exams/external");
    groups.value = data.data ?? [];
  } finally {
    loading.value = false;
  }
};

const refresh = () => load();
defineExpose({ refresh });

const initials = (name) => {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
};

const fmtPrice = (v) =>
  new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2 }).format(v ?? 0) + " Kz";

const totalPrice = (exams) =>
  exams.reduce((sum, e) => sum + (e.exam?.unit_price ?? 0), 0);

const socket = io(api.defaults.baseURL.slice(0, -4));
onMounted(() => {
  load();
  socket.on("exams:external-done", () => load());
});
</script>

<style scoped lang="scss">
.eel-wrap { width: 100%; }

.eel-state {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 32px 0; color: var(--text-faint); font-size: var(--fs-body); line-height: var(--lh-body);
}

.eel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

.eel-card {
  background: var(--surface); border-radius: var(--r-control);
  border: 1px solid rgba(79,209,197,0.25);
  overflow: hidden; display: flex; flex-direction: column;
  &:hover { background: var(--surface-2); border-color: var(--border-control); }
}

.eel-card-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; border-bottom: 1px solid var(--border-soft); background: var(--surface-3);
}
.eel-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #4fd1c5, var(--st-teal-text));
  color: #fff; font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.eel-patient-info { flex: 1; min-width: 0; }
.eel-patient-name {
  font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text-2);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.eel-sub {
  display: flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--st-teal-text); margin-top: 2px;
}
.eel-count-badge {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--st-teal-text);
  background: rgba(79,209,197,0.1); border: 1px solid rgba(79,209,197,0.3);
  padding: 3px 9px; border-radius: var(--r-pill); white-space: nowrap;
}

.eel-exams { padding: 10px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.eel-exam-row {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 8px; border-radius: var(--r-sm); background: var(--surface-3);
}
.eel-exam-name { flex: 1; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-2); font-weight: 500; }
.eel-price     { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); white-space: nowrap; }

.eel-card-foot {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-top: 1px solid var(--border-soft);
}
.eel-total       { display: flex; flex-direction: column; gap: 1px; }
.eel-total-label { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.5px; }
.eel-total-value { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text-2); }
.eel-actions     { display: flex; align-items: center; gap: 8px; }
</style>
