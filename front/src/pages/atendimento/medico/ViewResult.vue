<template>
  <div class="vr-wrap">

    <!-- Top bar -->
    <div class="vr-topbar">
      <q-btn flat round dense icon="las la-arrow-left" color="grey-6"
        @click="router.push({ name: 'medico-lista-resultado-exames' })" />
      <div class="vr-topbar-title">
        <q-icon name="las la-file-medical-alt" size="16px" style="color:var(--chip-info)" />
        Resultado de Consulta
      </div>
      <q-btn
        flat no-caps dense
        icon="las la-file-pdf"
        label="Exportar PDF"
        color="grey-7"
        style="margin-left:auto; border-radius: var(--r-sm); font-size: var(--fs-label)"
        :disable="!allExams.length"
        @click="exportPdf"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="vr-state">
      <q-spinner-dots color="primary" size="28px" />
    </div>

    <template v-else-if="consultation">

      <!-- ── Barra de resumo (lê-se em 2 segundos) ── -->
      <div class="cons-summary">
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

      <div class="vr-layout">

        <!-- SIDEBAR -->
        <div class="vr-sidebar">

          <!-- Patient -->
          <div class="vrs-card vrs-patient">
            <div class="vrsp-avatar">{{ initials(consultation.screening?.customer?.name) }}</div>
            <div class="vrsp-name">{{ consultation.screening?.customer?.name ?? '—' }}</div>
            <div v-if="age" class="vrsp-age">{{ age }} anos</div>
            <div class="vrsp-chips">
              <span v-if="consultation.screening?.customer?.phone" class="vrsp-chip">
                <q-icon name="las la-phone" size="11px" />
                {{ consultation.screening.customer.phone }}
              </span>
              <span v-if="consultation.doctor?.name" class="vrsp-chip vrsp-chip--blue">
                <q-icon name="las la-user-md" size="11px" />
                Dr. {{ consultation.doctor.name }}
              </span>
              <span class="vrsp-chip">
                <q-icon name="las la-calendar" size="11px" />
                {{ fmtDate(consultation.createdAt) }}
              </span>
            </div>
            <div class="vrsp-stats">
              <div class="vrsp-stat">
                <span class="vrsp-stat-val">{{ allExams.length }}</span>
                <span class="vrsp-stat-lbl">Exames</span>
              </div>
              <div class="vrsp-stat-div" />
              <div class="vrsp-stat">
                <span class="vrsp-stat-val vrsp-ok">{{ countNormal }}</span>
                <span class="vrsp-stat-lbl">Normais</span>
              </div>
              <div class="vrsp-stat-div" />
              <div class="vrsp-stat">
                <span class="vrsp-stat-val vrsp-bad">{{ countAltered }}</span>
                <span class="vrsp-stat-lbl">Alterados</span>
              </div>
            </div>
          </div>

          <!-- Vitals -->
          <div v-if="hasVitals" class="vrs-card">
            <div class="vrs-section-title">
              <q-icon name="las la-heartbeat" size="12px" style="color:var(--danger)" />
              Triagem
            </div>
            <div class="vrsv-grid" v-if="sc.height || sc.weight">
              <div v-if="sc.height" class="vrsv-tile">
                <span class="vrsv-tile-lbl">Altura</span>
                <span class="vrsv-tile-val">{{ (sc.height / 100).toFixed(2) }}m</span>
              </div>
              <div v-if="sc.weight" class="vrsv-tile">
                <span class="vrsv-tile-lbl">Peso</span>
                <span class="vrsv-tile-val">{{ sc.weight }} kg</span>
              </div>
            </div>
            <div class="vrsv-list">
              <div v-for="v in vitalsList" :key="v.label" class="vrsv-item" :class="'vrsv--' + v.state">
                <q-icon :name="v.icon" size="11px" />
                <span>{{ v.label }}</span>
                <span v-if="v.state === 'missing'" class="vrsv-item-val vrsv-missing">Em falta</span>
                <span v-else class="vrsv-item-val">{{ v.value }}</span>
              </div>
              <div v-if="sc.isSmoker" class="vrsv-item vrsv-warn">
                <q-icon name="las la-smoking" size="11px" />
                Fumador
              </div>
              <div v-if="sc.isDrinker" class="vrsv-item vrsv-warn">
                <q-icon name="las la-wine-bottle" size="11px" />
                Consumo de álcool
              </div>
              <div v-if="sc.isChronicPatient" class="vrsv-item vrsv-warn">
                <q-icon name="las la-notes-medical" size="11px" />
                Crónico{{ sc.chronicIll ? ': ' + sc.chronicIll : '' }}
              </div>
            </div>
          </div>

          <!-- Diagnosis -->
          <div class="vrs-card">
            <div class="vrs-section-title">
              <q-icon name="las la-stethoscope" size="12px" style="color:var(--chip-info)" />
              Diagnóstico
            </div>
            <textarea
              v-model="diagnosis"
              class="vrd-textarea"
              rows="5"
              placeholder="Registe o diagnóstico com base nos resultados obtidos…"
            />
            <q-btn
              unelevated no-caps
              icon="las la-check-circle"
              label="Concluir consulta"
              color="primary"
              :loading="concluding"
              class="full-width"
              style="border-radius: var(--r-sm); font-size: var(--fs-body)"
              @click="onSubmit"
            />
          </div>

        </div>

        <!-- MAIN: exam cards -->
        <div class="vr-main">
          <div v-if="!allExams.length" class="vr-state" style="padding:60px 0">
            <q-icon name="las la-flask" size="36px" style="color:var(--text-disabled)" />
            <span>Sem exames associados</span>
          </div>

          <div v-else class="vr-exam-grid">
            <div
              v-for="req in allExams" :key="req.id"
              class="vr-exam-card"
              :class="[cardAccent(req), isWide(req) ? 'vec-card--wide' : '', isOpen(req) ? 'vec-card--open' : '']"
            >
              <!-- Header (clicável — colapsa/expande) -->
              <div class="vec-head vec-head--btn" @click="toggle(req)">
                <div class="vec-icon" :class="iconCls(req)">
                  <q-icon name="las la-vial" size="14px" />
                </div>
                <div class="vec-name">{{ req.exam?.name ?? '—' }}</div>
                <span v-if="!isOpen(req)" class="vec-summary">{{ summaryFor(req) }}</span>
                <span v-if="req.resultColor" class="vec-badge"
                  :class="req.resultColor === 'GREEN' ? 'vb--ok' : 'vb--bad'">
                  <q-icon
                    :name="req.resultColor === 'GREEN' ? 'las la-check-circle' : 'las la-exclamation-triangle'"
                    size="11px"
                  />
                  {{ req.resultColor === 'GREEN' ? 'Normal' : 'Alterado' }}
                </span>
                <span v-else-if="!req.paid" class="vec-badge vb--locked">
                  <q-icon name="las la-lock" size="11px" />
                  Não faturado
                </span>
                <span v-else class="vec-badge vb--pending">Pendente</span>
                <q-icon class="vec-chevron" :class="{ 'vec-chevron--open': isOpen(req) }" name="las la-angle-down" size="15px" />
              </div>

              <!-- Corpo colapsável -->
              <div v-show="isOpen(req)" class="vec-body">
                <!-- Structured fields -->
                <div v-if="hasFields(req)" class="vec-fields">
                  <div v-for="(g, gi) in groupFields(req)" :key="gi" class="vec-group">
                    <div v-if="g.title" class="vec-sep">
                      <q-icon name="las la-layer-group" size="10px" />
                      {{ g.title }}
                    </div>
                    <div
                      v-for="(f, fi) in g.fields" :key="fi"
                      class="vec-field"
                      :class="{ 'vec-field--bad': fieldAbnormal(req, f) }"
                    >
                      <div class="vec-fl">
                        <span class="vec-fname">{{ f.label }}</span>
                        <span v-if="f.unit" class="vec-funit">{{ f.unit }}</span>
                      </div>
                      <div class="vec-fval" :class="{ 'vec-fval--bad': fieldAbnormal(req, f) }">{{ f.value || '—' }}</div>
                      <div v-if="refFor(req, f)" class="vec-fref">
                        <q-icon name="las la-info-circle" size="10px" />
                        Ref: {{ refFor(req, f) }}
                      </div>
                      <div v-else-if="needsRef(req, f)" class="vec-fref vec-fref--todo">
                        <q-icon name="las la-info-circle" size="10px" />
                        Ref: definir
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Free text -->
                <div v-else-if="req.resultText" class="vec-freetext">{{ req.resultText }}</div>

                <!-- No result -->
                <div v-else-if="req.paid" class="vec-empty">Resultado não registado</div>
              </div>

            </div>
          </div>

          <!-- Prescrições feitas -->
          <Prescriptions :prescriptions="consultation.prescriptions ?? []" class="vr-rx" />
        </div>

      </div>
    </template>

    <!-- Not found -->
    <div v-else class="vr-state">
      <q-icon name="las la-exclamation-circle" size="36px" style="color:var(--text-disabled)" />
      <span>Consulta não encontrada</span>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCreateUpdate } from "src/composables/create-update";
