<template>
  <div class="data-page" v-if="consultation">
    <!-- Header -->
    <div class="view-header q-px-md q-pt-md">
      <div class="vh-left">
        <q-btn flat round dense icon="las la-arrow-left" color="grey-5" size="sm"
          @click="$router.push({ name: 'medico-lista-atendimento' })" />
        <div>
          <div class="vh-name">{{ consultation.screening?.customer?.name }}</div>
          <div class="vh-sub">Consulta · {{ fmtDateTime(consultation.screening?.createdAt) }}</div>
        </div>
      </div>
      <span class="sev-badge" :style="severityStyle(consultation.screening)">
        <q-icon :name="severityIcon(consultation.screening)" size="13px" />
        {{ severityLabel(consultation.screening) }}
      </span>
    </div>

    <!-- ── Barra de resumo (lê-se em 2 segundos) ── -->
    <div class="cons-summary q-px-md q-pt-md">
      <div class="cs-item" :class="'cs--' + statusInfo.tone">
        <q-icon :name="statusInfo.icon" size="16px" />
        <div><span class="cs-lbl">Consulta</span><span class="cs-val">{{ statusInfo.label }}</span></div>
      </div>

      <div class="cs-item" :class="countAltered ? 'cs--bad' : 'cs--ok'">
        <q-icon name="las la-vial" size="16px" />
        <div>
          <span class="cs-lbl">Exames alterados</span>
          <span class="cs-val">{{ countAltered }}<span class="cs-sub"> de {{ allExams.length }}</span></span>
        </div>
      </div>

      <div class="cs-item" :class="vitalsAltered ? 'cs--warn' : 'cs--ok'">
        <q-icon name="las la-heartbeat" size="16px" />
        <div>
          <span class="cs-lbl">Sinais vitais</span>
          <span class="cs-val">{{ vitalsAltered ? vitalsAltered + ' fora do normal' : 'Normais' }}</span>
        </div>
      </div>

      <div v-for="c in criticalExams" :key="'crit-' + c.id" class="cs-item cs--bad cs-crit">
        <q-icon name="las la-exclamation-triangle" size="16px" />
        <div><span class="cs-lbl">Crítico</span><span class="cs-val">{{ critLabelFor(c) }}</span></div>
      </div>
    </div>

    <div class="q-px-md q-pt-md q-pb-md row q-col-gutter-md">

      <!-- Left: consultation form -->
      <div class="col-md-8 col-xs-12">
        <ConsultationForm
          :key="consultation.id"
          :screening="consultation.screening"
          :exams="consultation.exams"
          :observation="Array.isArray(consultation.observation) ? consultation.observation[0] : consultation.observation"
          :observations="Array.isArray(consultation.observation) ? consultation.observation : (consultation.observation ? [consultation.observation] : [])"
          :internment="consultation.internment"
          :prescriptions="consultation.prescriptions ?? []"
          :description="consultation.description"
          :stage="consultation.stage"
          :results="consultation.exams"
          :diagnosis="consultation.diagnosis"
          :status="consultation.status"
          @concluded="fetchData"
          @updated="fetchData"
        />
      </div>

      <!-- Right: patient + screening data (acompanha o scroll em ecrã largo) -->
      <div class="col-md-4 col-xs-12 column q-col-gutter-sm cons-right">

        <!-- Patient card (compacto) -->
        <div class="col-auto">
          <div class="section-card patient-card">
            <div class="pc-top">
              <div class="pat-avatar">{{ initials(consultation.screening?.customer?.name) }}</div>
              <div class="pc-id">
                <div class="pat-name">{{ consultation.screening?.customer?.name ?? '—' }}</div>
                <div class="pc-meta">
                  <span>{{ genderLabel(consultation.screening?.customer?.gender) }}</span>
                  <span v-if="age !== '—'">·&nbsp;{{ age }}</span>
                  <span v-if="consultation.screening?.customer?.phone">·&nbsp;{{ consultation.screening.customer.phone }}</span>
                </div>
              </div>
            </div>
            <div v-if="consultation.screening?.customer?.address" class="pc-address">
              <q-icon name="las la-map-marker" size="12px" />
              {{ consultation.screening.customer.address }}
            </div>
          </div>
        </div>

        <!-- Screening data card -->
        <div class="col-auto">
          <div class="section-card">
            <div class="sc-header">
              <div class="sc-title">
                <q-icon name="las la-heartbeat" size="15px" style="color: var(--st-ok)" />
                Triagem
              </div>
            </div>
            <div class="vitals-grid">
              <div class="vg-item" v-for="v in vitals" :key="v.label" :class="'vg--' + v.state">
                <div class="vg-label">{{ v.label }}</div>
                <div v-if="v.state === 'missing'" class="vg-value vg-missing-val">
                  <q-icon name="las la-minus-circle" size="11px" /> Em falta
                </div>
                <div v-else class="vg-value">{{ v.value }}</div>
              </div>
            </div>
            <div v-if="consultation.screening" class="lifestyle-row">
              <span v-if="consultation.screening.isSmoker"  class="ls-chip">Fumador</span>
              <span v-if="consultation.screening.isDrinker" class="ls-chip">Álcool</span>
              <span v-if="consultation.screening.isChronicPatient" class="ls-chip ls-chip--warn">
                Crónico{{ consultation.screening.chronicIll ? `: ${consultation.screening.chronicIll}` : '' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Mini-resumo dos exames alterados (aproveita o espaço vazio) -->
        <div v-if="allExams.length" class="col-auto">
          <div class="section-card">
            <div class="sc-header">
              <div class="sc-title">
                <q-icon name="las la-vial" size="15px" style="color:var(--danger)" />
                Exames alterados
              </div>
            </div>
            <div class="mini-altered">
              <template v-if="alteredExams.length">
                <div v-for="e in alteredExams" :key="'ma-' + e.id" class="ma-row">
                  <span class="ma-name">{{ e.exam?.name ?? '—' }}</span>
                  <span class="ma-badge">Alterado</span>
                </div>
              </template>
              <div v-else class="ma-none">
                <q-icon name="las la-check-circle" size="14px" />
                Nenhum exame alterado
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <div v-else-if="loadingScreening" class="att-state">
    <q-spinner-dots color="primary" size="28px" />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { SessionStorage } from "quasar";
import { useCreateUpdate } from "src/composables/create-update";
import { useScreeningStore } from "src/stores/screening";
import ConsultationForm from "./components/ConsultationForm.vue";

const { fetchOne } = useCreateUpdate("consultations");
const store = useScreeningStore();
const route = useRoute();
const router = useRouter();

const consultation = ref(null);
const loadingScreening = ref(false);

/* ── Severity ── */
const critScore = (v) => ({ GREEN: 1, ORANGE: 2, RED: 3 }[v] ?? 0);
const bpmScore  = (v) => { const n = Number(v); if (!v || isNaN(n)) return 0; if (n >= 60 && n <= 100) return 1; if (n >= 40 && n <= 120) return 2; return 3; };
const bpScore   = (v) => { if (!v) return 0; const [s, d] = v.split("/").map(Number); if (isNaN(s)) return 0; if (s < 120 && (!d || d < 80)) return 1; if (s < 130) return 2; return 3; };
const sevScore  = (s) => !s ? 0 : critScore(s.oxygen) + critScore(s.fever) + critScore(s.breathingRate) + bpmScore(s.heartbeatRate) + bpScore(s.bloodPressure);

const severityLabel = (s) => { const t = sevScore(s); if (!t) return "Sem dados"; if (t <= 5) return "Não urgente"; if (t <= 10) return "Urgência"; return "Emergência"; };
const severityIcon  = (s) => { const t = sevScore(s); if (t <= 5) return "las la-check-circle"; if (t <= 10) return "las la-exclamation-circle"; return "las la-times-circle"; };
const severityStyle = (s) => {
  const t = sevScore(s);
  if (!t) return { color: "var(--text-faint)", background: "#f7f8fc" };
  if (t <= 5)  return { color: "#32b989", background: "rgba(50,185,137,0.08)", borderColor: "#32b989" };
  if (t <= 10) return { color: "#dd6b20", background: "rgba(237,137,54,0.08)", borderColor: "#dd6b20" };
  return { color: "#e53e3e", background: "rgba(229,62,62,0.08)", borderColor: "#e53e3e" };
};

/* ── Helpers ── */
const initials   = (name) => name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() ?? "?";
const genderLabel = (g) => ({ MALE: "Masculino", FEMALE: "Feminino" }[g] ?? "—");
const fmtDateTime = (val) => val ? new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(val)) : "—";

const age = computed(() => {
  const bday = consultation.value?.screening?.customer?.birthday;
  if (!bday) return "—";
  const b = new Date(bday.split("T")[0]);
  const today = new Date();
  let a = today.getFullYear() - b.getFullYear();
  if (today.getMonth() < b.getMonth() || (today.getMonth() === b.getMonth() && today.getDate() < b.getDate())) a--;
  return `${a} anos`;
});

const critLabel = (v) => ({ GREEN: "Normal", ORANGE: "Alterado", RED: "Grave" }[v] ?? "—");

const vitals = computed(() => {
  const s = consultation.value?.screening;
  if (!s) return [];
  // state: ok | warn | bad | plain (medições sem intervalo) | missing (em falta)
  return [
    { label: "Peso",           value: s.weight ? `${s.weight} kg` : "",  state: s.weight ? "plain" : "missing" },
    { label: "Altura",         value: s.height ? `${s.height} cm` : "",  state: s.height ? "plain" : "missing" },
    { label: "Oxigénio",       value: s.oxygen ? critLabel(s.oxygen) : "", state: critState(s.oxygen) },
    { label: "Temperatura",    value: s.fever ? critLabel(s.fever) : "",   state: critState(s.fever) },
    { label: "Freq. resp.",    value: s.breathingRate ? critLabel(s.breathingRate) : "", state: critState(s.breathingRate) },
    { label: "Freq. cardíaca", value: s.heartbeatRate ? `${s.heartbeatRate} bpm` : "", state: bpmState(s.heartbeatRate) },
    { label: "Pressão art.",   value: s.bloodPressure ? `${s.bloodPressure} mmHg` : "", state: bpState(s.bloodPressure) },
  ];
});

/* ── Resumo da consulta (barra de estado no topo) ── */
// Reúne todos os exames da consulta (diretos + observação + internamento),
// tal como o ecrã de resultados, sem alterar dados nem API.
const allExams = computed(() => {
  const c = consultation.value;
  if (!c) return [];
  const list = [...(c.exams ?? [])];
  const obs = Array.isArray(c.observation) ? c.observation : c.observation ? [c.observation] : [];
  obs.forEach((o) => list.push(...(o?.exams ?? [])));
  const ints = Array.isArray(c.internment) ? c.internment : c.internment ? [c.internment] : [];
  ints.forEach((i) => list.push(...(i?.exams ?? [])));
  return list;
});
const alteredExams  = computed(() => allExams.value.filter((e) => e.resultColor === "RED"));
const countAltered  = computed(() => alteredExams.value.length);

// Achados críticos que devem saltar à vista (ex.: HIV+).
const CRIT_RX = /hiv|vih|hepatite|sífilis|sifilis|covid/i;
const criticalExams = computed(() => alteredExams.value.filter((e) => CRIT_RX.test(e.exam?.name ?? "")));
const critLabelFor = (e) => (/hiv|vih/i.test(e.exam?.name ?? "") ? "HIV positivo" : `${e.exam?.name ?? "Exame"} alterado`);

// Estado de cada sinal vital: ok | warn | bad | missing (reutilizado no Passo 5).
const critState = (v) => (v ? ({ GREEN: "ok", ORANGE: "warn", RED: "bad" }[v] ?? "missing") : "missing");
const bpmState  = (v) => { const n = Number(v); if (!v || isNaN(n)) return "missing"; if (n >= 60 && n <= 100) return "ok"; if (n >= 40 && n <= 120) return "warn"; return "bad"; };
const bpState   = (v) => { if (!v) return "missing"; const [s, d] = String(v).split("/").map(Number); if (isNaN(s)) return "missing"; if (s < 120 && (!d || d < 80)) return "ok"; if (s < 130) return "warn"; return "bad"; };
const vitalsAltered = computed(() => {
  const s = consultation.value?.screening;
  if (!s) return 0;
  return [critState(s.oxygen), critState(s.fever), critState(s.breathingRate), bpmState(s.heartbeatRate), bpState(s.bloodPressure)]
    .filter((x) => x === "warn" || x === "bad").length;
});

const statusInfo = computed(() => {
  const st = consultation.value?.status;
  if (st === "done")    return { label: "Terminada", icon: "las la-check-circle",   tone: "ok" };
  if (st === "running") return { label: "Em curso",  icon: "las la-hourglass-half", tone: "info" };
  return { label: "Pendente", icon: "las la-clock", tone: "muted" };
});

const fetchData = async () => {
  const consultationId = route.params.consultationId;
  if (consultation.value?.id !== consultationId) consultation.value = null;
  try {
    loadingScreening.value = true;
    const data = await fetchOne(consultationId);
    if (route.params.consultationId === consultationId) consultation.value = data;
  } finally {
    loadingScreening.value = false;
  }
};

watch(() => route.params.consultationId, (id) => { if (id) fetchData(); });
onMounted(fetchData);
onUnmounted(() => store.onReset());
</script>

<style scoped lang="scss">
/* ── Header ── */
.view-header { display: flex; align-items: center; justify-content: space-between; }
.vh-left     { display: flex; align-items: center; gap: 10px; }
.vh-name     { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text); }
.vh-sub      { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }

