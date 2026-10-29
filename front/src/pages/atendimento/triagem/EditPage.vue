<template>
  <div class="data-page" v-if="screening">
    <!-- Header -->
    <div class="view-header q-px-md q-pt-md">
      <div class="vh-left">
        <q-btn flat round dense icon="las la-arrow-left" color="grey-5" size="sm"
          @click="$router.push({ name: 'lista-triagem' })" />
        <div>
          <div class="vh-name">{{ screening.customer?.name }}</div>
          <div class="vh-sub">Triagem · {{ fmtDateTime(screening.createdAt) }}</div>
        </div>
      </div>
      <span class="status-badge" :class="statusClass(screening.status)">
        {{ statusLabel(screening.status) }}
      </span>
    </div>

    <div class="q-px-md q-pt-md q-pb-md row q-col-gutter-md">
      <!-- Left: vitals form -->
      <div class="col-md-8 col-xs-12">
        <div class="section-card">
          <div class="sc-header">
            <div class="sc-title">
              <q-icon name="las la-heartbeat" size="15px" style="color: var(--st-ok)" />
              Sinais vitais
            </div>
            <q-btn
              v-if="screening.status !== 'FINISHED'"
              unelevated no-caps label="Concluir triagem"
              icon-right="las la-check"
              color="primary" size="sm"
              style="border-radius: var(--r-sm)"
              :loading
              @click="onSubmit"
            />
          </div>

          <!-- Locked banner -->
          <div v-if="isFinished" class="sc-locked-banner">
            <q-icon name="las la-lock" size="16px" />
            Triagem concluída — registo bloqueado para edição
          </div>

          <div class="sc-body" :class="{ 'sc-body--locked': isFinished }">
            <!-- Biometrics row -->
            <div class="field-row">
              <div class="field-group">
                <div class="field-label">Peso (kg)</div>
                <q-input v-model="form.weight" type="number" borderless
                  class="fi" placeholder="0" :min="0" :max="340" />
              </div>
              <div class="field-group">
                <div class="field-label">Altura (cm)</div>
                <q-input v-model="form.height" type="number" borderless
                  class="fi" placeholder="0" :min="0" :max="240" />
              </div>
            </div>

            <!-- Lifestyle -->
            <div class="field-section-label">Estilo de vida</div>
            <div class="toggle-row">
              <button type="button" class="toggle-pill"
                :class="{ 'toggle-pill--on': form.isSmoker }"
                @click="form.isSmoker = !form.isSmoker">
                <q-icon :name="form.isSmoker ? 'las la-check-circle' : 'las la-circle'" size="14px" />
                Fumante
              </button>
              <button type="button" class="toggle-pill"
                :class="{ 'toggle-pill--on': form.isDrinker }"
                @click="form.isDrinker = !form.isDrinker">
                <q-icon :name="form.isDrinker ? 'las la-check-circle' : 'las la-circle'" size="14px" />
                Bebidas alcoólicas
              </button>
              <button type="button" class="toggle-pill"
                :class="{ 'toggle-pill--on': form.isChronicPatient }"
                @click="form.isChronicPatient = !form.isChronicPatient">
                <q-icon :name="form.isChronicPatient ? 'las la-check-circle' : 'las la-circle'" size="14px" />
                Doença crónica
              </button>
            </div>
            <q-slide-transition>
              <div v-if="form.isChronicPatient" class="q-mt-sm">
                <q-input v-model="form.chronicIll" borderless class="fi"
                  placeholder="Qual doença?" style="max-width:300px" />
              </div>
            </q-slide-transition>

            <!-- Vitals -->
            <div class="field-section-label q-mt-md">Medições</div>

            <div class="vital-grid">
              <!-- Oxygen -->
              <div class="vital-card">
                <div class="vc-icon" style="background:rgba(50,185,137,0.1)">
                  <q-icon name="las la-lungs" size="18px" style="color: var(--st-ok)" />
                </div>
                <div class="vc-label">Saturação O₂</div>
                <div class="vc-options">
                  <label v-for="opt in oxygenOpts" :key="opt.value" class="vc-opt"
                    :class="{ 'vc-opt--active': form.oxygen === opt.value, [`vc-opt--${opt.color}`]: form.oxygen === opt.value }">
                    <input type="radio" v-model="form.oxygen" :value="opt.value" hidden />
                    {{ opt.label }}
                  </label>
                </div>
              </div>

              <!-- Fever -->
              <div class="vital-card">
                <div class="vc-icon" style="background:rgba(252,129,74,0.1)">
                  <q-icon name="las la-thermometer-half" size="18px" style="color: var(--st-warn)" />
                </div>
                <div class="vc-label">Temperatura</div>
                <div class="vc-options">
                  <label v-for="opt in feverOpts" :key="opt.value" class="vc-opt"
                    :class="{ 'vc-opt--active': form.fever === opt.value, [`vc-opt--${opt.color}`]: form.fever === opt.value }">
                    <input type="radio" v-model="form.fever" :value="opt.value" hidden />
                    {{ opt.label }}
                  </label>
                </div>
              </div>

              <!-- Heart rate -->
              <div class="vital-card">
                <div class="vc-icon" style="background:rgba(229,62,62,0.1)">
                  <q-icon name="las la-heartbeat" size="18px" style="color:var(--danger)" />
                </div>
                <div class="vc-label">Freq. cardíaca</div>
                <q-input v-model="form.heartbeatRate" borderless class="fi"
                  placeholder="ex: 80" suffix="bpm" />
              </div>

              <!-- Blood pressure -->
              <div class="vital-card vital-card--wide">
                <div class="vc-icon" style="background:rgba(66,153,225,0.1)">
                  <q-icon name="las la-stethoscope" size="18px" style="color: var(--st-info)" />
                </div>
                <div class="vc-label">Pressão arterial</div>
                <q-input v-model="form.bloodPressure" borderless class="fi"
                  placeholder="ex: 120/80" suffix="mmHg" style="max-width:220px" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: patient info -->
      <div class="col-md-4 col-xs-12">
        <div class="section-card">
          <div class="sc-header">
            <div class="sc-title">
              <q-icon name="las la-user" size="15px" style="color: var(--st-ok)" />
              Paciente
            </div>
          </div>
          <div class="patient-body">
            <div class="pat-avatar">{{ initials(screening.customer?.name) }}</div>
            <div class="pat-name">{{ screening.customer?.name }}</div>
            <div class="pat-sub">{{ screening.customer?.phone ?? '—' }}</div>
          </div>
          <!-- Severity indicator -->
          <div class="severity-block" :style="severity ? { background: severity.bg, borderColor: severity.border } : {}">
            <template v-if="severity">
              <q-icon :name="severity.icon" size="22px" :style="{ color: severity.color }" />
              <div class="sev-text">
                <div class="sev-label" :style="{ color: severity.color }">{{ severity.label }}</div>
                <div class="sev-sub">Baseado nos sinais vitais</div>
              </div>
            </template>
            <template v-else>
              <q-icon name="las la-minus-circle" size="22px" style="color:var(--text-disabled)" />
              <div class="sev-text">
                <div class="sev-label" style="color:var(--text-faint)">Sem dados</div>
                <div class="sev-sub">Preencha os sinais vitais</div>
              </div>
            </template>
          </div>

          <div class="info-rows">
            <div class="ir-row">
              <span class="ir-label">Género</span>
              <span class="ir-val">{{ genderLabel(screening.customer?.gender) }}</span>
            </div>
            <div class="ir-row">
              <span class="ir-label">Idade</span>
              <span class="ir-val">{{ age }}</span>
            </div>
            <div class="ir-row">
              <span class="ir-label">Endereço</span>
              <span class="ir-val">{{ screening.customer?.address ?? '—' }}</span>
            </div>
            <div class="ir-row" v-if="screening.nurse">
              <span class="ir-label">Enfermeiro</span>
              <span class="ir-val">{{ screening.nurse.name }}</span>
            </div>
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
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { SessionStorage } from "quasar";
import { useCommom } from "src/composables/commom";
import { useAttending } from "src/composables/attending";
import { useScreeningStore } from "src/stores/screening";
import { showNotify } from "src/utils/notify";