import { showNotify } from "src/utils/notify";
import { printExamResult } from "src/utils/reports/examResult";
import Prescriptions from "./components/Prescriptions.vue";
import { useCompanyStore } from "src/stores/company";
import { fieldIsAbnormal, referenceFor, isNumericValue } from "src/utils/examReference";

const router       = useRouter();
const routeObj     = useRoute();
const companyStore = useCompanyStore();
const { fetchOne, update, loading } = useCreateUpdate("consultations");

const consultation = ref(null);
const concluding   = ref(false);
const diagnosis    = ref("");

const allExams = computed(() => {
  if (!consultation.value) return [];
  const list = [...(consultation.value.exams ?? [])];
  (consultation.value.observation ?? []).forEach((o) => list.push(...(o.exams ?? [])));
  (consultation.value.internment ?? []).forEach((i) => list.push(...(i.exams ?? [])));
  return list;
});

const sc = computed(() => consultation.value?.screening ?? {});

const hasVitals = computed(() =>
  sc.value.height || sc.value.weight || sc.value.fever ||
  sc.value.bloodPressure || sc.value.heartbeatRate || sc.value.oxygen ||
  sc.value.isSmoker || sc.value.isDrinker || sc.value.isChronicPatient
);

const countNormal  = computed(() => allExams.value.filter((e) => e.resultColor === "GREEN").length);
const countAltered = computed(() => allExams.value.filter((e) => e.resultColor === "RED").length);

