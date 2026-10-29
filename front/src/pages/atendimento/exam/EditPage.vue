<template>
  <div class="elp-wrap">

    <!-- Top bar -->
    <div class="elp-topbar">
      <q-btn flat round dense icon="las la-arrow-left" color="grey-6"
        @click="$router.push({ name: 'pedidos-exame' })" />
      <div class="elp-topbar-title">
        <q-icon name="las la-flask" size="15px" style="color: var(--st-info)" />
        Lançamento de resultados
      </div>
      <q-btn
        flat no-caps dense
        icon="las la-file-pdf"
        label="Exportar PDF"
        color="grey-7"
        style="margin-left:auto; border-radius: var(--r-sm); font-size: var(--fs-label)"
        :disable="!hasResults"
        @click="exportPdf"
      />
    </div>

    <!-- Patient card -->
    <div v-if="currentData.screening?.customer?.name" class="elp-patient-card">
      <div class="epc-avatar">{{ initials(currentData.screening.customer.name) }}</div>
      <div class="epc-info">
        <div class="epc-name">{{ currentData.screening.customer.name }}</div>
        <div class="epc-meta">
          <span v-if="age" class="epc-chip">
            <q-icon name="las la-birthday-cake" size="12px" />
            {{ age }} anos
          </span>
          <span v-if="currentData.screening?.customer?.phone" class="epc-chip">
            <q-icon name="las la-phone" size="12px" />
            {{ currentData.screening.customer.phone }}
          </span>
          <span v-if="currentData.doctor?.name" class="epc-chip epc-chip--doctor">
            <q-icon name="las la-user-md" size="12px" />
            Dr. {{ currentData.doctor.name }}
          </span>
        </div>
      </div>
      <div class="epc-stats">
        <div class="epc-stat">
          <span class="epc-stat-val">{{ totalExams }}</span>
          <span class="epc-stat-label">Exames</span>
        </div>
        <div class="epc-stat-divider" />
        <div class="epc-stat">
          <span class="epc-stat-val" style="color: var(--st-ok-text)">{{ paidExams }}</span>
          <span class="epc-stat-label">Faturados</span>
        </div>
        <div class="epc-stat-divider" />
        <div class="epc-stat">
          <span class="epc-stat-val" style="color:var(--chip-warn)">{{ pendingExams }}</span>
          <span class="epc-stat-label">Pendentes</span>
        </div>
      </div>
    </div>

    <!-- Skeleton while loading -->
    <div v-else class="elp-patient-card elp-patient-card--loading">
      <q-skeleton type="circle" size="48px" />
      <div style="flex:1">
        <q-skeleton type="text" width="180px" />
        <q-skeleton type="text" width="120px" style="margin-top:6px" />
      </div>
    </div>

    <!-- Locked banner when already sent to doctor -->
    <div v-if="isLocked" class="elp-locked-banner">
      <q-icon name="las la-lock" size="15px" />
      Resultados já enviados ao médico — registo bloqueado para edição
    </div>

    <!-- Exam forms -->
    <div class="elp-content">
      <Analysing :request-exams="currentData.exams" :readonly="isLocked" @saved="fetchData" />
    </div>

    <!-- Conclude -->
    <div v-if="!isLocked && currentData.exams.some((e) => e.paid)" class="elp-footer">
      <div class="elp-footer-hint">
        <q-icon name="las la-info-circle" size="14px" style="color: var(--st-info)" />
        Guarde os resultados antes de concluir. O médico será notificado ao concluir.
      </div>
      <q-btn
        unelevated no-caps
        icon="las la-check-circle"
        label="Concluir e enviar ao médico"
        color="teal-8"
        :loading="concluding"
        style="border-radius: var(--r-sm); font-size: var(--fs-body)"
        @click="conclude"
      />
    </div>

  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeMount, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCreateUpdate } from "src/composables/create-update";
import { api } from "src/boot/axios";
import { showNotify } from "src/utils/notify";
import Analysing from "src/pages/attending/components/Analysing.vue";
import { printExamResult } from "src/utils/reports/examResult";
import { useCompanyStore } from "src/stores/company";

const { fetchOne } = useCreateUpdate("consultations");
const route        = useRoute();
const router       = useRouter();
const concluding   = ref(false);
const companyStore = useCompanyStore();
const isLocked     = computed(() => currentData.stage === "EXAM_RESULT");
const hasResults   = computed(() =>
  currentData.exams.some(
    (e) => e.paid && (e.resultColor || e.resultText || (Array.isArray(e.result) && e.result.length))
  )
);

