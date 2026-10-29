<template>
  <div class="cf-wrap">

    <!-- Status bar -->
    <div class="cf-status-bar">
      <div class="csb-left">
        <span class="sev-pill" :style="score.style">
          <q-icon :name="score.icon" size="13px" />
          {{ score.label }}
        </span>
        <span v-if="status === 'done'" class="done-chip">
          <q-icon name="las la-check-circle" size="13px" />
          Consulta terminada
        </span>
      </div>
      <div class="csb-actions">
        <button v-if="!isReadingOnly" type="button" class="cf-act-btn" @click="scrollToExams">
          <q-icon name="las la-flask" size="14px" /> Adicionar exame
        </button>
        <button v-if="allResults.length" type="button" class="cf-act-btn" @click="exportPdf">
          <q-icon name="las la-file-pdf" size="14px" /> Exportar PDF
        </button>
        <q-btn
          v-if="status === 'running'"
          unelevated no-caps rounded
          icon="las la-stop-circle"
          label="Terminar consulta"
          color="primary"
          :disable="!canStop || stopping"
          :loading="stopping"
          style="border-radius: var(--r-sm); font-size: var(--fs-label)"
          @click="stopConsultation"
        >
          <q-tooltip v-if="!canStop" anchor="bottom middle" self="top middle">
            {{ stopBlockReason }}
          </q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- ── MANDATORY: Orange alert ── -->
    <div v-if="score.tier === 'orange' && !isReadingOnly" class="cf-mandatory cf-mandatory--orange">
      <div class="cma-header">
        <q-icon name="las la-exclamation-triangle" size="15px" />
        <span>Urgência — Observação obrigatória</span>
        <span v-if="observationSubmitted" class="cma-done-badge">
          <q-icon name="las la-check" size="11px" /> Concluído
        </span>
      </div>
      <div class="cma-body">
        <ObservationSelect
          :initial-service-id="form.observation.serviceId"
          :customer-id="screening?.customerId ?? screening?.customer?.id ?? ''"
          @submitted="observationSubmitted = true"
        />
      </div>
    </div>

    <!-- ── MANDATORY: Red alert ── -->
    <div v-if="score.tier === 'red' && !isReadingOnly" class="cf-mandatory cf-mandatory--red">
      <div class="cma-header">
        <q-icon name="las la-times-circle" size="15px" />
        <span>Emergência — Observação e Internamento obrigatórios</span>
        <span v-if="internmentSubmitted" class="cma-done-badge">
          <q-icon name="las la-check" size="11px" /> Concluído
        </span>
      </div>
      <div class="cma-body">
        <InternSelect
          :initial-service-id="form.observation.serviceId"
          :customer-id="screening?.customerId ?? screening?.customer?.id ?? ''"
          @submitted="internmentSubmitted = true"
        />
      </div>
    </div>

    <!-- ── Observação / Internamento (leitura) ── -->
    <div v-if="hasClinicalInfo" class="cf-section cf-clinical">
      <div class="cfs-label">Observação e Internamento</div>

      <!-- Observações -->
      <div v-for="(obs, oi) in observationList" :key="'obs-' + (obs.id || oi)" class="ci-card">
        <div class="ci-head">
          <div class="ci-icon ci-icon--obs"><q-icon name="las la-eye" size="14px" /></div>
          <div class="ci-title">{{ obs.service?.name || 'Observação' }}</div>
          <span class="ci-status" :class="clinicalStatus(obs.status).cls">{{ clinicalStatus(obs.status).label }}</span>
        </div>

        <div v-if="obs.endTime || obs.duration" class="ci-meta">
          <span v-if="obs.duration"><q-icon name="las la-clock" size="12px" /> {{ obs.duration }} h</span>
          <span v-if="obs.endTime"><q-icon name="las la-hourglass-end" size="12px" /> Previsto término: {{ ciDateTime(obs.endTime) }}</span>
        </div>

        <div v-if="obs.description" class="ci-notes">{{ obs.description }}</div>

        <div v-if="Array.isArray(obs.serum) && obs.serum.length" class="ci-block">
          <div class="ci-sub">Soros / Medicação</div>
          <div class="ci-serum-list">
            <div v-for="(s, si) in obs.serum" :key="si" class="ci-serum-item">
              <q-icon name="las la-syringe" size="12px" style="color: var(--st-teal); flex-shrink:0" />
              <span class="ci-serum-name">{{ s.nome }}</span>
              <span v-if="s.dose || s.via" class="ci-serum-meta">{{ [s.dose, s.via].filter(Boolean).join(' · ') }}</span>
            </div>
          </div>
        </div>

        <div v-if="Array.isArray(obs.exams) && obs.exams.length" class="ci-block">
          <div class="ci-sub">Exames</div>
          <div class="ci-exam-list">
            <div v-for="ex in obs.exams" :key="ex.id" class="ci-exam">
              <div class="ci-exam-top">
                <q-icon name="las la-vial" size="12px" style="color: var(--st-info); flex-shrink:0" />
                <span class="ci-exam-name">{{ ex.exam?.name || '—' }}</span>
                <span class="ci-exam-badge" :class="examBadge(ex).cls">{{ examBadge(ex).label }}</span>
              </div>
              <div v-if="examSummary(ex)" class="ci-exam-sum">{{ examSummary(ex) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Internamento -->
      <div v-if="internmentData" class="ci-card ci-card--int">
        <div class="ci-head">
          <div class="ci-icon ci-icon--int"><q-icon name="las la-procedures" size="14px" /></div>
          <div class="ci-title">{{ internmentData.service?.name || 'Internamento' }}</div>
          <span class="ci-status" :class="clinicalStatus(internmentData.status).cls">{{ clinicalStatus(internmentData.status).label }}</span>
        </div>

        <div v-if="internmentData.description" class="ci-notes">{{ internmentData.description }}</div>

        <div v-if="Array.isArray(internmentData.exams) && internmentData.exams.length" class="ci-block">
          <div class="ci-sub">Exames</div>
          <div class="ci-exam-list">
            <div v-for="ex in internmentData.exams" :key="ex.id" class="ci-exam">
              <div class="ci-exam-top">
                <q-icon name="las la-vial" size="12px" style="color: var(--st-info); flex-shrink:0" />
                <span class="ci-exam-name">{{ ex.exam?.name || '—' }}</span>
                <span class="ci-exam-badge" :class="examBadge(ex).cls">{{ examBadge(ex).label }}</span>
              </div>
              <div v-if="examSummary(ex)" class="ci-exam-sum">{{ examSummary(ex) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Observations (medical notes) -->
    <div class="cf-section">
      <div class="cfs-label">Observações médicas</div>
      <div v-if="isReadingOnly" class="cfs-readonly">{{ form.description || '—' }}</div>
      <textarea
        v-else
        v-model="form.description"
        class="cf-textarea"
        rows="4"
        placeholder="Registe aqui as suas observações…"
        maxlength="500"
        @input="scheduleUpdate"
      />
      <div v-if="!isReadingOnly" class="cfs-hint">{{ form.description?.length ?? 0 }}/500</div>
    </div>

    <!-- Diagnosis -->
    <div class="cf-section">
      <div class="cfs-label">Diagnóstico</div>
      <div v-if="isDone" class="cfs-readonly">{{ form.diagnosis || '—' }}</div>
      <textarea
        v-else
        v-model="form.diagnosis"
        class="cf-textarea"
        rows="3"
        placeholder="Diagnóstico do paciente…"
        @input="scheduleUpdate"
      />
    </div>

    <!-- Exam results -->
    <div v-if="stage === 'EXAM_RESULT'" class="cf-section">
      <div class="cfs-label">
        Resultados de exames
        <span class="cfs-count">{{ allResults.length }}</span>
      </div>
      <div class="er-grid">
        <div
          v-for="exam in allResults" :key="exam.id"
          class="er-card"
          :class="[
            exam.resultColor === 'GREEN' ? 'er--ok' : exam.resultColor === 'RED' ? 'er--bad' : '',
            erIsWide(exam) ? 'er-card--wide' : '',
            erIsOpen(exam) ? 'er-card--open' : '',
          ]"
        >
          <!-- Header (clicável — colapsa/expande) -->
          <div class="er-head er-head--btn" @click="erToggle(exam)">
            <div class="er-icon" :class="exam.resultColor === 'GREEN' ? 'eri--ok' : exam.resultColor === 'RED' ? 'eri--bad' : 'eri--neutral'">
              <q-icon name="las la-vial" size="13px" />
            </div>
            <div class="er-name">{{ exam.exam?.name ?? '—' }}</div>
            <span v-if="!erIsOpen(exam)" class="er-summary">{{ erSummary(exam) }}</span>
            <span v-if="exam.resultColor" class="er-badge"
              :class="exam.resultColor === 'GREEN' ? 'erb--ok' : 'erb--bad'">
              <q-icon :name="exam.resultColor === 'GREEN' ? 'las la-check-circle' : 'las la-exclamation-triangle'" size="10px" />
              {{ exam.resultColor === 'GREEN' ? 'Normal' : 'Alterado' }}
            </span>
            <span v-else-if="!exam.paid" class="er-badge erb--locked">
              <q-icon name="las la-lock" size="10px" />
              Não faturado
            </span>
            <span v-else class="er-badge erb--pending">Pendente</span>
            <q-icon class="er-chevron" :class="{ 'er-chevron--open': erIsOpen(exam) }" name="las la-angle-down" size="14px" />
          </div>

          <!-- Corpo colapsável -->
          <div v-show="erIsOpen(exam)" class="er-body">
            <!-- Structured fields -->
            <div v-if="erHasFields(exam)" class="er-fields">
              <div v-for="(g, gi) in erGroups(exam)" :key="gi" class="er-group">
                <div v-if="g.title" class="er-sep">
                  <q-icon name="las la-layer-group" size="10px" />
                  {{ g.title }}
                </div>
                <div
                  v-for="(f, fi) in g.fields" :key="fi"
                  class="er-field"
                  :class="{ 'er-field--bad': erFieldAbnormal(exam, f) }"
                >
                  <div class="er-fl">
                    <span class="er-fname">{{ f.label }}</span>
                    <span v-if="f.unit" class="er-funit">{{ f.unit }}</span>
                  </div>
                  <div class="er-fval" :class="{ 'er-fval--bad': erFieldAbnormal(exam, f) }">{{ f.value || '—' }}</div>
                  <div v-if="erRefFor(exam, f)" class="er-fref">
                    <q-icon name="las la-info-circle" size="10px" />
                    Ref: {{ erRefFor(exam, f) }}
                  </div>
                  <div v-else-if="erNeedsRef(exam, f)" class="er-fref er-fref--todo">
                    <q-icon name="las la-info-circle" size="10px" />
                    Ref: definir
                  </div>
                </div>
              </div>
            </div>

            <!-- Free text -->
            <div v-else-if="exam.resultText" class="er-freetext">{{ exam.resultText }}</div>

            <!-- No result -->
            <div v-else-if="exam.paid" class="er-empty">Resultado não registado</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Exam request section (visually separated) ── -->
    <div v-if="!isReadingOnly || requestedExams.length" ref="examCardRef" class="cf-exam-card">
      <div class="cec-header">
        <div class="cec-title">
          <q-icon name="las la-flask" size="15px" style="color: var(--st-info)" />
          Exames de Laboratório
        </div>
        <q-btn
          v-if="!isReadingOnly && selectedExamIds.size > 0"
          unelevated no-caps
          :label="`Solicitar ${selectedExamIds.size} exame${selectedExamIds.size > 1 ? 's' : ''}`"
          color="teal-8"
          size="sm"
          :loading="sendingExams"
          style="border-radius: var(--r-sm); font-size: var(--fs-label)"
          @click="onRequestExams"
        />
      </div>

      <!-- Already-requested exams -->
      <div v-if="requestedExams.length" class="requested-wrap">
        <div class="req-row">
          <q-icon name="las la-check-circle" size="13px" style="color: var(--st-ok); flex-shrink:0" />
          <span class="req-title">Já pedidos nesta consulta</span>
        </div>
        <div class="req-chips">
          <span
            v-for="ex in requestedExams"
            :key="ex.examId"
            class="exam-chip exam-chip--done"
          >
            <q-icon name="las la-flask" size="11px" />
            {{ ex.name }}
            <span v-if="!ex.paid" class="chip-unpaid">· Não pago</span>
          </span>
        </div>
      </div>

      <!-- Catalogue (hidden in read-only) -->
      <div v-if="!isReadingOnly && loadingCatalogue" class="cat-loading">
        <q-spinner-dots color="primary" size="20px" />
      </div>
      <div v-else-if="!isReadingOnly && catalogue.length" class="catalogue">
        <div v-for="section in catalogue" :key="section.name" class="cat-group">
          <div class="cat-group-name">{{ section.name }}</div>
          <div class="cat-chips">
            <span
              v-for="svc in section.Service"
              :key="svc.id"
              class="exam-chip"
              :class="chipClass(svc.id)"
              @click="toggleExam(svc.id)"
            >
              <q-icon
                :name="requestedExamIds.has(svc.id) ? 'las la-check' : selectedExamIds.has(svc.id) ? 'las la-plus-circle' : 'las la-circle'"
                size="11px"
              />
              {{ svc.name }}
              <span v-if="svc.description" class="chip-desc"> · {{ svc.description }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Prescrições já feitas -->
    <div v-if="prescriptions.length" class="cf-rx-wrap">
      <Prescriptions :prescriptions="prescriptions" />
    </div>

    <!-- Prescription button -->
    <div v-if="(stage === 'EXAM_RESULT' || observationIsDone) && !isDone" class="cf-section">
      <q-btn
        unelevated no-caps rounded
        icon="las la-file-medical"
        label="Emitir prescrição"
        color="primary"
        :disable="!hasDiagnosis"
        style="border-radius: var(--r-sm); font-size: var(--fs-label)"
        @click="isPrescritioning = true"
      >
        <q-tooltip v-if="!hasDiagnosis" anchor="top middle" self="bottom middle">
          Preencha o diagnóstico antes de emitir a prescrição
        </q-tooltip>
      </q-btn>
    </div>

    <!-- Prescription dialog -->
    <q-dialog v-model="isPrescritioning" persistent>
      <q-card style="min-width: min(1024px, 92vw); max-width: 92vw; height: 90vh">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6 text-weight-regular">Prescrição de tratamento</div>
          <q-btn color="grey" icon="close" round flat v-close-popup dense />
        </q-card-section>
        <q-card-section>
          <Preescription @finish="isPrescritioning = false" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { SessionStorage } from "quasar";
import { api } from "src/boot/axios";
import { computed, reactive, ref, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showNotify } from "src/utils/notify";
import InternSelect from "src/components/atendimento/InternSelect.vue";
import ObservationSelect from "src/components/atendimento/ObservationSelect.vue";
import Preescription from "./Preescription.vue";
import Prescriptions from "./Prescriptions.vue";
import { fieldIsAbnormal, referenceFor, isNumericValue } from "src/utils/examReference";
import { useCompanyStore } from "src/stores/company";
import { printExamResult } from "src/utils/reports/examResult";

const router = useRouter();
const route  = useRoute();
const consultationId = route.params.consultationId;
const user   = SessionStorage.getItem("alfavida_user");
const emits  = defineEmits(["concluded", "updated"]);

const props = defineProps({
  screening:   { type: Object },
  exams:       { type: Array,  default: () => [] },
  observation: { type: Object, default: () => ({}) },
  observations:{ type: Array,  default: () => [] },
  internment:  { type: Object, default: () => ({}) },
  prescriptions:{ type: Array, default: () => [] },
  description: { type: String, default: "" },
  stage:       { type: String, default: "CONSULTATION" },
  results:     { type: Array,  default: () => [] },
  diagnosis:   { type: String },
  status:      { type: String },
});

const isPrescritioning = ref(false);

const allResults = computed(() => {
  const list = [...(props.results ?? [])];
  if (Array.isArray(props.observation?.exams)) list.push(...props.observation.exams);
  return list;
});

/* ── Barra de ações ── */
const companyStore = useCompanyStore();
const examCardRef  = ref(null);
const scrollToExams = () => examCardRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
const exportPdf = () => {
  const c = companyStore.data?.data;
  printExamResult({
    clinic:  { name: c?.nome ?? c?.name, phone: c?.phone, address: c?.address },
    patient: {
      name:     props.screening?.customer?.name,
      phone:    props.screening?.customer?.phone,
      birthday: props.screening?.customer?.birthday,
    },
    doctor: { name: user?.name },
    date:   new Date(),
    exams:  allResults.value,
  });
};

const erHasFields = (exam) => Array.isArray(exam.result) && exam.result.some((f) => f.input !== "SECTION");
const erGetFields = (exam) => Array.isArray(exam.result) ? exam.result : [];

/* ── Cartões colapsáveis + grelha (Alterado abre por defeito; Normal fecha) ── */
const erFieldCount  = (e) => (Array.isArray(e.result) ? e.result.filter((f) => f.input !== "SECTION").length : 0);
const erHasSections = (e) => { const t = e.exam?.exam?.subItens; return Array.isArray(t) && t.some((f) => f.input === "SECTION"); };
const erIsWide      = (e) => erHasSections(e) || erFieldCount(e) > 6;
const erSummary = (e) => {
  if (erHasFields(e)) {
    const fields = erGroups(e).flatMap((g) => g.fields);
    const bad = fields.filter((f) => erFieldAbnormal(e, f)).length;
    const n = fields.length;
    return bad ? `${bad} alterado${bad !== 1 ? "s" : ""} de ${n}` : `${n} parâmetro${n !== 1 ? "s" : ""}`;
  }
  if (e.resultText) return "Texto livre";
  if (!e.paid) return "Não faturado";
  return "Sem resultado";
};
const erOpenIds = reactive(new Set());
watch(allResults, (list) => {
  erOpenIds.clear();
  (list ?? []).forEach((e) => { if (e.resultColor === "RED") erOpenIds.add(e.id); });
}, { immediate: true });
const erIsOpen = (e) => erOpenIds.has(e.id);
const erToggle = (e) => { erOpenIds.has(e.id) ? erOpenIds.delete(e.id) : erOpenIds.add(e.id); };

/* ── Agrupamento por secção + destaque de anormais (Passo 3) ── */
// As secções estão na DEFINIÇÃO do exame (exam.exam.subItens, já carregada com a
// consulta) — o result guardado não as inclui. Agrupamos pela definição e
// cruzamos os valores guardados por label. Presentação apenas.
const erGroups = (e) => {
  const template = e.exam?.exam?.subItens;
  const saved = erGetFields(e);
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
// Referência efetiva do campo (definição do exame + overrides) e deteção de
// alterado (por intervalo numérico; senão heurística qualitativa).
const erExamName = (e) => e.exam?.name ?? "";
const erRefFor = (exam, f) => referenceFor(erExamName(exam), f.label, f.reference);
const erFieldAbnormal = (exam, f) => fieldIsAbnormal(f.value, erRefFor(exam, f));
const erNeedsRef = (exam, f) => !erRefFor(exam, f) && isNumericValue(f.value);

/* ── Observação / Internamento (leitura) ── */
// O médico precisa de rever o que foi feito na observação/internamento sem sair
// da consulta: tipo, estado, soros/medicação, notas e resultados dos exames.
const observationList = computed(() =>
  (props.observations ?? []).filter((o) => o && (o.id || o.serviceId))
);
const internmentData = computed(() =>
  props.internment && (props.internment.id || props.internment.serviceId) ? props.internment : null
);
const hasClinicalInfo = computed(() => observationList.value.length > 0 || !!internmentData.value);

const clinicalStatus = (status) =>
  ({
    pending: { label: "Pendente", cls: "ci-status--pending" },
    running: { label: "Em curso", cls: "ci-status--running" },
    done:    { label: "Concluída", cls: "ci-status--done" },
  }[status] ?? { label: status || "—", cls: "ci-status--pending" });

const ciDateTime = (val) =>
  val
    ? new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(val))
    : "—";

const examBadge = (ex) => {
  if (ex.resultColor === "GREEN") return { label: "Normal", cls: "cib--ok" };
  if (ex.resultColor === "RED")   return { label: "Alterado", cls: "cib--bad" };
  if (!ex.paid)                   return { label: "Não faturado", cls: "cib--locked" };
  return { label: "Pendente", cls: "cib--pending" };
};

const examSummary = (ex) => {
  if (Array.isArray(ex.result)) {
    return ex.result
      .filter((f) => f.input !== "SECTION" && f.value != null && String(f.value).trim() !== "")
      .map((f) => `${f.label}: ${f.value}${f.unit ? " " + f.unit : ""}`)
      .join("  ·  ");
  }
  return ex.resultText || "";
};

const form = reactive({
  description: props.description || "",
  diagnosis:   props.diagnosis   || "",
  doctorId:    user.id,
  observation: props.observation?.serviceId
    ? { id: props.observation.id, serviceId: props.observation.serviceId, exams: props.observation.exams?.map((i) => i.exam?.id) ?? [], text: props.observation.description }
    : { id: "", serviceId: "", exams: [], text: "" },
  internment: props.internment?.serviceId
    ? { id: props.internment.id, serviceId: props.internment.serviceId, exams: props.internment.exams?.map((i) => i.id) ?? [], text: props.internment.description }
    : { id: "", serviceId: "", exams: [], text: "" },
});

/* ── Mandatory submission tracking ── */
const observationSubmitted = ref(!!props.observation?.serviceId || props.observations.some(o => !!o.serviceId));
const internmentSubmitted  = ref(!!(props.internment?.serviceId || props.observation?.serviceId) || props.observations.some(o => !!o.serviceId));

/* ── Severity ── */
const critScore = (v) => ({ GREEN: 1, ORANGE: 2, RED: 3 }[v] ?? 0);
const bpmScore  = (v) => { const n = Number(v); if (!v || isNaN(n)) return 0; if (n >= 60 && n <= 100) return 1; if (n >= 40 && n <= 120) return 2; return 3; };
const bpScore   = (v) => { if (!v) return 0; const [s, d] = v.split("/").map(Number); if (isNaN(s)) return 0; if (s < 120 && (!d || d < 80)) return 1; if (s < 130) return 2; return 3; };

const score = computed(() => {
  const s = props.screening;
  if (!s) return { tier: "none", label: "Sem dados", icon: "las la-question-circle", style: { color: "var(--text-faint)", background: "#f7f8fc" } };
  const t = critScore(s.oxygen) + critScore(s.fever) + critScore(s.breathingRate) + bpmScore(s.heartbeatRate) + bpScore(s.bloodPressure);
  if (!t)    return { tier: "none",   label: "Sem dados",   icon: "las la-question-circle",     style: { color: "var(--text-faint)", background: "#f7f8fc" } };
  if (t <= 5)  return { tier: "green",  label: "Não urgente", icon: "las la-check-circle",       style: { color: "#32b989", background: "rgba(50,185,137,0.10)", borderColor: "#32b989" } };
  if (t <= 10) return { tier: "orange", label: "Urgência",    icon: "las la-exclamation-circle", style: { color: "#dd6b20", background: "rgba(237,137,54,0.10)",  borderColor: "#dd6b20" } };
  return         { tier: "red",    label: "Emergência",  icon: "las la-times-circle",       style: { color: "#e53e3e", background: "rgba(229,62,62,0.10)",   borderColor: "#e53e3e" } };
});

const isDone           = computed(() => props.status === "done");
const isReadingOnly    = computed(() => isDone.value);
const observationIsDone = computed(() => props.observation?.status === "done");
const hasDiagnosis     = computed(() => !!form.diagnosis?.trim());

/* ── Can terminate? ── */
const canStop = computed(() => {
  if (score.value.tier === "orange") return observationSubmitted.value;
  if (score.value.tier === "red")    return internmentSubmitted.value;
  return true;
});

const stopBlockReason = computed(() => {
  if (score.value.tier === "orange" && !observationSubmitted.value) return "Solicite a observação antes de terminar";
  if (score.value.tier === "red"    && !internmentSubmitted.value)  return "Solicite a observação de emergência antes de terminar";
  return "";
});

/* ── Exam catalogue ── */
const catalogue        = reactive([]);
const loadingCatalogue = ref(false);

const requestedExams = reactive(
  (props.exams ?? []).map((item) => ({
    examId: item.exam?.id ?? item.examId,
    name:   item.exam?.name ?? "—",
    paid:   item.paid,
  }))
);
const requestedExamIds = reactive(new Set(requestedExams.map((e) => e.examId)));
const selectedExamIds  = reactive(new Set());
const sendingExams     = ref(false);

const toggleExam = (id) => {
  if (requestedExamIds.has(id)) return;
  if (selectedExamIds.has(id)) selectedExamIds.delete(id);
  else selectedExamIds.add(id);
};

const chipClass = (id) => {
  if (requestedExamIds.has(id)) return "exam-chip--done";
  if (selectedExamIds.has(id))  return "exam-chip--selected";
  return "";
};

const fetchCatalogue = async () => {
  try {
    loadingCatalogue.value = true;
    const { data } = await api.get("services/laboratory/list");
    catalogue.splice(0, catalogue.length, ...(data.data?.subCategories ?? []));
  } finally {
    loadingCatalogue.value = false;
  }
};

const onRequestExams = async () => {
  if (!selectedExamIds.size) return;
  sendingExams.value = true;
  try {
    const ids = [...selectedExamIds];
    const { data } = await api.post("request-exams/" + consultationId, { exams: ids });
    showNotify(data.message, data.success);
    if (data.success) {
      for (const id of ids) {
        if (!requestedExamIds.has(id)) {
          requestedExamIds.add(id);
          requestedExams.push({ examId: id, name: findExamName(id), paid: false });
        }
        selectedExamIds.delete(id);
      }
    }
  } catch (_) {
    showNotify("Erro ao solicitar exames", false);
  } finally {
    sendingExams.value = false;
  }
};

const findExamName = (id) => {
  for (const section of catalogue) {
    const svc = section.Service?.find((s) => s.id === id);
    if (svc) return svc.name;
  }
  return id;
};

/* ── Debounced save ── */
let _timer = null;
const scheduleUpdate = () => {
  clearTimeout(_timer);
  _timer = setTimeout(() => { _timer = null; updateConsultation(); }, 1400);
};

/* ── API ── */
const startConsultation = async () => {
  if (props.status !== "pending") return;
  try {
    await api.patch("consultations/" + consultationId, {
      status: "running", doctorId: form.doctorId, stage: "CONSULTING_CLINIC",
    });
    emits("updated");
  } catch (_) {}
};

const updateConsultation = async () => {
  try {
    const { data } = await api.patch("consultations/" + consultationId, {
      description: form.description, diagnosis: form.diagnosis,
    });
    showNotify(data.message, data.success);
  } catch (_) {}
};

onUnmounted(() => {
  if (_timer) { clearTimeout(_timer); _timer = null; void updateConsultation(); }
});

const stopping = ref(false);
const stopConsultation = async () => {
  stopping.value = true;
  try {
    const { data } = await api.patch("consultations/" + consultationId, { status: "done" });
    if (data.success) {
      showNotify("Consulta terminada com sucesso", true);
      emits("concluded");
    } else {
      showNotify(data.message || "Erro ao terminar consulta", false);
    }
  } catch (e) {
    showNotify(e?.response?.data?.message || "Erro ao terminar consulta", false);
  } finally {
    stopping.value = false;
  }
};

onMounted(() => {
  startConsultation();
  fetchCatalogue();
});
</script>

<style scoped lang="scss">
.cf-wrap {
  background: var(--surface);
  border-radius: var(--r-control);
  border: 1px solid var(--border);
  overflow: hidden;
}

/* Status bar */
.cf-status-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;
  padding: 9px 13px; border-bottom: 1px solid var(--border-soft); background: var(--surface-2);
}
.csb-left { display: flex; align-items: center; gap: 10px; }
.csb-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.cf-act-btn {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-2);
  background: var(--surface-3); border: 1px solid var(--border-strong);
  border-radius: var(--r-sm); padding: 6px 11px; cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}
.cf-act-btn:hover { background: var(--surface); border-color: var(--chip-info); color: var(--chip-info); }

.sev-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; padding: 4px 12px;
  border-radius: var(--r-pill); border: 1.5px solid transparent;
}
.done-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; padding: 4px 12px;
  border-radius: var(--r-pill); color: var(--st-info-text); background: rgba(66,153,225,0.08); border: 1.5px solid var(--st-info);
}