const { fetchOne } = useCommom("screenings");
const { updateScreening, loading } = useAttending();
const store = useScreeningStore();
const route = useRoute();
const router = useRouter();
const user = SessionStorage.getItem("alfavida_user");

const screening  = ref(null);
const isFinished = computed(() => screening.value?.status === "FINISHED");

const form = reactive({
  isSmoker: false, isDrinker: false, isChronicPatient: false, chronicIll: null,
  weight: null, height: null, oxygen: null, fever: null,
  bloodPressure: null, bloodPressureDescription: null,
  breathingRate: null, heartbeatRate: null,
  nurseId: user?.id,
});

/* ── Options ── */
const oxygenOpts = [
  { label: "96–100%", value: "GREEN", color: "GREEN" },
  { label: "95%", value: "ORANGE", color: "ORANGE" },
  { label: "< 95%", value: "RED", color: "RED" },
];
const feverOpts = [
  { label: "< 37°C", value: "GREEN", color: "GREEN" },
  { label: "37–38°C", value: "ORANGE", color: "ORANGE" },
  { label: "> 39°C", value: "RED", color: "RED" },
];

/* ── Severity ── */
const critScore = (v) => ({ GREEN: 1, ORANGE: 2, RED: 3 }[v] ?? 0);

const bpmScore = (v) => {
  const n = Number(v);
  if (!v || isNaN(n)) return 0;
  if (n >= 60 && n <= 100) return 1;
  if (n >= 40 && n <= 120) return 2;
  return 3;
};

