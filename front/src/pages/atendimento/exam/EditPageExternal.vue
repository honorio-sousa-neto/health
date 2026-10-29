<template>
  <div class="elp-wrap">

    <!-- Top bar -->
    <div class="elp-topbar">
      <q-btn flat round dense icon="las la-arrow-left" color="grey-6"
        @click="$router.push({ name: 'pedidos-exame' })" />
      <div class="elp-topbar-title">
        <q-icon name="las la-flask" size="15px" style="color: var(--st-info)" />
        Lançamento de resultados · Paciente externo
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
    <div v-if="currentData.customer?.name" class="elp-patient-card">
      <div class="epc-avatar">{{ initials(currentData.customer.name) }}</div>
      <div class="epc-info">
        <div class="epc-name">{{ currentData.customer.name }}</div>
        <div class="epc-meta">
          <span v-if="currentData.customer.phone" class="epc-chip">
            <q-icon name="las la-phone" size="12px" />
            {{ currentData.customer.phone }}
          </span>
          <span class="epc-chip epc-chip--external">
            <q-icon name="las la-user-circle" size="12px" />
            Paciente externo
          </span>
        </div>
      </div>
      <div class="epc-stats">
        <div class="epc-stat">
          <span class="epc-stat-val">{{ currentData.exams?.length ?? 0 }}</span>
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

    <div v-else class="elp-patient-card elp-patient-card--loading">
      <q-skeleton type="circle" size="48px" />
      <div style="flex:1">
        <q-skeleton type="text" width="180px" />
        <q-skeleton type="text" width="120px" style="margin-top:6px" />
      </div>
    </div>

    <!-- Concluded banner -->
    <div v-if="isConcluded" class="elp-concluded-banner">
      <q-icon name="las la-check-circle" size="18px" />
      Exames concluídos — resultados bloqueados para edição
    </div>

    <!-- Exam forms -->
    <div class="elp-content">
      <Analysing :request-exams="currentData.exams ?? []" :consultation-id="null" :readonly="isConcluded" @saved="fetchData" />
    </div>

    <!-- Conclude -->
    <div v-if="!isConcluded && (currentData.exams ?? []).some((e) => e.paid)" class="elp-footer">
      <div class="elp-footer-hint">
        <q-icon name="las la-info-circle" size="14px" style="color: var(--st-info)" />
        Guarde os resultados antes de concluir. A recepção será notificada ao concluir.
      </div>
      <q-btn
        unelevated no-caps
        icon="las la-check-circle"
        label="Concluir e notificar recepção"
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
import { api } from "src/boot/axios";
import { showNotify } from "src/utils/notify";
import Analysing from "src/pages/attending/components/Analysing.vue";
import { printExamResult } from "src/utils/reports/examResult";
import { useCompanyStore } from "src/stores/company";

const route        = useRoute();
const router       = useRouter();
const concluding   = ref(false);
const companyStore = useCompanyStore();

const currentData = reactive({
  customer: null,
  exams: [],
});

const isConcluded  = computed(() => (currentData.exams ?? []).some((e) => e.concludedAt));
const paidExams    = computed(() => (currentData.exams ?? []).filter((e) => e.paid).length);
const pendingExams = computed(() => (currentData.exams ?? []).filter((e) => !e.paid).length);
const hasResults   = computed(() =>
  (currentData.exams ?? []).some(
    (e) => e.paid && (e.resultColor || e.resultText || (Array.isArray(e.result) && e.result.length))
  )
);

const exportPdf = () => {
  const c  = companyStore.data?.data;
  const ok = printExamResult({
    clinic:  { name: c?.nome ?? c?.name, phone: c?.phone, address: c?.address },
    patient: {
      name:     currentData.customer?.name,
      phone:    currentData.customer?.phone,
      birthday: currentData.customer?.birthday,
    },
    doctor: null,
    date:   new Date().toISOString(),
    exams:  currentData.exams ?? [],
  });
  if (!ok) showNotify("Erro ao gerar PDF — verifique os dados dos exames", false);
};

const initials = (name) => {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
};

const conclude = async () => {
  concluding.value = true;
  try {
    const { data } = await api.patch(`request-exams/conclude/${route.params.customerId}`);
    if (data?.success) {
      showNotify("Resultados enviados à recepção", true);
      router.push({ name: "pedidos-exame" });
    } else {
      showNotify(data?.message || "Erro ao concluir exames", false);
    }
  } catch {
    showNotify("Erro ao concluir exames", false);
  } finally {
    concluding.value = false;
  }
};

const fetchData = async () => {
  const { data } = await api.get(`request-exams/external/${route.params.customerId}`);
  Object.assign(currentData, data.data);
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

.elp-topbar {
  display: flex; align-items: center; gap: 10px;
}
.elp-topbar-title {
  display: flex; align-items: center; gap: 7px;
  font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text-2);
}

.elp-patient-card {
  display: flex; align-items: center; gap: 16px;
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  padding: 16px 20px;
}
.elp-patient-card--loading { min-height: 80px; }

.epc-avatar {
  width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #4fd1c5, var(--st-teal-text));
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
.epc-chip--external {
  color: var(--st-teal-text); background: rgba(79,209,197,0.08); border-color: rgba(79,209,197,0.3);
}

.epc-stats {
  display: flex; align-items: center; gap: 16px;
  padding-left: 20px; border-left: 1px solid var(--border); flex-shrink: 0;
}
.epc-stat          { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.epc-stat-val      { font-size: var(--fs-heading); font-weight: 700; color: var(--text-2); line-height: 1; }
.epc-stat-label    { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.5px; }
.epc-stat-divider  { width: 1px; height: 28px; background: var(--border); }

.elp-concluded-banner {
  display: flex; align-items: center; gap: 8px;
  background: var(--st-ok-tint); border: 1px solid #9ae6b4; border-radius: var(--r-sm);
  padding: 12px 18px; font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 600; color: var(--chip-ok);
}

.elp-content { display: flex; flex-direction: column; }

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
