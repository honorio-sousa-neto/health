<template>
  <div class="add-page q-pa-md">

    <!-- Back + title -->
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="las la-arrow-left" color="grey-6" class="q-mr-sm"
        @click="$router.go(-1)" />
      <div>
        <div class="text-h6 text-weight-semibold">Novo atendimento</div>
        <div class="text-caption text-grey-5">Registe o paciente para iniciar o atendimento</div>
      </div>
    </div>

    <div class="form-card">

      <!-- ── Type selector ── -->
      <div class="section-label">Tipo de atendimento</div>
      <div class="type-grid q-mb-xl">
        <div
          v-for="t in typeOptions" :key="t.value"
          class="type-card"
          :class="type === t.value ? `tc--${t.value}` : ''"
          @click="switchType(t.value)"
        >
          <div class="tc-icon-wrap" :class="type === t.value ? `tci--${t.value}` : ''">
            <q-icon :name="t.icon" size="22px" />
          </div>
          <div class="tc-body">
            <div class="tc-title">{{ t.label }}</div>
            <div class="tc-sub">{{ t.sub }}</div>
          </div>
          <div class="tc-radio" :class="type === t.value ? `tr--${t.value}` : ''">
            <div v-if="type === t.value" class="tc-radio-dot" />
          </div>
        </div>
      </div>

      <!-- ── Patient search ── -->
      <div class="section-label">Paciente</div>

      <div class="ps-wrap q-mb-md" ref="psWrapRef">
        <!-- Trigger row -->
        <div class="ps-trigger" :class="{ 'pst--open': customerOpen, 'pst--filled': !!selectedCustomer }" @click="openPatientSearch">
          <div class="ps-icon-left">
            <q-icon name="las la-user-circle" size="18px" :color="selectedCustomer ? 'primary' : 'grey-5'" />
          </div>
          <div class="ps-content">
            <template v-if="selectedCustomer && !customerSearch">
              <span class="ps-selected-name">{{ selectedCustomer.name }}</span>
              <span class="ps-selected-phone">{{ selectedCustomer.phone ?? '—' }}</span>
            </template>
            <input
              v-else
              ref="customerInputRef"
              v-model="customerSearch"
              class="ps-input"
              placeholder="Pesquisar por nome ou telefone…"
              @input="onCustomerSearch"
              @keydown.esc="customerOpen = false"
            />
          </div>
          <div class="ps-actions">
            <q-spinner-dots v-if="searchingCustomer" size="16px" color="primary" />
            <q-btn
              v-else-if="selectedCustomer"
              flat round dense size="xs"
              icon="las la-times"
              color="grey-5"
              @click.stop="clearCustomer"
            />
            <q-icon v-else name="las la-search" size="15px" color="grey-5" />
          </div>
        </div>

        <!-- Dropdown -->
        <transition name="ps-drop">
          <div v-if="customerOpen" class="ps-dropdown">
            <div v-if="!customerOptions.length && customerSearch" class="ps-empty">
              <q-icon name="las la-user-slash" size="24px" color="grey-4" />
              <span>Nenhum paciente encontrado</span>
            </div>
            <div v-else-if="!customerOptions.length && !customerSearch" class="ps-hint">
              <q-icon name="las la-search" size="18px" color="grey-4" />
              <span>Digite o nome ou telefone do paciente</span>
            </div>
            <div
              v-for="c in customerOptions"
              :key="c.id"
              class="ps-item"
              :class="{ 'psi--active': selectedCustomer?.id === c.id }"
              @click.stop="selectCustomer(c)"
            >
              <div class="psi-avatar" :style="avatarStyle(c.name)">{{ initials(c.name) }}</div>
              <div class="psi-info">
                <div class="psi-name">{{ c.name }}</div>
                <div class="psi-meta">
                  <q-icon name="las la-phone" size="11px" />
                  {{ c.phone ?? '—' }}
                </div>
              </div>
              <div v-if="selectedCustomer?.id === c.id" class="psi-check">
                <q-icon name="las la-check" size="13px" color="primary" />
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Selected patient banner -->
      <transition name="fade-slide">
        <div v-if="selectedCustomer" class="patient-banner q-mb-lg">
          <div class="pb-avatar" :style="avatarStyle(selectedCustomer.name)">
            {{ initials(selectedCustomer.name) }}
          </div>
          <div class="pb-info">
            <div class="pb-name">{{ selectedCustomer.name }}</div>
            <div class="pb-meta">
              <span><q-icon name="las la-phone" size="12px" /> {{ selectedCustomer.phone ?? '—' }}</span>
            </div>
          </div>
          <q-chip
            outline color="positive" size="sm" icon="las la-check-circle"
            label="Selecionado" class="q-ma-none"
          />
        </div>
      </transition>

      <!-- ── CONSULTA services ── -->
      <template v-if="type === 'consulta'">
        <div class="section-label">
          Serviço de consulta
          <span v-if="consultationServices.length" class="sl-count">{{ consultationServices.length }}</span>
        </div>

        <div v-if="loadingConsultations" class="svc-skeleton q-mb-lg">
          <div v-for="i in 3" :key="i" class="svc-skel-item">
            <q-skeleton type="rect" height="56px" />
          </div>
        </div>
        <div v-else class="svc-list q-mb-lg">
          <div
            v-for="svc in consultationServices"
            :key="svc.id"
            class="svc-row"
            :class="{ 'svr--selected': selectedService?.id === svc.id }"
            @click="selectedService = svc"
          >
            <div class="svr-mark" :class="{ 'mark--on': selectedService?.id === svc.id }" />
            <div class="svr-icon" :class="{ 'svri--on': selectedService?.id === svc.id }">
              <q-icon name="las la-stethoscope" size="18px" />
            </div>
            <div class="svr-body">
              <div class="svr-name">{{ svc.name }}</div>
              <div class="svr-cat-row">
                <span v-if="catLabel(svc)" class="svr-cat-badge">{{ catLabel(svc) }}</span>
                <span v-if="svc.description" class="svr-desc">{{ svc.description }}</span>
              </div>
            </div>
            <div class="svr-right">
              <div v-if="svc.unit_price" class="svr-price">
                {{ fmt(svc.unit_price) }}<span>Kz</span>
              </div>
              <div v-else class="svr-free">Gratuito</div>
              <div v-if="selectedService?.id === svc.id" class="svr-tick">
                <q-icon name="las la-check-circle" size="16px" />
              </div>
            </div>
          </div>
          <div v-if="!consultationServices.length" class="svc-empty">
            <q-icon name="las la-stethoscope" size="28px" color="grey-4" />
            <span>Nenhum serviço de consulta disponível</span>
          </div>
        </div>

        <div class="section-label">Observação <span class="opt">(opcional)</span></div>
        <textarea
          v-model="note"
          class="note-area q-mb-lg"
          rows="3"
          placeholder="Motivo da consulta ou nota clínica…"
        />
      </template>

      <!-- ── VACINA services ── -->
      <template v-else-if="type === 'vacina'">
        <div class="section-label">
          Tipo de vacina
          <span v-if="vaccineServices.length" class="sl-count sl-count--teal">{{ vaccineServices.length }}</span>
        </div>

        <div v-if="loadingVaccines" class="svc-skeleton q-mb-lg">
          <div v-for="i in 2" :key="i" class="svc-skel-item">
            <q-skeleton type="rect" height="56px" />
          </div>
        </div>
        <div v-else class="svc-list q-mb-lg">
          <div
            v-for="svc in vaccineServices"
            :key="svc.id"
            class="svc-row svc-row--teal"
            :class="{ 'svr--selected svr--sel-teal': selectedVaccine?.id === svc.id }"
            @click="selectedVaccine = svc"
          >
            <div class="svr-mark svr-mark--teal" :class="{ 'mark--on': selectedVaccine?.id === svc.id }" />
            <div class="svr-icon svr-icon--teal" :class="{ 'svri--on svri--teal': selectedVaccine?.id === svc.id }">
              <q-icon name="las la-syringe" size="18px" />
            </div>
            <div class="svr-body">
              <div class="svr-name">{{ svc.name }}</div>
              <div class="svr-cat-row">
                <span v-if="catLabel(svc)" class="svr-cat-badge svr-cat-badge--teal">{{ catLabel(svc) }}</span>
                <span v-if="svc.description" class="svr-desc">{{ svc.description }}</span>
              </div>
            </div>
            <div class="svr-right">
              <div v-if="svc.unit_price" class="svr-price svr-price--teal">
                {{ fmt(svc.unit_price) }}<span>Kz</span>
              </div>
              <div v-else class="svr-free">Gratuito</div>
              <div v-if="selectedVaccine?.id === svc.id" class="svr-tick svr-tick--teal">
                <q-icon name="las la-check-circle" size="16px" />
              </div>
            </div>
          </div>
          <div v-if="!vaccineServices.length" class="svc-empty">
            <q-icon name="las la-syringe" size="28px" color="grey-4" />
            <span>Nenhuma vacina disponível</span>
          </div>
        </div>
      </template>

      <!-- ── EXAME services ── -->
      <template v-if="type === 'exame'">
        <div class="section-label">
          Exames
          <span v-if="selectedExams.length" class="sl-count sl-count--teal">{{ selectedExams.length }} seleccionado{{ selectedExams.length !== 1 ? 's' : '' }}</span>
        </div>

        <!-- Search box -->
        <div class="exam-search q-mb-sm">
          <q-icon name="las la-search" size="15px" color="grey-5" class="exam-search-icon" />
          <input
            v-model="examSearch"
            class="exam-search-input"
            placeholder="Pesquisar exame…"
          />
          <q-btn
            v-if="examSearch"
            flat round dense size="xs"
            icon="las la-times" color="grey-5"
            @click="examSearch = ''"
          />
        </div>

        <div v-if="loadingLabExams" class="svc-skeleton q-mb-lg">
          <div v-for="i in 4" :key="i" class="svc-skel-item">
            <q-skeleton type="rect" height="48px" />
          </div>
        </div>
        <div v-else class="svc-list q-mb-lg">
          <div
            v-for="svc in filteredLabServices"
            :key="svc.id"
            class="svc-row svc-row--teal"
            :class="{ 'svr--selected svr--sel-teal': selectedExams.includes(svc.id) }"
            @click="toggleExam(svc.id)"
          >
            <div class="svr-mark svr-mark--teal" :class="{ 'mark--on': selectedExams.includes(svc.id) }" />
            <div class="svr-icon svr-icon--teal" :class="{ 'svri--on svri--teal': selectedExams.includes(svc.id) }">
              <q-icon name="las la-flask" size="18px" />
            </div>
            <div class="svr-body">
              <div class="svr-name">{{ svc.name }}</div>
            </div>
            <div class="svr-right">
              <div v-if="svc.unit_price" class="svr-price svr-price--teal">
                {{ fmt(svc.unit_price) }}<span>Kz</span>
              </div>
              <div v-else class="svr-free">Gratuito</div>
              <div v-if="selectedExams.includes(svc.id)" class="svr-tick svr-tick--teal">
                <q-icon name="las la-check-circle" size="16px" />
              </div>
            </div>
          </div>
          <div v-if="!filteredLabServices.length && !loadingLabExams" class="svc-empty">
            <q-icon name="las la-flask" size="28px" color="grey-4" />
            <span>{{ examSearch ? 'Nenhum exame encontrado' : 'Nenhum exame disponível' }}</span>
          </div>
        </div>
      </template>

      <!-- ── Actions ── -->
      <div class="form-actions">
        <q-btn flat no-caps label="Cancelar" color="grey-6" @click="$router.go(-1)" />
        <q-btn
          unelevated no-caps
          :label="type === 'vacina' ? 'Registar vacina' : type === 'exame' ? 'Emitir fatura' : 'Registar consulta'"
          :icon="type === 'vacina' ? 'las la-syringe' : type === 'exame' ? 'las la-file-invoice-dollar' : 'las la-stethoscope'"
          :color="type === 'vacina' ? 'teal-7' : type === 'exame' ? 'teal-8' : 'primary'"
          class="submit-btn"
          :loading
          :disable="!selectedCustomer || (type === 'consulta' && !selectedService) || (type === 'vacina' && !selectedVaccine) || (type === 'exame' && !selectedExams.length)"
          @click="onSubmit"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { SessionStorage } from "quasar";