/* ── Resumo da consulta (barra de estado no topo) ── */
const alteredExams = computed(() => allExams.value.filter((e) => e.resultColor === "RED"));
const CRIT_RX = /hiv|vih|hepatite|sífilis|sifilis|covid/i;
const criticalExams = computed(() => alteredExams.value.filter((e) => CRIT_RX.test(e.exam?.name ?? "")));
const critLabelFor = (e) => (/hiv|vih/i.test(e.exam?.name ?? "") ? "HIV positivo" : `${e.exam?.name ?? "Exame"} alterado`);

const critState = (v) => (v ? ({ GREEN: "ok", ORANGE: "warn", RED: "bad" }[v] ?? "missing") : "missing");
const bpmState  = (v) => { const n = Number(v); if (!v || isNaN(n)) return "missing"; if (n >= 60 && n <= 100) return "ok"; if (n >= 40 && n <= 120) return "warn"; return "bad"; };
const bpState   = (v) => { if (!v) return "missing"; const [s, d] = String(v).split("/").map(Number); if (isNaN(s)) return "missing"; if (s < 120 && (!d || d < 80)) return "ok"; if (s < 130) return "warn"; return "bad"; };
const vitalsAltered = computed(() => {
  const s = sc.value;
  return [critState(s.oxygen), critState(s.fever), critState(s.breathingRate), bpmState(s.heartbeatRate), bpState(s.bloodPressure)]
    .filter((x) => x === "warn" || x === "bad").length;
});