/* Mandatory alert panels */
.cf-mandatory {
  border-bottom: 1px solid transparent;
}
.cf-mandatory--orange {
  border-color: rgba(237,137,54,0.25);
  background: rgba(237,137,54,0.04);
}
.cf-mandatory--red {
  border-color: rgba(229,62,62,0.2);
  background: rgba(229,62,62,0.04);
}
.cma-header {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700;
  border-bottom: 1px solid transparent;
}
.cf-mandatory--orange .cma-header {
  color: var(--chip-warn); border-color: rgba(237,137,54,0.2);
  background: rgba(237,137,54,0.07);
}
.cf-mandatory--red .cma-header {
  color: var(--danger); border-color: rgba(229,62,62,0.15);
  background: rgba(229,62,62,0.06);
}
.cma-done-badge {
  margin-left: auto; display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--chip-ok);
  background: rgba(50,185,137,0.1); border: 1px solid rgba(50,185,137,0.3);
  padding: 2px 10px; border-radius: var(--r-pill);
}
.cma-body { padding: 16px; }

/* Sections */
.cf-section {
  padding: 12px 13px; border-bottom: 1px solid var(--border-soft);
  &:last-child { border-bottom: none; }
}
.cfs-label {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-faint);
  text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px;
}
.cfs-readonly { font-size: var(--fs-title); color: var(--text-2); line-height: 1.6; white-space: pre-wrap; }
.cfs-hint     { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); text-align: right; margin-top: 4px; }