import { api } from "src/boot/axios";
import { useInvoiceStore } from "src/stores/invoice";
import { showNotify } from "src/utils/notify";

const router       = useRouter();
const invoiceStore = useInvoiceStore();
const user         = SessionStorage.getItem("alfavida_user");
const loading      = ref(false);

/* ── Type options ── */
const typeOptions = [
  { value: "consulta", label: "Consulta",    sub: "Consulta médica geral ou especialidade", icon: "las la-stethoscope" },
  { value: "vacina",   label: "Vacina",      sub: "Administração de vacina",                icon: "las la-syringe"    },
  { value: "exame",    label: "Laboratório", sub: "Exames de laboratório para paciente externo", icon: "las la-flask" },
];
const type = ref("consulta");

/* ── Patient search ── */
const customerSearch   = ref("");
const customerOptions  = ref([]);
const selectedCustomer = ref(null);
const customerOpen     = ref(false);
const searchingCustomer = ref(false);
const customerInputRef = ref(null);
const psWrapRef        = ref(null);
let customerTimer      = null;

const openPatientSearch = () => {
  customerOpen.value = true;
  if (selectedCustomer.value) {
    customerSearch.value = "";
  }
  setTimeout(() => customerInputRef.value?.focus(), 50);
};

const onCustomerSearch = () => {
  clearTimeout(customerTimer);
  if (!customerSearch.value.trim()) { customerOptions.value = []; return; }
  searchingCustomer.value = true;
  customerTimer = setTimeout(async () => {
    try {
      const { data } = await api.get("customers/filter/search", { params: { search: customerSearch.value } });
      customerOptions.value = data.data ?? [];
    } finally {
      searchingCustomer.value = false;
    }
  }, 350);
};