const statusInfo = computed(() => {
  const st = consultation.value?.status;
  if (st === "done")    return { label: "Terminada", icon: "las la-check-circle",   tone: "ok" };
  if (st === "running") return { label: "Em curso",  icon: "las la-hourglass-half", tone: "info" };
  return { label: "Pendente", icon: "las la-clock", tone: "muted" };
});

const age = computed(() => {
  const b = consultation.value?.screening?.customer?.birthday;
  if (!b) return null;
  const bd = new Date(b);
  const today = new Date();
  let a = today.getFullYear() - bd.getFullYear();
  if (today.getMonth() < bd.getMonth() || (today.getMonth() === bd.getMonth() && today.getDate() < bd.getDate())) a--;
  return a > 0 ? a : null;
});

const vitalLabel = (val) => ({ GREEN: "Boa", ORANGE: "Má", RED: "Grave" })[val] ?? val;

// Lista de vitais com estado (ok/warn/bad/missing) — mostra todos, incl. em falta.
const vitalsList = computed(() => {
  const s = sc.value;
  return [
    { label: "Temperatura",      icon: "las la-thermometer-half", value: s.fever ? vitalLabel(s.fever) : "", state: critState(s.fever) },
    { label: "Pressão arterial", icon: "las la-heart",            value: s.bloodPressure ? `${s.bloodPressure} mmHg` : "", state: bpState(s.bloodPressure) },
    { label: "Freq. cardíaca",   icon: "las la-procedures",       value: s.heartbeatRate ? `${s.heartbeatRate} bpm` : "", state: bpmState(s.heartbeatRate) },
    { label: "Saturação O₂",     icon: "las la-wind",             value: s.oxygen ? vitalLabel(s.oxygen) : "", state: critState(s.oxygen) },
    { label: "Freq. resp.",      icon: "las la-lungs",            value: s.breathingRate ? vitalLabel(s.breathingRate) : "", state: critState(s.breathingRate) },
  ];
});

const cardAccent = (req) => {
  if (req.resultColor === "GREEN") return "card--ok";
  if (req.resultColor === "RED")   return "card--bad";
  return "";
};

const iconCls = (req) => {
  if (req.resultColor === "GREEN") return "vi--ok";
  if (req.resultColor === "RED")   return "vi--bad";
  return "vi--neutral";
};

const hasFields = (req) => Array.isArray(req.result) && req.result.some((f) => f.input !== "SECTION");
const getFields = (req) => Array.isArray(req.result) ? req.result : [];

/* ── Cartões colapsáveis + grelha (Alterado abre por defeito; Normal fecha) ── */
const fieldCount  = (e) => (Array.isArray(e.result) ? e.result.filter((f) => f.input !== "SECTION").length : 0);
const hasSections = (e) => { const t = e.exam?.exam?.subItens; return Array.isArray(t) && t.some((f) => f.input === "SECTION"); };
const isWide      = (e) => hasSections(e) || fieldCount(e) > 6;
const summaryFor = (e) => {
  if (hasFields(e)) {
    const fields = groupFields(e).flatMap((g) => g.fields);
    const bad = fields.filter((f) => fieldAbnormal(e, f)).length;
    const n = fields.length;
    return bad ? `${bad} alterado${bad !== 1 ? "s" : ""} de ${n}` : `${n} parâmetro${n !== 1 ? "s" : ""}`;
  }
  if (e.resultText) return "Texto livre";
  if (!e.paid) return "Não faturado";
  return "Sem resultado";
};
const openIds = reactive(new Set());
watch(allExams, (list) => {
  openIds.clear();
  (list ?? []).forEach((e) => { if (e.resultColor === "RED") openIds.add(e.id); });
}, { immediate: true });
const isOpen = (e) => openIds.has(e.id);
const toggle = (e) => { openIds.has(e.id) ? openIds.delete(e.id) : openIds.add(e.id); };