.cf-textarea {
  width: 100%; resize: vertical; border: 1.5px solid var(--border-strong);
  border-radius: var(--r-sm); padding: 10px 12px; font-size: var(--fs-body); color: var(--text-2);
  font-family: inherit; line-height: 1.6; outline: none; transition: border-color 0.15s;
  &::placeholder { color: var(--text-disabled); }
  &:focus { border-color: var(--st-info); }
}

/* ── Observação / Internamento (leitura) ── */
.cf-clinical { display: flex; flex-direction: column; }
.ci-card {
  border: 1px solid var(--border);
  border-radius: var(--r-panel);
  background: var(--surface-2);
  padding: 12px 14px;
  margin-bottom: 10px;
  &:last-child { margin-bottom: 0; }
}
.ci-card--int { border-left-color: #7e57c2; }

.ci-head { display: flex; align-items: center; gap: 8px; }
.ci-icon {
  width: 26px; height: 26px; border-radius: var(--r-sm); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.ci-icon--obs { background: rgba(49,151,149,0.12); color: var(--st-teal-text); }
.ci-icon--int { background: rgba(126,87,194,0.12); color: #7e57c2; }
.ci-title {
  flex: 1; min-width: 0; font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text-2);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ci-status {
  flex-shrink: 0; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; padding: 2px 10px; border-radius: var(--r-pill);
  text-transform: uppercase; letter-spacing: 0.4px;
}
.ci-status--pending { color: var(--text-faint); background: var(--surface-3); border: 1px solid var(--border-strong); }
.ci-status--running { color: var(--chip-warn); background: rgba(237,137,54,0.1); border: 1px solid rgba(237,137,54,0.3); }
.ci-status--done    { color: var(--chip-ok); background: rgba(50,185,137,0.1); border: 1px solid rgba(50,185,137,0.3); }

.ci-meta {
  display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted);
  span { display: inline-flex; align-items: center; gap: 4px; }
}
.ci-notes {
  margin-top: 8px; font-size: var(--fs-body); color: var(--text-2); line-height: 1.55;
  white-space: pre-wrap;
  background: var(--surface); border-radius: var(--r-sm); padding: 8px 10px;
}
.ci-block { margin-top: 10px; }
.ci-sub {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 800; color: var(--text-faint);
  text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px;
}

.ci-serum-list { display: flex; flex-direction: column; gap: 4px; }
.ci-serum-item {
  display: flex; align-items: center; gap: 7px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-2);
  background: var(--surface); border-radius: var(--r-sm); padding: 6px 9px;
}
.ci-serum-name { font-weight: 600; }
.ci-serum-meta { color: var(--text-faint); font-size: var(--fs-label); line-height: var(--lh-tight); }

.ci-exam-list { display: flex; flex-direction: column; gap: 6px; }
.ci-exam {
  background: var(--surface); border: 1px solid var(--border-soft);
  border-radius: var(--r-sm); padding: 7px 9px;
}
.ci-exam-top { display: flex; align-items: center; gap: 7px; }
.ci-exam-name {
  flex: 1; min-width: 0; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-2);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ci-exam-badge {
  flex-shrink: 0; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; padding: 2px 8px; border-radius: var(--r-pill);
}
.cib--ok      { color: var(--chip-ok); background: rgba(50,185,137,0.1); border: 1px solid rgba(50,185,137,0.3); }
.cib--bad     { color: var(--danger); background: rgba(229,62,62,0.1); border: 1px solid rgba(229,62,62,0.3); }
.cib--locked  { color: var(--text-muted); background: var(--surface-3); border: 1px solid var(--border-strong); }
.cib--pending { color: var(--text-faint); background: var(--surface-3); border: 1px solid var(--border-strong); }
.ci-exam-sum {
  margin-top: 5px; font-size: var(--fs-label); color: var(--text-muted); line-height: 1.5;
  white-space: pre-wrap;
}

/* Exam results */
.cfs-count {
  display: inline-flex; align-items: center; justify-content: center;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: #fff; background: #4299e1;
  border-radius: var(--r-pill); padding: 1px 7px; margin-left: 6px; vertical-align: middle;
}
/* Grelha: exames curtos lado a lado, painéis grandes (Urina) a toda a largura */
.er-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: start; }
.er-card--wide { grid-column: 1 / -1; }
@media (max-width: 1200px) { .er-grid { grid-template-columns: 1fr; } }