const selectCustomer = (c) => {
  selectedCustomer.value = c;
  customerSearch.value   = "";
  customerOpen.value     = false;
  customerOptions.value  = [];
};

const clearCustomer = () => {
  selectedCustomer.value = null;
  customerSearch.value   = "";
  customerOptions.value  = [];
  customerOpen.value     = false;
};

const onDocClick = (e) => {
  if (psWrapRef.value && !psWrapRef.value.contains(e.target)) {
    customerOpen.value = false;
  }
};
onMounted(() => document.addEventListener("click", onDocClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));

/* ── Consultation services ── */
const consultationServices = ref([]);
const selectedService      = ref(null);
const loadingConsultations = ref(false);
const note                 = ref("");

const loadConsultations = async () => {
  if (consultationServices.value.length) return;
  loadingConsultations.value = true;
  try {
    const { data } = await api.get("services/consultations/list");
    consultationServices.value = data.data ?? [];
  } finally {
    loadingConsultations.value = false;
  }
};

/* ── Vaccine services ── */
const vaccineServices = ref([]);
const selectedVaccine = ref(null);
const loadingVaccines = ref(false);

const loadVaccines = async () => {
  if (vaccineServices.value.length) return;
  loadingVaccines.value = true;
  try {
    const { data } = await api.get("services/vaccines/list");
    vaccineServices.value = data.data ?? [];
  } finally {
    loadingVaccines.value = false;
  }
};