/* ── Agrupamento por secção + destaque de anormais (Passo 3) ── */
// As secções estão na DEFINIÇÃO do exame (exam.exam.subItens, já carregada) — o
// result guardado não as inclui. Agrupamos pela definição e cruzamos os valores
// guardados por label. Apresentação apenas.
const groupFields = (e) => {
  const template = e.exam?.exam?.subItens;
  const saved = getFields(e);
  if (Array.isArray(template) && template.some((f) => f.input === "SECTION")) {
    const byLabel = Object.fromEntries(saved.map((s) => [s.label, s]));
    const used = new Set();
    const groups = [];
    let cur = { title: null, fields: [] };
    for (const f of template) {
      if (f.input === "SECTION") { if (cur.title || cur.fields.length) groups.push(cur); cur = { title: f.label, fields: [] }; }
      else {
        const sv = byLabel[f.label] ?? {};
        used.add(f.label);
        cur.fields.push({ label: f.label, value: sv.value ?? "", unit: sv.unit ?? f.unit ?? "", reference: sv.reference ?? f.reference ?? "" });
      }
    }
    if (cur.title || cur.fields.length) groups.push(cur);
    const extra = saved.filter((s) => !used.has(s.label));
    if (extra.length) groups.push({ title: null, fields: extra });
    return groups;
  }
  return [{ title: null, fields: saved }];
};
// Referência efetiva (definição do exame + overrides) e deteção de alterado
// (por intervalo numérico; senão heurística qualitativa).
const examName = (e) => e.exam?.name ?? "";
const refFor = (e, f) => referenceFor(examName(e), f.label, f.reference);
const fieldAbnormal = (e, f) => fieldIsAbnormal(f.value, refFor(e, f));
const needsRef = (e, f) => !refFor(e, f) && isNumericValue(f.value);

const initials = (name) =>
  name?.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("") ?? "?";

const fmtDate = (val) =>
  val
    ? new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(val))
    : "—";

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

const onSubmit = async () => {
  concluding.value = true;
  try {
    await update({ diagnosis: diagnosis.value, stage: "CONCLUDE" }, routeObj.params.consultationId);
    showNotify("Consulta concluída", true);
    router.push({ name: "medico-lista-resultado-exames" });
  } catch {
    showNotify("Erro ao concluir", false);
  } finally {
    concluding.value = false;
  }
};

onMounted(async () => {
  const data = await fetchOne(routeObj.params.consultationId);
  if (data) {
    consultation.value = data;
    diagnosis.value = data.diagnosis ?? "";
  }
});
</script>

<style scoped lang="scss">
.vr-wrap {
  display: flex; flex-direction: column; gap: 20px;
  padding: 20px 24px; min-height: 100%;
}

/* Top bar */
.vr-topbar { display: flex; align-items: center; gap: 10px; }
.vr-topbar-title {
  display: flex; align-items: center; gap: 7px;
  font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text-2);
}

/* State */
.vr-state {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 80px 0; color: var(--text-faint); font-size: var(--fs-body); line-height: var(--lh-body);
}

