<template>
  <div class="amb-page">
    <div class="amb-header">
      <Breadcrumbs>
        <template #children>
          <q-breadcrumbs-el label="Ambulatório" active-class="text-h6 text-weight-regular text-teal-8"
            :to="{ name: 'lista-ambulatorio' }" />
        </template>
      </Breadcrumbs>
    </div>

    <div v-if="loading" class="amb-state">
      <q-spinner-dots color="teal" size="28px" />
    </div>
    <div v-else-if="!plans.length" class="amb-state">
      <q-icon name="las la-syringe" size="44px" style="color:var(--text-disabled)" />
      <span>Nenhum plano ambulatório activo</span>
    </div>

    <div v-else class="amb-list">
      <div
        v-for="plan in plans" :key="plan.id"
        class="amb-card"
        @click="$router.push({ name: 'detalhe-ambulatorio', params: { planId: plan.id } })"
      >
        <div class="ac-avatar">{{ initials(plan.customer.name) }}</div>
        <div class="ac-info">
          <div class="ac-name">{{ plan.customer.name }}</div>
          <div class="ac-meta">{{ totalDays(plan) }} dias · {{ doneSessions(plan) }}/{{ plan.sessions.length }} sessões</div>
        </div>
        <div class="ac-right">
          <q-circular-progress
            :value="progressPct(plan)" size="40px" :thickness="0.18"
            color="teal" track-color="grey-2" show-value font-size="10px"
          >{{ progressPct(plan) }}%</q-circular-progress>
          <q-icon name="las la-angle-right" size="16px" style="color:var(--text-disabled)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import { api } from "src/boot/axios";
import { showNotify } from "src/utils/notify";

const plans   = ref([]);
const loading = ref(false);

const fetchPlans = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("ambulatory-plans");
    plans.value = data.data ?? [];
  } catch (_) {
    showNotify("Erro ao carregar planos", false);
  } finally {
    loading.value = false;
  }
};

const doneSessions = (plan) => plan.sessions.filter(s => s.doneAt).length;
const progressPct  = (plan) => plan.sessions.length
  ? Math.round((doneSessions(plan) / plan.sessions.length) * 100) : 0;
const totalDays    = (plan) => plan.sessions.length
  ? Math.max(...plan.sessions.map(s => s.day)) : 0;
const initials     = (name) =>
  (name ?? "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

onMounted(fetchPlans);
</script>

<style scoped lang="scss">
.amb-page   { display: flex; flex-direction: column; gap: 16px; padding: 20px; height: 100%; overflow-y: auto; }
.amb-header { flex-shrink: 0; }
.amb-state  { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--text-faint); font-size: var(--fs-title); line-height: var(--lh-tight); }

.amb-list { display: flex; flex-direction: column; gap: 8px; }

.amb-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; background: var(--surface);
  border: 1.5px solid var(--border); border-radius: var(--r-control);
  cursor: pointer; transition: all 0.15s;
  &:hover { border-color: #b2f5ea; }
}
.ac-avatar {
  width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--st-teal), #0f766e);
  color: #fff; font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.ac-info   { flex: 1; min-width: 0; }
.ac-name   { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text); }
.ac-meta   { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); margin-top: 2px; }
.ac-right  { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
</style>