/* ── Lab exam services ── */
const labServices     = ref([]);
const selectedExams   = ref([]);
const loadingLabExams = ref(false);
const examSearch      = ref("");

const filteredLabServices = computed(() => {
  const q = examSearch.value.trim().toLowerCase();
  if (!q) return labServices.value;
  return labServices.value.filter((s) => s.name.toLowerCase().includes(q));
});

const loadLabExams = async () => {
  if (labServices.value.length) return;
  loadingLabExams.value = true;
  try {
    const { data } = await api.get("services/lab-exams/list");
    labServices.value = data.data ?? [];
  } finally {
    loadingLabExams.value = false;
  }
};

const toggleExam = (id) => {
  const idx = selectedExams.value.indexOf(id);
  if (idx >= 0) selectedExams.value.splice(idx, 1);
  else selectedExams.value.push(id);
};

const switchType = (t) => {
  type.value            = t;
  selectedService.value = null;
  selectedVaccine.value = null;
  selectedExams.value   = [];
  examSearch.value      = "";
  if (t === "consulta") loadConsultations();
  else if (t === "vacina") loadVaccines();
  else if (t === "exame") loadLabExams();
};

/* ── Helpers ── */
const catLabel = (svc) => {
  const master = svc.category?.category?.name ?? null;
  const sub    = svc.category?.name ?? null;
  if (master && sub && master !== sub) return `${master} › ${sub}`;
  return sub ?? master ?? null;
};