.er-card {
  border: 1px solid var(--border);
  border-radius: var(--r-panel); overflow: hidden; background: var(--surface);
  /* Normal ou alterado marca o contorno inteiro, a 1px. */
  &.er--ok  { border-color: var(--accent); }
  &.er--bad { border-color: var(--danger); }
}
.er-head {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 14px; background: var(--surface-2); border-bottom: 1px solid var(--border-soft);
}
.er-head--btn { cursor: pointer; user-select: none; transition: background 0.12s; }
.er-head--btn:hover { background: var(--surface-3); }
.er-card:not(.er-card--open) .er-head { border-bottom-color: transparent; }
.er-summary {
  flex-shrink: 0; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-faint); white-space: nowrap;
}
.er-chevron { flex-shrink: 0; color: var(--text-faint); transition: transform 0.18s; }
.er-chevron--open { transform: rotate(180deg); }
.er-icon {
  width: 26px; height: 26px; border-radius: var(--r-sm); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.eri--ok      { background: rgba(50,185,137,0.12); color: var(--st-ok-text); }
.eri--bad     { background: rgba(229,62,62,0.1);   color: var(--danger); }
.eri--neutral { background: var(--border);               color: var(--text-faint); }
.er-name {
  flex: 1; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-2);
  text-transform: uppercase; letter-spacing: 0.4px;
}
.er-badge {
  display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; padding: 2px 9px; border-radius: var(--r-pill);
}
.erb--ok     { color: var(--chip-ok); background: rgba(50,185,137,0.1);  border: 1px solid rgba(50,185,137,0.3); }
.erb--bad    { color: var(--danger); background: rgba(229,62,62,0.1);   border: 1px solid rgba(229,62,62,0.3); }
.erb--locked { color: var(--text-muted); background: var(--surface-3);               border: 1px solid var(--border-strong); }
.erb--pending{ color: var(--text-faint); background: var(--surface-3);               border: 1px solid var(--border-strong); }
.er-fields { padding: 8px 14px 12px; display: flex; flex-direction: column; gap: 2px; }
.er-group { display: flex; flex-direction: column; }
.er-group + .er-group { margin-top: 8px; }
.er-sep {
  display: flex; align-items: center; gap: 5px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 800; color: var(--chip-info);
  text-transform: uppercase; letter-spacing: 0.8px;
  background: rgba(66,153,225,0.1); padding: 5px 9px; border-radius: var(--r-sm);
  margin: 2px 0 4px;
}
.er-field {
  display: grid; grid-template-columns: 1fr auto; grid-template-rows: auto auto;
  gap: 1px 10px; align-items: center;
  /* Contorno sempre reservado, para o hover das linhas com banda ter onde
     pintar sem deslocar nada. O padding desce 1px de cada lado para a caixa
     ficar da mesma altura que antes. */
  padding: 5px 7px; border: 1px solid transparent;
  border-radius: var(--r-sm); transition: background 0.1s, border-color 0.1s;
  &:not(.er-field--bad):hover { background: var(--surface-3); }
}
.er-fl   { display: flex; align-items: center; gap: 5px; grid-column: 1; grid-row: 1; }
.er-fname { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-muted); }
.er-funit {
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint);
  background: var(--border); padding: 1px 5px; border-radius: var(--r-sm);
}
.er-fval  { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text); grid-column: 2; grid-row: 1; text-align: right; white-space: nowrap; }
/* Valor anormal — salta à vista (ex.: Sangue ++++, Proteína ++) */
/* `erFieldAbnormal` é binário — fora do intervalo, sim ou não — e isso é o
   degrau "alterado" da direcção Banda, que é âmbar. O vermelho literal que
   estava aqui pintava de crítico o que o código nunca classificou como tal. */
