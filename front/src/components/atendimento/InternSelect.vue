<template>
  <div class="is-wrap">

    <!-- Done state -->
    <div v-if="submitted" class="is-done">
      <q-icon name="las la-check-circle" size="22px" style="color:#32b989" />
      <div>
        <div class="is-done-title">{{ submittedLabel }}</div>
        <div class="is-done-sub">{{ submittedName }}</div>
      </div>
    </div>

    <!-- Form -->
    <div v-else class="is-form">

      <!-- Type toggle -->
      <div class="is-toggle">
        <button class="is-toggle-btn" :class="mode === 'obs' && 'is-toggle-btn--active'" @click="mode = 'obs'; selectedId = ''">
          <q-icon name="las la-procedures" size="13px" />
          Observação
        </button>
        <button class="is-toggle-btn" :class="mode === 'intern' && 'is-toggle-btn--active'" @click="mode = 'intern'; selectedId = ''">
          <q-icon name="las la-bed" size="13px" />
          Internamento
        </button>
      </div>

      <!-- Options list -->
      <div class="is-field-label" style="margin-top:14px">
        {{ mode === 'obs' ? 'Tipo de observação de emergência' : 'Tipo de internamento' }}
      </div>
      <div v-if="loading" class="is-loading"><q-spinner-dots color="red-8" size="18px" /></div>
      <div v-else class="is-options">
        <div
          v-for="opt in activeOptions" :key="opt.id"
          class="is-option" :class="selectedId === opt.id && 'is-option--selected'"
          @click="selectedId = opt.id"
        >
          <div class="is-opt-dot" :class="selectedId === opt.id && 'is-opt-dot--on'" />
          <div>
            <div class="is-opt-name">{{ opt.name }}</div>
            <div v-if="opt.description" class="is-opt-desc">{{ opt.description }}</div>
          </div>
        </div>
      </div>

      <template v-if="selectedId">

        <!-- Optional lab exams (observation mode only) -->
        <template v-if="mode === 'obs'">
          <div class="is-field-label" style="margin-top:14px">
            Exames de laboratório <span class="is-optional">(opcional)</span>
          </div>
          <div v-if="loadingExams" class="is-loading"><q-spinner-dots color="red-8" size="14px" /></div>
          <div v-else class="is-exam-groups">
            <div v-for="section in examSections" :key="section.name" class="is-exam-group">
              <div class="is-exam-group-name">{{ section.name }}</div>
              <div class="is-exam-chips">
                <span
                  v-for="svc in section.Service" :key="svc.id"
                  class="is-exam-chip" :class="exams.includes(svc.id) && 'is-exam-chip--on'"
                  @click="toggleExam(svc.id)"
                >
                  <q-icon :name="exams.includes(svc.id) ? 'las la-check-circle' : 'las la-circle'" size="11px" />
                  {{ svc.name }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- Soro e medicação -->
        <div class="is-serum-section">
          <div class="iss-header-row">
            <div class="iss-header">
              <q-icon name="las la-syringe" size="14px" />
              Soro e medicação
              <span class="is-optional">(opcional)</span>
            </div>
            <q-btn flat no-caps dense icon="las la-plus" label="Adicionar" color="teal-8"
              style="font-size:var(--fs-label)" @click="showAddSerum = !showAddSerum" />
          </div>

          <!-- Add form -->
          <div v-if="showAddSerum" class="is-add-serum">
            <input v-model="newSerum.nome" class="is-input" placeholder="Nome (ex: Soro fisiológico 0.9%)" />
            <div class="is-add-row">
              <input v-model="newSerum.dose" class="is-input" placeholder="Dose (ex: 500ml, 1g)" />
              <select v-model="newSerum.via" class="is-select">
                <option value="EV">EV – Endovenoso</option>
                <option value="IM">IM – Intramuscular</option>
                <option value="SC">SC – Subcutâneo</option>
                <option value="VO">VO – Oral</option>
                <option value="SL">SL – Sublingual</option>
              </select>
            </div>
            <div class="is-add-actions">
              <q-btn unelevated no-caps label="Confirmar" color="teal-8" size="sm"
                style="border-radius:var(--r-sm)" @click="confirmAddSerum" />
              <q-btn flat no-caps label="Cancelar" size="sm" @click="showAddSerum = false" />
            </div>
          </div>

          <!-- Serum list -->
          <div v-if="serums.length" class="is-serum-list">
            <div v-for="(s, i) in serums" :key="i" class="is-serum-item">
              <div class="isi-icon"><q-icon name="las la-syringe" size="14px" style="color:#319795" /></div>
              <div class="isi-info">
                <span class="isi-name">{{ s.nome }}</span>
                <span class="isi-meta">{{ s.dose }}&nbsp;·&nbsp;{{ s.via }}</span>
              </div>
              <q-btn flat round dense icon="las la-times" size="xs" color="grey-5" @click="serums.splice(i, 1)" />
            </div>
          </div>
          <div v-else-if="!showAddSerum" class="is-serum-empty">
            Nenhum soro ou medicação indicado
          </div>
        </div>

      </template>

      <!-- Medical notes -->
      <div class="is-field-label" style="margin-top:14px">
        Indicações médicas <span class="is-optional">(opcional)</span>
      </div>
      <textarea
        v-model="medNotes"
        class="is-textarea"
        rows="2"
        :placeholder="mode === 'obs' ? 'Indicações para a equipa de observação…' : 'Indicações para a equipa de internamento…'"
      />

      <q-btn
        unelevated no-caps
        :icon="mode === 'obs' ? 'las la-save' : 'las la-bed'"
        :label="mode === 'obs' ? 'Solicitar observação de emergência' : 'Solicitar internamento'"
        color="red-8"
        :disable="!selectedId"
        :loading="saving"
        style="border-radius:var(--r-sm); font-size:var(--fs-label); margin-top:16px"
        @click="onSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { api } from "src/boot/axios";
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { showNotify } from "src/utils/notify";

const props = defineProps({
  initialServiceId: { type: String, default: "" },
  customerId: { type: String, default: "" },
});
const emit = defineEmits(["submitted"]);

const route = useRoute();

const mode       = ref("obs");
const selectedId = ref("");
const medNotes   = ref("");
const exams      = ref([]);
const saving     = ref(false);
const loading    = ref(false);
const loadingExams = ref(false);
const submitted    = ref(!!props.initialServiceId);
const submittedName  = ref("");
const submittedLabel = ref("");

const serums       = ref([]);
const showAddSerum = ref(false);
const newSerum     = reactive({ nome: "", dose: "", via: "EV" });

const obsOptions    = reactive([]);
const internOptions = reactive([]);
const examSections  = reactive([]);

const activeOptions = computed(() => mode.value === "obs" ? obsOptions : internOptions);

const toggleExam = (id) => {
  const idx = exams.value.indexOf(id);
  if (idx >= 0) exams.value.splice(idx, 1);
  else exams.value.push(id);
};

const confirmAddSerum = () => {
  if (!newSerum.nome.trim()) return;
  serums.value.push({ nome: newSerum.nome, dose: newSerum.dose, via: newSerum.via });
  Object.assign(newSerum, { nome: "", dose: "", via: "EV" });
  showAddSerum.value = false;
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [obsRes, internRes] = await Promise.all([
      api.get("services/observation/list"),
      api.get("services/internment/list"),
    ]);
    const all = obsRes.data.data ?? [];
    obsOptions.splice(0, obsOptions.length, ...all);
    internOptions.splice(0, internOptions.length, ...(internRes.data.data ?? []));
    if (props.initialServiceId) {
      const match = all.find((s) => s.id === props.initialServiceId)
        ?? (internRes.data.data ?? []).find((s) => s.id === props.initialServiceId);
      if (match) submittedName.value = match.name;
    }
  } finally {
    loading.value = false;
  }
};