const AVATAR_COLORS = [
  ["#4299e1","#3182ce"], ["#48bb78","#38a169"], ["#ed8936","#dd6b20"],
  ["#9f7aea","#805ad5"], ["#f687b3","#d53f8c"], ["#38b2ac","#2c7a7b"],
];
const avatarStyle = (name) => {
  const idx = (name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
  const [a, b] = AVATAR_COLORS[idx];
  return { background: `linear-gradient(135deg, ${a}, ${b})` };
};

const initials = (name) =>
  name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() ?? "?";

const fmt = (val) =>
  new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(val) || 0);

/* ── Submit ── */
const onSubmit = async () => {
  if (!selectedCustomer.value) return;
  loading.value = true;
  let administrationId = null;
  try {
    if (type.value === "exame") {
      invoiceStore.onReset();
      invoiceStore.form.customer      = selectedCustomer.value;
      invoiceStore.form.emission_date = nowISO();
      selectedExams.value.forEach((id) => {
        const svc = labServices.value.find((s) => s.id === id);
        if (svc) invoiceStore.form.invoiceItems.push({
          quantity: 1, unit_price: svc.unit_price, total: svc.unit_price,
          discount: 0, name: svc.name, description: null, id: svc.id,
        });
      });
      router.push({
        name:  "emitir-documento-form",
        query: { externalCustomerId: selectedCustomer.value.id },
      });
      return;
    }
    if (type.value === "vacina") {
      const { data: adminRes } = await api.post("administrations", {
        serviceId:  selectedVaccine.value.id,
        customerId: selectedCustomer.value.id,
        userId:     user?.id,
      });
      administrationId = adminRes?.data?.id ?? null;
      invoiceStore.onReset();
      invoiceStore.form.customer      = selectedCustomer.value;
      invoiceStore.form.emission_date = nowISO();
      invoiceStore.form.invoiceItems.push(toInvoiceItem(selectedVaccine.value));
      showNotify("Vacina registada — emita a fatura", true);
    } else {
      const { data: attRes } = await api.post("attendances", {
        customerId: selectedCustomer.value.id,
        serviceId:  selectedService.value?.id ?? null,
        note:       note.value || null,
      });
      invoiceStore.onReset();
      invoiceStore.form.presetAttendanceId = attRes?.data?.id ?? null;
      invoiceStore.form.customer      = selectedCustomer.value;
      invoiceStore.form.emission_date = nowISO();
      if (selectedService.value) {
        invoiceStore.form.invoiceItems.push(toInvoiceItem(selectedService.value));
      }
    }
    router.push({
      name: "emitir-documento-form",
      params: type.value === "vacina" && administrationId
        ? { administrationId }
        : {},
    });
  } finally {
    loading.value = false;
  }
};

const nowISO = () =>
  new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16);

const toInvoiceItem = (svc) => ({
  quantity: 1, unit_price: svc.unit_price, total: svc.unit_price,
  discount: 0, name: svc.name, description: null, id: svc.id,
});

onMounted(loadConsultations);
</script>

<style scoped lang="scss">
.add-page { min-height: 100%; }

/* ── Section label ── */
.section-label {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-muted);
  letter-spacing: 1.4px; text-transform: uppercase;
  margin-bottom: 10px;
}
.sl-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px; border-radius: var(--r-pill);
  background: rgba(66,153,225,0.12); color: var(--st-info-text); font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700; letter-spacing: 0; text-transform: none;
}
.sl-count--teal { background: rgba(56,178,172,0.12); color: var(--st-teal-text); }
.opt { text-transform: none; font-weight: 400; letter-spacing: 0; color: var(--text-faint); font-size: var(--fs-label); line-height: var(--lh-tight); }

/* ── Type cards ── */
.type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