const bpScore = (v) => {
  if (!v) return 0;
  const [sys, dia] = v.split("/").map(Number);
  if (isNaN(sys)) return 0;
  if (sys < 120 && (!dia || dia < 80)) return 1;
  if (sys < 130) return 2;
  return 3;
};

const severity = computed(() => {
  const scores = [
    critScore(form.oxygen),
    critScore(form.fever),
    critScore(form.breathingRate),
    bpmScore(form.heartbeatRate),
    bpScore(form.bloodPressure),
  ];
  const filled = scores.filter((s) => s > 0);
  if (!filled.length) return null;
  const total = scores.reduce((a, b) => a + b, 0);
  if (total <= 5)  return { label: "Não urgente",  color: "#32b989", border: "#32b989", bg: "rgba(50,185,137,0.06)",  icon: "las la-check-circle" };
  if (total <= 10) return { label: "Urgência",     color: "#dd6b20", border: "#dd6b20", bg: "rgba(237,137,54,0.06)",  icon: "las la-exclamation-circle" };
  return           { label: "Emergência",           color: "#e53e3e", border: "#e53e3e", bg: "rgba(229,62,62,0.06)",   icon: "las la-times-circle" };
});

const statusLabel = (s) => ({ PENDING: "Em espera", RUNNING: "Em triagem", FINISHED: "Concluída" }[s] ?? s);
const statusClass = (s) => ({ PENDING: "badge-waiting", RUNNING: "badge-screening", FINISHED: "badge-done" }[s] ?? "");
const genderLabel = (g) => ({ MALE: "Masculino", FEMALE: "Feminino" }[g] ?? "—");
const initials = (name) => name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() ?? "?";

const fmtDateTime = (val) =>
  new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(val));

const age = computed(() => {
  const bday = screening.value?.customer?.birthday;
  if (!bday) return "—";
  const b = new Date(bday.split("T")[0]);
  const today = new Date();
  let a = today.getFullYear() - b.getFullYear();
  if (today.getMonth() < b.getMonth() ||
    (today.getMonth() === b.getMonth() && today.getDate() < b.getDate())) a--;
  return `${a} anos`;
});

const onSubmit = async () => {
  try {
    const { success, message } = await updateScreening(route.params.consultationId, {
      customerId: screening.value.customer.id,
      ...form,
      status: "FINISHED",
    });
    showNotify(message, success);
    router.push({ name: "lista-triagem" });
  } catch (e) {
    console.error(e.message);
  }
};

const fetchScreening = async () => {
  const data = await fetchOne(route.params.consultationId);
  screening.value = data;
  if (data?.fever || data?.weight) Object.assign(form, data);
};

const setRunning = async () => {
  if (screening.value?.status !== "PENDING") return;
  await updateScreening(route.params.consultationId, { status: "RUNNING", nurseId: user?.id });
  screening.value.status = "RUNNING";
};

onMounted(async () => {
  await fetchScreening();
  await setRunning();
});

onUnmounted(() => store.onReset());
</script>

<style scoped lang="scss">
/* ── Header ── */
.view-header {
  display: flex; align-items: center; justify-content: space-between;
}
.vh-left  { display: flex; align-items: center; gap: 10px; }
.vh-name  { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text); }
.vh-sub   { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }

/* ── Status badges ── */
.status-badge {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600;
  padding: 4px 12px; border-radius: var(--r-pill);
}
.badge-waiting   { color: var(--text-muted); background: var(--surface-3); }
.badge-screening { color: var(--st-info-text); background: rgba(66,153,225,0.10); }
.badge-done      { color: var(--st-ok-text); background: rgba(50,185,137,0.10); }

/* ── Section card ── */
.section-card {
  background: var(--surface); border-radius: var(--r-control);
  border: 1px solid var(--border); overflow: hidden;
}
.sc-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid var(--border-soft);
}
.sc-title {
  display: flex; align-items: center; gap: 8px;
  font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text-2);
}
.sc-body { padding: 16px; }
.sc-body--locked { pointer-events: none; opacity: 0.65; user-select: none; }

.sc-locked-banner {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600;
  color: var(--chip-ok); background: rgba(50,185,137,0.08);
  border-bottom: 1px solid rgba(50,185,137,0.2);
}

/* ── Form fields ── */
.field-row {
  display: flex; gap: 16px; margin-bottom: 16px;
}
.field-group { flex: 1; }
.field-label {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-faint);
  text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 6px;
}

.field-section-label {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-faint);
  text-transform: uppercase; letter-spacing: 1px;
  margin-bottom: 10px; padding-bottom: 5px;
  border-bottom: 1px solid var(--border-soft);
}

.toggle-row {
  display: flex; flex-wrap: wrap; gap: 8px;
}

.toggle-pill {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 500; color: var(--text-muted);
  background: var(--surface-3); border: 1.5px solid var(--border-strong);
  border-radius: var(--r-sm); padding: 7px 14px; cursor: pointer;
  transition: all 0.15s;
  outline: none;
  &:hover { border-color: #cbd5e0; background: var(--surface-3); }
}

.toggle-pill--on {
  color: var(--text-2); background: var(--st-ok-tint);
  border-color: var(--st-ok);
  .q-icon { color: var(--st-ok-text); }
}

/* ── Vital cards ── */
.vital-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 4px;
}
.vital-card--wide {
  grid-column: 1 / -1;
}

.vital-card {
  background: var(--surface-2); border-radius: var(--r-sm);
  border: 1px solid var(--border); padding: 12px;
}
.vc-icon {
  width: 32px; height: 32px; border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
}
.vc-label {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-faint);
  text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 8px;
}
.vc-options {
  display: flex; flex-wrap: wrap; gap: 6px;
}
.vc-opt {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 500; color: var(--text-3);
  background: var(--surface); border: 1.5px solid var(--border-strong);
  border-radius: var(--r-sm); padding: 5px 10px; cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: #cbd5e0; }
}
.vc-opt--active { font-weight: 600; }
.vc-opt--GREEN  { color: var(--st-ok-text); border-color: var(--st-ok); background: rgba(50,185,137,0.08); }
.vc-opt--ORANGE { color: var(--st-warn-text); border-color: var(--st-warn); background: rgba(237,137,54,0.08); }
.vc-opt--RED    { color: var(--danger); border-color: var(--st-danger); background: rgba(229,62,62,0.08); }

/* ── Patient card ── */
.patient-body {
  display: flex; flex-direction: column; align-items: center;
  gap: 4px; padding: 16px; border-bottom: 1px solid var(--border-soft);
}
.pat-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent) 0%, #26a69a 100%);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: var(--fs-section); line-height: var(--lh-tight); font-weight: 700;
}
.pat-name { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text-2); margin-top: 4px; }
.pat-sub  { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }

/* ── Severity block ── */
.severity-block {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 16px;
  padding: 12px 14px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--border);
  background: var(--surface-2);
  transition: background 0.2s, border-color 0.2s;
}

.sev-text { display: flex; flex-direction: column; gap: 2px; }
.sev-label { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; }
.sev-sub   { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }

.info-rows { padding: 14px 16px; }
.ir-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 7px 0; border-bottom: 1px solid var(--surface-3);
  &:last-child { border-bottom: none; }
}
.ir-label { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }
.ir-val   { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 500; color: var(--text-2); }

/* ── Loading ── */
.att-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 60px 0; color: var(--text-faint); font-size: var(--fs-label); line-height: var(--lh-tight);
}
</style>