const fetchExams = async () => {
  loadingExams.value = true;
  try {
    const { data } = await api.get("services/laboratory/list");
    examSections.splice(0, examSections.length, ...(data.data?.subCategories ?? []));
  } finally {
    loadingExams.value = false;
  }
};

const onSubmit = async () => {
  if (!selectedId.value) return;
  saving.value = true;
  try {
    await api.post("observations", {
      consultationId: route.params.consultationId,
      serviceId: selectedId.value,
      exams: exams.value,
      serum: serums.value.length ? serums.value : undefined,
    });

    if (medNotes.value.trim()) {
      await api.patch("consultations/" + route.params.consultationId, {
        description: medNotes.value,
      });
    }

    const found = activeOptions.value.find((o) => o.id === selectedId.value);
    submittedName.value  = found?.name ?? "";
    submittedLabel.value = mode.value === "obs"
      ? "Observação de emergência solicitada"
      : "Internamento solicitado";
    submitted.value = true;
    emit("submitted");
    showNotify(submittedLabel.value, true);
  } catch (_) {
    showNotify("Erro ao solicitar", false);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchData();
  fetchExams();
});
</script>

<style scoped lang="scss">
.is-wrap { display: flex; flex-direction: column; }

.is-done {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; background: rgba(50,185,137,0.08);
  border: 1px solid rgba(50,185,137,0.25); border-radius: var(--r-sm);
}
.is-done-title { font-size: var(--fs-body); font-weight: 700; color: var(--chip-ok); }
.is-done-sub   { font-size: var(--fs-label); color: #48bb78; margin-top: 1px; }

.is-form { display: flex; flex-direction: column; }
.is-loading { display: flex; justify-content: center; padding: 12px 0; }

.is-toggle {
  display: flex; gap: 4px;
  background: var(--surface-3); border: 1.5px solid var(--border-strong);
  border-radius: var(--r-sm); padding: 3px; align-self: flex-start;
}
.is-toggle-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 16px; border-radius: var(--r-sm); font-size: var(--fs-label); font-weight: 600;
  color: var(--text-muted); background: transparent; border: none; cursor: pointer;
  transition: all 0.12s;
  &:hover { background: var(--surface); color: var(--text-2); }
}
.is-toggle-btn--active {
  background: var(--surface); color: var(--danger);
}