.type-card {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: var(--r-panel);
  border: 2px solid var(--border); cursor: pointer; background: var(--surface-2);
  transition: all 0.18s ease;
  &:hover { border-color: #c4cad6; background: var(--surface-3); transform: translateY(-1px); }
}
.tc--consulta { border-color: var(--st-info); background: rgba(66,153,225,0.05); }
.tc--vacina   { border-color: var(--st-teal); background: rgba(56,178,172,0.05); }
.tc--exame    { border-color: var(--st-teal); background: rgba(56,178,172,0.05); }

.tc-icon-wrap {
  width: 42px; height: 42px; border-radius: var(--r-control); flex-shrink: 0;
  background: var(--border); color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.18s;
}
.tci--consulta { background: rgba(66,153,225,0.14); color: var(--chip-info); }
.tci--vacina   { background: rgba(56,178,172,0.14); color: var(--st-teal-text); }
.tci--exame    { background: rgba(56,178,172,0.14); color: var(--st-teal-text); }

.tc-body  { flex: 1; }
.tc-title { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text); }
.tc-sub   { font-size: var(--fs-label); color: var(--text-muted); margin-top: 2px; line-height: 1.3; }

.tc-radio {
  width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
  border: 2px solid var(--border-strong); background: transparent;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.18s;
}
.tr--consulta { border-color: var(--st-info); background: rgba(66,153,225,0.1); }
.tr--vacina   { border-color: var(--st-teal); background: rgba(56,178,172,0.1); }
.tr--exame    { border-color: var(--st-teal); background: rgba(56,178,172,0.1); }
.tc-radio-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: currentColor;
  .tr--consulta & { background: #4299e1; }
  .tr--vacina &   { background: #38b2ac; }
  .tr--exame &    { background: #38b2ac; }
}

/* ── Patient search ── */
.ps-wrap { position: relative; }

.ps-trigger {
  display: flex; align-items: center; gap: 10px;
  background: var(--surface-3); border: 1.5px solid var(--border-strong); border-radius: var(--r-control);
  padding: 0 14px; min-height: 50px; cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  &:hover { border-color: var(--border-strong); }
  &.pst--open {
    border-color: var(--st-info); background: var(--surface);
    border-bottom-left-radius: 0; border-bottom-right-radius: 0;
  }
  &.pst--filled { background: var(--surface); }
}

.ps-icon-left { display: flex; align-items: center; flex-shrink: 0; }

.ps-content {
  flex: 1; display: flex; align-items: center; gap: 8px;
  overflow: hidden; min-height: 50px;
}
.ps-selected-name  { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ps-selected-phone { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); white-space: nowrap; }
.ps-input {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: var(--fs-body); line-height: var(--lh-body); color: var(--text); font-family: inherit; min-width: 0;
  &::placeholder { color: var(--text-muted); }
}
.ps-actions { display: flex; align-items: center; flex-shrink: 0; }

.ps-dropdown {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 200;
  background: var(--surface);
  border: 1.5px solid var(--st-info); border-top: none;
  border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;
  max-height: 240px; overflow-y: auto;
}

.ps-empty, .ps-hint {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; padding: 20px; color: var(--text-muted); font-size: var(--fs-label); line-height: var(--lh-tight); text-align: center;
}

.ps-item {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 16px; cursor: pointer;
  transition: background 0.1s;
  &:hover { background: var(--st-info-tint); }
  &.psi--active { background: rgba(66,153,225,0.06); }
  & + & { border-top: 1px solid var(--border); }
}
.psi-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  color: #fff; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.psi-info { flex: 1; min-width: 0; }
.psi-name { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 600; color: var(--text); }
.psi-meta {
  display: flex; align-items: center; gap: 3px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); margin-top: 1px;
}
.psi-check { flex-shrink: 0; }

/* dropdown transition */
.ps-drop-enter-active { animation: dropDown 0.15s ease; }
.ps-drop-leave-active { animation: dropDown 0.1s ease reverse; }
@keyframes dropDown {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Patient banner ── */
.patient-banner {
  display: flex; align-items: center; gap: 12px;
  background: linear-gradient(135deg, rgba(66,153,225,0.06), rgba(56,178,172,0.04));
  border: 1.5px solid rgba(66,153,225,0.2); border-radius: var(--r-control); padding: 12px 16px;
}
.pb-avatar {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  color: #fff; font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.pb-info  { flex: 1; min-width: 0; }
.pb-name  { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text); }
.pb-meta  { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); display: flex; align-items: center; gap: 4px; margin-top: 2px; }

/* banner transition */
.fade-slide-enter-active { transition: all 0.2s ease; }
.fade-slide-leave-active { transition: all 0.15s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-6px); }