/* Barra de resumo */
.cons-summary { display: flex; flex-wrap: wrap; gap: 10px; }
.cs-item {
  display: flex; align-items: center; gap: 9px;
  flex: 1 1 160px; min-width: 150px;
  padding: 10px 14px; border-radius: var(--r-sm);
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

/* Two-column layout */
.vr-layout {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 20px;
  align-items: start;
}

.vr-sidebar {
  position: sticky; top: 16px;
  display: flex; flex-direction: column; gap: 14px;
}

.vr-main { min-width: 0; }
.vr-rx { display: block; margin-top: 12px; }

/* Sidebar card base */
.vrs-card {
  background: var(--surface); border-radius: var(--r-panel); border: 1px solid var(--border);
  padding: 16px; display: flex; flex-direction: column; gap: 12px;
}

/* Patient card */
.vrs-patient { align-items: center; text-align: center; padding: 20px 16px; }
.vrsp-avatar {
  width: 58px; height: 58px; border-radius: 50%;
  background: linear-gradient(135deg, #63b3ed, var(--st-info-text));
  color: #fff; font-size: var(--fs-display); line-height: var(--lh-tight); font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.vrsp-name { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text); }
.vrsp-age  { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: -6px; }
.vrsp-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; }
.vrsp-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); background: var(--surface-3);
  border: 1px solid var(--border-strong); border-radius: var(--r-pill); padding: 3px 9px;
}
.vrsp-chip--blue { color: var(--chip-info); background: rgba(66,153,225,0.08); border-color: rgba(66,153,225,0.2); }
.vrsp-stats {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  width: 100%; padding-top: 12px; border-top: 1px solid var(--border);
}
.vrsp-stat     { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.vrsp-stat-val { font-size: var(--fs-heading); font-weight: 700; color: var(--text-2); line-height: 1; }
.vrsp-ok       { color: var(--st-ok-text); }
.vrsp-bad      { color: var(--danger); }
.vrsp-stat-lbl { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.5px; }
.vrsp-stat-div { width: 1px; height: 22px; background: var(--border); }

/* Section title */
.vrs-section-title {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 800; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.7px;
}

/* Vitals */
.vrsv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.vrsv-tile {
  display: flex; flex-direction: column; gap: 2px;
  background: var(--surface-2); border-radius: var(--r-sm); padding: 8px 10px;
}
.vrsv-tile-lbl { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); font-weight: 600; }
.vrsv-tile-val { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text); }

.vrsv-list { display: flex; flex-direction: column; gap: 5px; }
.vrsv-item {
  display: flex; align-items: center; gap: 7px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 500; padding: 7px 10px;
  border-radius: var(--r-sm); background: var(--surface-3); border: 1px solid var(--border-strong); color: var(--text-muted);
}
.vrsv-item-val { margin-left: auto; font-weight: 700; font-size: var(--fs-label); line-height: var(--lh-tight); }
.vrsv-ok   { color: var(--chip-ok); background: rgba(50,185,137,0.08);  border-color: rgba(50,185,137,0.2); }
.vrsv-warn { color: var(--chip-warn); background: rgba(237,137,54,0.08);  border-color: rgba(237,137,54,0.2); }
.vrsv-bad  { color: var(--danger); background: rgba(229,62,62,0.08);   border-color: rgba(229,62,62,0.2); }
/* Estado do sinal vital (mesma lógica de cor dos exames) */
.vrsv--ok    { color: var(--chip-ok); background: rgba(50,185,137,0.08); border-color: rgba(50,185,137,0.2); }
.vrsv--warn  { color: var(--chip-warn); background: rgba(237,137,54,0.08); border-color: rgba(237,137,54,0.2); }
.vrsv--bad   { color: var(--danger); background: rgba(229,62,62,0.08);  border-color: rgba(229,62,62,0.2); }
.vrsv--plain { color: var(--text-muted); }
/* Em falta — distinto de "normal" */
.vrsv--missing { opacity: 0.7; border-style: dashed; }
.vrsv-missing  { font-style: italic; font-weight: 500; color: var(--text-faint); }

/* Diagnosis */
.vrd-textarea {
  width: 100%; box-sizing: border-box; resize: vertical; min-height: 100px;
  border: 1.5px solid var(--border-strong); border-radius: var(--r-sm);
  padding: 10px 12px; font-size: var(--fs-body); color: var(--text-2);
  font-family: inherit; line-height: 1.6; outline: none;
  &::placeholder { color: var(--text-disabled); }
  &:focus { border-color: var(--st-info); }
}

/* Exam grid: exames curtos lado a lado, painéis grandes (Urina) a toda a largura */
.vr-exam-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
.vec-card--wide { grid-column: 1 / -1; }
@media (max-width: 1100px) { .vr-exam-grid { grid-template-columns: 1fr; } }