.er-field--bad { background: var(--clin-banda-alterado); }
/* O hover não toca no preenchimento de uma linha que transporta estado
   clínico: exprime-se pelo contorno. Antes subia a tinta de 6% para 10% e
   tirava contraste ao valor exactamente quando o clínico aponta para ele. */
.er-field--bad:hover { border-color: var(--clin-contorno-hover); }
.er-fval--bad { color: var(--clin-texto-alterado); font-weight: 800; }
.er-fref  { display: flex; align-items: center; gap: 3px; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); grid-column: 1 / -1; grid-row: 2; }
.er-fref--todo { color: var(--chip-warn); font-style: italic; opacity: 0.85; }
.er-freetext {
  margin: 10px 14px;
  font-size: var(--fs-label); color: var(--text-3); line-height: 1.6; white-space: pre-wrap;
  background: var(--surface-2); border-radius: var(--r-sm); padding: 10px 12px;
}
.er-empty {
  padding: 14px; text-align: center; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-disabled);
}

/* ── Exam request card ── */
.cf-rx-wrap { margin: 12px 13px; }
.cf-exam-card {
  margin: 12px 16px; border-radius: var(--r-sm); overflow: hidden;
  border: 1.5px solid rgba(66,153,225,0.2);
  background: rgba(66,153,225,0.03);
}
.cec-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; background: rgba(66,153,225,0.07);
  border-bottom: 1.5px solid rgba(66,153,225,0.15);
}
.cec-title {
  display: flex; align-items: center; gap: 7px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--chip-info);
  text-transform: uppercase; letter-spacing: 0.5px;
}