.sev-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; padding: 5px 14px;
  border-radius: var(--r-pill); border: 1.5px solid transparent;
}

/* ── Section card ── */
.section-card { background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border); overflow: hidden; }
.sc-header    { display: flex; align-items: center; justify-content: space-between; padding: 9px 13px; border-bottom: 1px solid var(--border-soft); }
.sc-title     { display: flex; align-items: center; gap: 7px; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-2); }

/* ── Patient (compacto, horizontal) ── */
.patient-card { padding: 11px 13px; display: flex; flex-direction: column; gap: 8px; }
.pc-top       { display: flex; align-items: center; gap: 11px; min-width: 0; }
.pat-avatar   { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, #4299e1 0%, var(--st-info) 100%); color: #fff; display: flex; align-items: center; justify-content: center; font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; }
.pc-id        { min-width: 0; }
.pat-name     { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pc-meta      { display: flex; flex-wrap: wrap; gap: 4px; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 1px; }
.pc-address   { display: flex; align-items: center; gap: 5px; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); padding-top: 7px; border-top: 1px solid var(--surface-3); }

/* ── Vitals grid ── */
.vitals-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0;
}
.vg-item  { padding: 7px 12px; border-bottom: 1px solid var(--surface-3); border-right: 1px solid var(--surface-3); &:nth-child(even) { border-right: none; } }
.vg-label { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
.vg-value { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-2); }
/* Estado do sinal vital (verde/âmbar/vermelho); medições sem intervalo ficam neutras */
.vg--ok    .vg-value { color: var(--st-ok-text); }
.vg--warn  .vg-value { color: var(--st-warn-text); }
.vg--bad   .vg-value { color: var(--danger); }
.vg--plain .vg-value { color: var(--text-2); }
.vg--warn { background: rgba(237,137,54,0.05); }
.vg--bad  { background: rgba(229,62,62,0.06); }
/* Em falta — distinto de "normal" */
.vg--missing { opacity: 0.75; }
.vg-missing-val { color: var(--text-faint); font-style: italic; display: inline-flex; align-items: center; gap: 4px; font-weight: 500; }