.vr-exam-card {
  background: var(--surface); border-radius: var(--r-panel); border: 1px solid var(--border);
  overflow: hidden;
  /* Normal ou alterado marca o contorno inteiro, a 1px. */
  &.card--ok  { border-color: var(--accent); }
  &.card--bad { border-color: var(--danger); }
}

/* Exam header */
.vec-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; background: var(--surface-2); border-bottom: 1px solid var(--border-soft);
}
.vec-head--btn { cursor: pointer; user-select: none; transition: background 0.12s; }
.vec-head--btn:hover { background: var(--surface-3); }
.vr-exam-card:not(.vec-card--open) .vec-head { border-bottom-color: transparent; }
.vec-summary {
  flex-shrink: 0; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-faint); white-space: nowrap;
}
.vec-chevron { flex-shrink: 0; color: var(--text-faint); transition: transform 0.18s; }
.vec-chevron--open { transform: rotate(180deg); }
.vec-icon {
  width: 30px; height: 30px; border-radius: var(--r-sm); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.vi--ok      { background: rgba(50,185,137,0.12); color: var(--st-ok-text); }
.vi--bad     { background: rgba(229,62,62,0.1);   color: var(--danger); }
.vi--neutral { background: var(--border);               color: var(--text-faint); }

.vec-name {
  flex: 1; font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text-2);
  text-transform: uppercase; letter-spacing: 0.5px;
}

.vec-badge {
  display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; padding: 3px 10px; border-radius: var(--r-pill);
}
.vb--ok     { color: var(--chip-ok); background: rgba(50,185,137,0.1);  border: 1px solid rgba(50,185,137,0.3); }
.vb--bad    { color: var(--danger); background: rgba(229,62,62,0.1);   border: 1px solid rgba(229,62,62,0.3); }
.vb--locked { color: var(--text-muted); background: var(--surface-3);               border: 1px solid var(--border-strong); }
.vb--pending{ color: var(--text-faint); background: var(--surface-3);               border: 1px solid var(--border-strong); }

/* Fields */
.vec-fields { padding: 10px 16px 14px; display: flex; flex-direction: column; gap: 2px; }

.vec-group { display: flex; flex-direction: column; }
.vec-group + .vec-group { margin-top: 10px; }
.vec-sep {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 800; color: var(--chip-info);
  text-transform: uppercase; letter-spacing: 0.8px;
  background: rgba(66,153,225,0.1); padding: 5px 10px; border-radius: var(--r-sm);
  margin: 2px 0 5px;
}

.vec-field {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 1px 12px; align-items: center;
  padding: 8px 10px; border-radius: var(--r-sm);
  transition: background 0.12s;
  &:hover { background: var(--surface-3); }
}
.vec-fl {
  display: flex; align-items: center; gap: 6px;
  grid-column: 1; grid-row: 1;
}
.vec-fname { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-muted); }
.vec-funit {
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint);
  background: var(--border); padding: 1px 5px; border-radius: var(--r-sm);
}
.vec-fval {
  font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text);
  grid-column: 2; grid-row: 1; text-align: right; white-space: nowrap;
}
/* Valor anormal — salta à vista (ex.: Sangue ++++, Proteína ++) */
.vec-field--bad { background: rgba(229,62,62,0.06); }
.vec-field--bad:hover { background: rgba(229,62,62,0.1); }
.vec-fval--bad { color: var(--danger); font-weight: 800; }
.vec-fref {
  display: flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint);
  grid-column: 1 / -1; grid-row: 2;
}
.vec-fref--todo { color: var(--chip-warn); font-style: italic; opacity: 0.85; }

.vec-freetext {
  margin: 12px 16px;
  font-size: var(--fs-body); color: var(--text-3); line-height: 1.7; white-space: pre-wrap;
  background: var(--surface-2); border-radius: var(--r-sm); padding: 12px 14px;
}

.vec-empty {
  padding: 18px; text-align: center;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-disabled);
}
</style>