/* Already-requested strip */
.requested-wrap {
  background: rgba(50,185,137,0.05); border-bottom: 1px solid rgba(50,185,137,0.15);
  padding: 10px 14px;
}
.req-row   { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.req-title { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--st-ok-text); text-transform: uppercase; letter-spacing: 0.5px; }
.req-chips { display: flex; flex-wrap: wrap; gap: 6px; }

/* Catalogue */
.cat-loading { display: flex; justify-content: center; padding: 16px; }
.catalogue   { padding: 14px; display: flex; flex-direction: column; gap: 14px; }

.cat-group-name {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 800; color: var(--text-faint); text-transform: uppercase;
  letter-spacing: 0.8px; margin-bottom: 7px;
}
.cat-chips { display: flex; flex-wrap: wrap; gap: 6px; }

/* Exam chip states */
.exam-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 500; padding: 5px 12px;
  border-radius: var(--r-pill); cursor: pointer; user-select: none;
  border: 1.5px solid var(--border-strong); color: var(--text-3); background: var(--surface-3);
  transition: all 0.12s;
  &:hover { border-color: var(--st-info); color: var(--chip-info); background: rgba(66,153,225,0.06); }
}
.exam-chip--selected {
  background: rgba(66,153,225,0.12); border-color: var(--st-info); color: var(--chip-info); font-weight: 600;
  &:hover { background: rgba(66,153,225,0.18); }
}
.exam-chip--done {
  background: rgba(50,185,137,0.08); border-color: var(--st-ok); color: var(--chip-ok);
  cursor: default; font-weight: 600;
  &:hover { background: rgba(50,185,137,0.08); border-color: var(--st-ok); color: var(--chip-ok); }
}
.chip-desc   { color: var(--text-faint); font-weight: 400; }
.chip-unpaid { color: var(--danger); font-size: var(--fs-label); line-height: var(--lh-tight); }
</style>