/* ── Lifestyle chips ── */
.lifestyle-row { display: flex; flex-wrap: wrap; gap: 6px; padding: 12px 13px; }
.ls-chip       { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-muted); background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: var(--r-sm); padding: 3px 10px; }
.ls-chip--warn { color: var(--st-warn-text); background: rgba(237,137,54,0.08); border-color: var(--st-warn); }

/* ── Loading ── */
.att-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 60px 0; color: var(--text-faint); font-size: var(--fs-label); line-height: var(--lh-tight); }

/* ── Barra de resumo ── */
.cons-summary { display: flex; flex-wrap: wrap; gap: 8px; }
.cs-item {
  display: flex; align-items: center; gap: 8px;
  flex: 1 1 130px; min-width: 118px;
  padding: 7px 11px; border-radius: var(--r-sm);
  background: var(--surface); border: 1px solid var(--border);
}
.cs-item > .q-icon { flex-shrink: 0; color: var(--text-faint); }
.cs-item > div { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
.cs-lbl { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-faint); }
.cs-val { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cs-sub { font-weight: 500; color: var(--text-faint); font-size: var(--fs-label); line-height: var(--lh-tight); }

.cs--ok   { border-color: rgba(50,185,137,0.35); }
.cs--ok   > .q-icon, .cs--ok   .cs-val { color: var(--chip-ok); }
.cs--warn { border-color: rgba(237,137,54,0.40); background: rgba(237,137,54,0.05); }
.cs--warn > .q-icon, .cs--warn .cs-val { color: var(--chip-warn); }
.cs--bad  { border-color: rgba(229,62,62,0.40);  background: rgba(229,62,62,0.05); }
.cs--bad  > .q-icon, .cs--bad  .cs-val { color: var(--danger); }
.cs--info { border-color: rgba(66,153,225,0.35); }
.cs--info > .q-icon, .cs--info .cs-val { color: var(--chip-info); }
.cs--muted > .q-icon { color: var(--text-faint); }
.cs-crit { background: rgba(229,62,62,0.09); }

/* ── Coluna direita fixa em ecrã largo ── */
@media (min-width: 1024px) {
  .cons-right { position: sticky; top: 16px; align-self: flex-start; }
}

/* ── Mini-resumo de exames alterados ── */
.mini-altered { padding: 8px 13px 10px; display: flex; flex-direction: column; gap: 6px; }
.ma-row { display: flex; align-items: center; gap: 8px; }
.ma-name { flex: 1; min-width: 0; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ma-badge {
  flex-shrink: 0; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; padding: 2px 9px; border-radius: var(--r-pill);
  color: var(--danger); background: rgba(229,62,62,0.1); border: 1px solid rgba(229,62,62,0.3);
}
.ma-none { display: flex; align-items: center; gap: 6px; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--chip-ok); padding: 2px 0; }
</style>