/* ── Service list ── */
.svc-skeleton { display: flex; flex-direction: column; gap: 8px; }
.svc-skel-item { border-radius: var(--r-sm); overflow: hidden; }
.svc-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 24px; color: var(--text-muted); font-size: var(--fs-body); line-height: var(--lh-body); text-align: center;
  border: 1.5px dashed var(--border-strong); border-radius: var(--r-control);
}

.svc-list { display: flex; flex-direction: column; gap: 6px; }

.svc-row {
  position: relative; display: flex; align-items: center; gap: 12px;
  padding: 14px 14px; border-radius: var(--r-control); overflow: hidden;
  border: 1.5px solid var(--border); cursor: pointer; background: var(--surface-2);
  transition: all 0.15s ease;
  &:hover { border-color: #93c5fd; background: rgba(66,153,225,0.03); transform: translateX(2px); }
  &.svr--selected { border-color: var(--st-info); background: rgba(66,153,225,0.07); }
  &.svc-row--teal:hover { border-color: #5eead4; background: rgba(56,178,172,0.03); }
  &.svr--sel-teal { border-color: var(--st-teal) !important; background: rgba(56,178,172,0.07) !important; }
}

.svr-mark {
  position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: transparent; transition: background 0.15s;
  &.mark--on { background: #4299e1; }
  .svc-row--teal &.mark--on { background: #38b2ac; }
}
.svr-mark--teal.mark--on { background: #38b2ac !important; }

.svr-icon {
  width: 36px; height: 36px; border-radius: var(--r-sm); flex-shrink: 0;
  background: var(--surface-3); color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  &.svri--on { background: rgba(66,153,225,0.14); color: var(--chip-info); }
  &.svr-icon--teal { }
  &.svri--teal { background: rgba(56,178,172,0.14) !important; color: var(--st-teal-text) !important; }
}

.svr-body { flex: 1; min-width: 0; }
.svr-name { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 600; color: var(--text); }

.svr-cat-row {
  display: flex; align-items: center; gap: 6px; margin-top: 3px; flex-wrap: wrap;
}
.svr-cat-badge {
  display: inline-block; padding: 1px 7px; border-radius: var(--r-pill); font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600; background: rgba(66,153,225,0.1); color: var(--st-info-text);
  letter-spacing: 0.3px; white-space: nowrap;
  &.svr-cat-badge--teal { background: rgba(56,178,172,0.1); color: var(--st-teal-text); }
}
.svr-desc { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); }

.svr-right {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
  text-align: right;
}
.svr-price {
  font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--st-info-text);
  span { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-muted); margin-left: 2px; }
  &.svr-price--teal { color: var(--st-teal-text); }
}
.svr-free { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); }
.svr-tick { color: var(--st-info-text); &.svr-tick--teal { color: var(--st-teal-text); } }

/* ── Exam search ── */
.exam-search {
  display: flex; align-items: center; gap: 8px;
  background: var(--surface-3); border: 1.5px solid var(--border-strong); border-radius: var(--r-sm);
  padding: 0 10px; min-height: 40px;
  transition: border-color 0.15s;
  &:focus-within {
    border-color: var(--st-teal);
    background: var(--surface);
  }
}
.exam-search-icon { flex-shrink: 0; }
.exam-search-input {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: var(--fs-body); line-height: var(--lh-body); color: var(--text); font-family: inherit;
  &::placeholder { color: var(--text-muted); }
}

/* ── Note textarea ── */
.note-area {
  width: 100%; box-sizing: border-box; resize: vertical; min-height: 80px;
  border: 1.5px solid var(--border-strong); border-radius: var(--r-sm);
  padding: 10px 12px; font-size: var(--fs-body); color: var(--text);
  font-family: inherit; line-height: 1.6; outline: none; background: var(--surface-2);
  &::placeholder { color: var(--text-muted); }
  &:focus { border-color: var(--st-info); background: var(--surface);  }
}

/* ── Actions ── */
.form-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
.submit-btn   { border-radius: var(--r-sm); font-weight: 600; min-width: 190px; }
</style>
