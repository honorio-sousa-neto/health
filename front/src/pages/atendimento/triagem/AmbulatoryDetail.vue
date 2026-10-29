<template>
  <div class="det-page">

    <!-- Header -->
    <div class="det-header">
      <q-btn flat round dense icon="las la-arrow-left" color="grey-5" size="sm"
        @click="$router.push({ name: 'lista-ambulatorio' })" />
      <div>
        <div class="det-title">{{ plan?.customer?.name ?? '—' }}</div>
        <div class="det-sub">Plano ambulatório · {{ totalDays }} dias · {{ totalSessions }} sessões</div>
      </div>
      <div class="det-progress">
        <q-circular-progress
          :value="progressPct" size="48px" :thickness="0.16"
          color="teal" track-color="grey-2" show-value font-size="11px"
        >{{ doneSessions }}/{{ totalSessions }}</q-circular-progress>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="det-state">
      <q-spinner-dots color="teal" size="28px" />
    </div>

    <!-- Days -->
    <div v-else class="det-body">
      <div v-for="day in days" :key="day.number" class="day-block">

        <!-- Day header -->
        <div class="day-head" :class="{ 'day-head--done': day.allDone }">
          <div class="day-num">
            <q-icon v-if="day.allDone" name="las la-check-circle" size="16px" style="color: var(--st-teal)" />
            <span v-else class="day-circle">{{ day.number }}</span>
            Dia {{ day.number }}
          </div>
          <div class="day-stat">{{ day.done }}/{{ day.sessions.length }} concluídas</div>
        </div>

        <!-- Sessions in this day -->
        <div class="day-sessions">
          <div
            v-for="s in day.sessions" :key="s.id"
            class="sess-row"
            :class="{ 'sess-row--done': !!s.doneAt }"
          >
            <!-- Checkbox -->
            <button
              class="sess-check"
              :class="{ 'sess-check--done': !!s.doneAt }"
              :disabled="!!s.doneAt || markingId === s.id"
              @click="markDone(s)"
            >
              <q-spinner-dots v-if="markingId === s.id" size="14px" color="teal" />
              <q-icon
                v-else
                :name="s.doneAt ? 'las la-check-circle' : 'lar la-circle'"
                size="20px"
              />
            </button>

            <!-- Info -->
            <div class="sess-info">
              <div class="sess-name">{{ s.service.name }}</div>
              <div class="sess-meta">
                <span
                  v-if="s.service.classificacao"
                  class="sess-clf"
                  :class="`sess-clf--${s.service.classificacao.toLowerCase()}`"
                >{{ s.service.classificacao }}</span>
                <span v-if="day.freqPerDay > 1" class="sess-dose">
                  {{ s.timeOfDay }}ª dose
                </span>
              </div>
            </div>

            <!-- Done time -->
            <div v-if="s.doneAt" class="sess-time">
              <q-icon name="las la-clock" size="12px" />
              {{ fmtTime(s.doneAt) }}
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { SessionStorage } from "quasar";
import { api } from "src/boot/axios";
import { showNotify } from "src/utils/notify";

const route     = useRoute();
const user      = SessionStorage.getItem("alfavida_user");
const plan      = ref(null);
const loading   = ref(false);
const markingId = ref(null);

const fetchPlan = async () => {
  loading.value = true;
  try {
    const { data } = await api.get(`ambulatory-plans/${route.params.planId}`);
    plan.value = data.data ?? null;
  } catch (_) {
    showNotify("Erro ao carregar plano", false);
  } finally {
    loading.value = false;
  }
};

// Group sessions by day, keeping timeOfDay order
const days = computed(() => {
  if (!plan.value?.sessions) return [];
  const map = {};
  for (const s of plan.value.sessions) {
    if (!map[s.day]) map[s.day] = { number: s.day, sessions: [], done: 0, freqPerDay: 0 };
    map[s.day].sessions.push(s);
    if (s.doneAt) map[s.day].done++;
  }
  // freqPerDay = max timeOfDay in the day
  for (const d of Object.values(map)) {
    d.freqPerDay = Math.max(...d.sessions.map(s => s.timeOfDay));
    d.allDone = d.done === d.sessions.length;
  }
  return Object.values(map).sort((a, b) => a.number - b.number);
});

const totalSessions = computed(() => plan.value?.sessions?.length ?? 0);
const doneSessions  = computed(() => plan.value?.sessions?.filter(s => s.doneAt).length ?? 0);
const totalDays     = computed(() => days.value.length);
const progressPct   = computed(() =>
  totalSessions.value ? Math.round((doneSessions.value / totalSessions.value) * 100) : 0
);

const markDone = async (session) => {
  markingId.value = session.id;
  try {
    await api.patch(`ambulatory-plans/${session.id}/done`, { doneById: user?.id });
    session.doneAt = new Date().toISOString();
    // update day counter reactively
    const day = days.value.find(d => d.sessions.some(s => s.id === session.id));
    if (day) {
      day.done++;
      day.allDone = day.done === day.sessions.length;
    }
  } catch (e) {
    showNotify(e?.response?.data?.message || "Erro ao registar sessão", false);
  } finally {
    markingId.value = null;
  }
};

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });

onMounted(fetchPlan);
</script>

<style scoped lang="scss">
.det-page { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

// ── Header ──
.det-header {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 20px; border-bottom: 1px solid var(--border);
  background: var(--surface-2); flex-shrink: 0;
}
.det-title  { font-size: var(--fs-section); line-height: var(--lh-tight); font-weight: 700; color: var(--text); }
.det-sub    { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); margin-top: 2px; }
.det-progress { margin-left: auto; flex-shrink: 0; }

// ── States ──
.det-state {
  flex: 1; display: flex; align-items: center; justify-content: center;
  color: var(--text-faint); gap: 10px;
}

// ── Body ──
.det-body {
  flex: 1; overflow-y: auto; padding: 20px;
  display: flex; flex-direction: column; gap: 16px;
}

// ── Day block ──
.day-block {
  background: var(--surface); border: 1.5px solid var(--border);
  border-radius: var(--r-control); overflow: hidden;
}
.day-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; background: var(--surface-3);
  border-bottom: 1px solid var(--border);
  &--done { background: rgba(13,148,136,0.06); border-color: rgba(13,148,136,0.15); }
}
.day-num {
  display: flex; align-items: center; gap: 8px;
  font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--st-info-text);
}
.day-circle {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  background: var(--border-strong); color: var(--text-faint); font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.day-stat { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); }

// ── Sessions ──
.day-sessions { display: flex; flex-direction: column; }
.sess-row {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-bottom: 1px solid var(--surface-3);
  transition: background 0.12s;
  &:last-child { border-bottom: none; }
  &--done { background: rgba(13,148,136,0.03); }
  &:not(.sess-row--done):hover { background: var(--surface-3); }
}
.sess-check {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  background: transparent; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-disabled); transition: color 0.12s;
  &--done { color: var(--st-teal-text); cursor: default; }
  &:not(.sess-check--done):not(:disabled):hover { color: var(--st-teal-text); }
  &:disabled { cursor: default; }
}
.sess-info  { flex: 1; min-width: 0; }
.sess-name  { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 600; color: var(--text); }
.sess-meta  { display: flex; align-items: center; gap: 6px; margin-top: 3px; }
.sess-dose  { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); }
.sess-clf {
  display: inline-flex; padding: 1px 7px; border-radius: var(--r-sm);
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: #fff;
  &--alfa { background: #38a169; }
  &--beta { background: #d97706; }
  &--gama { background: var(--st-danger); }
}
.sess-time {
  display: flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); flex-shrink: 0;
}
</style>