const exportPdf = () => {
  const c = companyStore.data?.data;
  printExamResult({
    clinic:   { name: c?.nome ?? c?.name, phone: c?.phone, address: c?.address },
    patient:  {
      name:     currentData.screening?.customer?.name,
      phone:    currentData.screening?.customer?.phone,
      birthday: currentData.screening?.customer?.birthday,
    },
    doctor:   { name: currentData.doctor?.name },
    date:     currentData.createdAt,
    exams:    currentData.exams,
  });
};

const conclude = async () => {
  concluding.value = true;
  try {
    await api.patch(`consultations/${route.params.medicalConsultationId}`, {
      stage: "EXAM_RESULT",
    });
    showNotify("Resultados enviados ao médico", true);
    router.push({ name: "pedidos-exame" });
  } catch (_) {
    showNotify("Erro ao concluir", false);
  } finally {
    concluding.value = false;
  }
};

const currentData = reactive({
  screening: { customer: { name: null, phone: null, birthday: null, address: null } },
  doctor: null,
  exams: [],
  observation: [],
  stage: null,
});

const age = computed(() => {
  const b = currentData.screening?.customer?.birthday;
  if (!b) return null;
  const bd = new Date(b);
  const today = new Date();
  let a = today.getFullYear() - bd.getFullYear();
  if (today.getMonth() < bd.getMonth() || (today.getMonth() === bd.getMonth() && today.getDate() < bd.getDate())) a--;
  return a > 0 ? a : null;
});

const totalExams   = computed(() => currentData.exams.length);
const paidExams    = computed(() => currentData.exams.filter((e) => e.paid).length);
const pendingExams = computed(() => currentData.exams.filter((e) => !e.paid).length);


const initials = (name) => {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
};

const fetchData = async () => {
  const response = await fetchOne(route.params.medicalConsultationId);
  Object.assign(currentData, response);
  const observationExams = [];
  (response.observation ?? []).forEach((item) => {
    observationExams.push(...(item.exams ?? []));
  });
  currentData.exams.push(...observationExams);
};

onBeforeMount(async () => {
  await fetchData();
  await nextTick();
});
</script>

<style scoped lang="scss">
.elp-wrap {
  display: flex; flex-direction: column; gap: 20px;
  padding: 20px 24px; max-width: 900px;
}

/* Top bar */
.elp-topbar {
  display: flex; align-items: center; gap: 10px;
}
.elp-topbar-title {
  display: flex; align-items: center; gap: 7px;
  font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text-2);
}

/* Patient card */
.elp-patient-card {
  display: flex; align-items: center; gap: 16px;
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  padding: 16px 20px;
}
.elp-patient-card--loading { min-height: 80px; }

.epc-avatar {
  width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #4299e1, var(--st-info));
  color: #fff; font-size: var(--fs-section); line-height: var(--lh-tight); font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.epc-info   { flex: 1; min-width: 0; }
.epc-name   { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text); margin-bottom: 6px; }
.epc-meta   { display: flex; flex-wrap: wrap; gap: 6px; }
.epc-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); background: var(--surface-3);
  border: 1px solid var(--border-strong); border-radius: var(--r-pill); padding: 3px 9px;
}
.epc-chip--doctor {
  color: var(--chip-info); background: rgba(66,153,225,0.08); border-color: rgba(66,153,225,0.25);
}

.epc-stats {
  display: flex; align-items: center; gap: 16px;
  padding-left: 20px; border-left: 1px solid var(--border);
  flex-shrink: 0;
}
.epc-stat          { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.epc-stat-val      { font-size: var(--fs-heading); font-weight: 700; color: var(--text-2); line-height: 1; }
.epc-stat-label    { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.5px; }
.epc-stat-divider  { width: 1px; height: 28px; background: var(--border); }

/* Locked banner */
.elp-locked-banner {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-radius: var(--r-sm);
  background: rgba(50,185,137,0.08); border: 1px solid rgba(50,185,137,0.25);
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--chip-ok);
}

/* Content */
.elp-content { display: flex; flex-direction: column; }

/* Footer */
.elp-footer {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  padding: 16px 20px;
}
.elp-footer-hint {
  display: flex; align-items: center; gap: 7px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted);
}
</style>