.is-field-label {
  font-size: var(--fs-label); font-weight: 800; color: var(--danger);
  text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px;
}
.is-optional { font-weight: 400; color: var(--text-faint); text-transform: none; letter-spacing: 0; }

.is-options { display: flex; flex-direction: column; gap: 6px; }
.is-option {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 12px; border: 1.5px solid var(--border-strong); border-radius: var(--r-sm);
  cursor: pointer; transition: all 0.12s; background: var(--surface);
  &:hover { border-color: #fc8181; background: rgba(229,62,62,0.04); }
}
.is-option--selected { border-color: var(--st-danger); background: rgba(229,62,62,0.05); }
.is-opt-dot {
  width: 14px; height: 14px; border-radius: 50%; border: 2px solid #cbd5e0;
  flex-shrink: 0; margin-top: 2px; transition: all 0.12s;
}
.is-opt-dot--on { border-color: var(--st-danger); background: var(--st-danger); }
.is-opt-name { font-size: var(--fs-body); font-weight: 600; color: var(--text-2); }
.is-opt-desc { font-size: var(--fs-label); color: var(--text-faint); margin-top: 2px; }

.is-exam-groups { display: flex; flex-direction: column; gap: 10px; }
.is-exam-group-name { font-size: var(--fs-label); font-weight: 700; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
.is-exam-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.is-exam-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); padding: 4px 10px; border-radius: var(--r-pill);
  border: 1.5px solid var(--border-strong); color: var(--text-muted); background: var(--surface-3);
  cursor: pointer; transition: all 0.12s;
  &:hover { border-color: #fc8181; color: var(--danger); background: rgba(229,62,62,0.05); }
}
.is-exam-chip--on { border-color: var(--st-danger); color: var(--danger); background: rgba(229,62,62,0.07); font-weight: 600; }

/* ── Soro e medicação ─────────────────────────────────────── */
.is-serum-section {
  margin-top: 14px; border: 1.5px solid var(--border-strong); border-radius: var(--r-sm); overflow: hidden;
}
.iss-header-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; background: var(--surface-3); border-bottom: 1px solid var(--border);
}
.iss-header {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--fs-label); font-weight: 800; color: #319795;
  text-transform: uppercase; letter-spacing: 0.6px;
}

.is-add-serum {
  background: var(--surface-3); border-bottom: 1px solid var(--border);
  padding: 12px; display: flex; flex-direction: column; gap: 8px;
}
.is-add-row { display: flex; gap: 8px; }
.is-input {
  flex: 1; border: 1.5px solid var(--border-strong); border-radius: var(--r-sm);
  padding: 7px 10px; font-size: var(--fs-body); color: var(--text-2); font-family: inherit; outline: none;
  &::placeholder { color: var(--text-disabled); }
  &:focus { border-color: #319795; }
}
.is-select {
  border: 1.5px solid var(--border-strong); border-radius: var(--r-sm);
  padding: 7px 10px; font-size: var(--fs-label); color: var(--text-3);
  font-family: inherit; background: var(--surface); outline: none;
  &:focus { border-color: #319795; }
}
.is-add-actions { display: flex; gap: 8px; }

.is-serum-list { display: flex; flex-direction: column; }
.is-serum-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-bottom: 1px solid var(--border);
  &:last-child { border-bottom: none; }
}
.isi-icon { flex-shrink: 0; }
.isi-info { flex: 1; min-width: 0; }
.isi-name { display: block; font-size: var(--fs-body); font-weight: 600; color: var(--text-2); }
.isi-meta { display: block; font-size: var(--fs-label); color: var(--text-faint); margin-top: 1px; }
.is-serum-empty {
  font-size: var(--fs-label); color: var(--text-faint); text-align: center; padding: 14px;
}

.is-textarea {
  width: 100%; resize: vertical; border: 1.5px solid var(--border-strong);
  border-radius: var(--r-sm); padding: 8px 10px; font-size: var(--fs-body); color: var(--text-2);
  font-family: inherit; outline: none;
  &::placeholder { color: var(--text-disabled); }
  &:focus { border-color: #fc8181; }
}
</style>
