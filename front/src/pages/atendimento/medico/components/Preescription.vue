<template>
  <div class="prx-wrap">
    <!-- Header -->
    <div class="prx-header">
      <div class="prx-tabs">
        <button
          class="prx-tab"
          :class="{ 'prx-tab--active': tab === 'pharma' }"
          @click="tab = 'pharma'"
        >
          <q-icon name="las la-pills" size="14px" />
          Farmácia
          <span v-if="form.items.length" class="prx-badge">{{
            form.items.length
          }}</span>
        </button>
        <button
          class="prx-tab"
          :class="{ 'prx-tab--active': tab === 'ambulatory' }"
          @click="tab = 'ambulatory'"
        >
          <q-icon name="las la-stethoscope" size="14px" />
          Ambulatório
          <span v-if="formAmbulatory.items.length" class="prx-badge">{{
            formAmbulatory.items.length
          }}</span>
        </button>
        <button
          class="prx-tab prx-tab--teal"
          :class="{ 'prx-tab--active-teal': tab === 'vaccines' }"
          @click="tab = 'vaccines'"
        >
          <q-icon name="las la-syringe" size="14px" />
          Vacinas
          <span v-if="vaccineItems.length" class="prx-badge prx-badge--teal">{{
            vaccineItems.length
          }}</span>
        </button>
      </div>
      <q-btn
        unelevated
        no-caps
        icon="las la-check-circle"
        label="Concluir prescrição"
        color="primary"
        style="border-radius: var(--r-sm); font-size: var(--fs-label)"
        :loading="saving"
        @click="onSubmit"
      />
    </div>

    <!-- Search (pharma only) -->
    <div v-if="tab === 'pharma'" class="prx-search-wrap">
      <q-icon name="las la-search" size="15px" color="grey-5" />
      <input
        v-model="searchText"
        class="prx-search-input"
        placeholder="Pesquisar medicamento ou produto…"
        @input="onSearchInput"
        @blur="hideDropdown"
        @focus="searchText && onSearchInput()"
      />
      <q-spinner-dots v-if="searching" color="grey-4" size="16px" />

      <div v-if="searchResults.length" class="prx-dropdown">
        <div
          v-for="item in searchResults"
          :key="item.id"
          class="prx-dropdown-item"
          @mousedown.prevent="addItem(item)"
        >
          <div class="pdi-icon"><q-icon name="las la-pills" size="13px" /></div>
          <div class="pdi-info">
            <div class="pdi-name">{{ item.name }}</div>
            <div v-if="item.category" class="pdi-cat">
              {{ item.category?.name }}
            </div>
          </div>
          <div v-if="item.unit_price" class="pdi-price">
            {{ fmtCurrency(item.unit_price) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Ambulatory picker -->
    <div v-if="tab === 'ambulatory'" class="amb-picker">
      <div
        v-if="!allInjetaveis.length"
        class="prx-empty"
        style="padding: 24px 0"
      >
        <q-spinner-dots color="teal" size="22px" />
      </div>
      <template v-else>
        <div
          v-for="group in injetaveisGroups"
          :key="group.label"
          class="amb-group"
        >
          <div class="amb-group-label">
            <span
              class="amb-clf-badge"
              :class="`amb-clf--${group.label.toLowerCase()}`"
              >{{ group.label }}</span
            >
            <span class="amb-group-price"
              >{{ fmtCurrency(group.price) }} / sessão</span
            >
          </div>
          <div class="amb-chips">
            <button
              v-for="svc in group.items"
              :key="svc.id"
              class="amb-chip"
              :class="{
                'amb-chip--on': formAmbulatory.items.some(
                  (i) => i.id === svc.id,
                ),
              }"
              @click="toggleAmbItem(svc)"
            >
              <q-icon
                :name="
                  formAmbulatory.items.some((i) => i.id === svc.id)
                    ? 'las la-check-circle'
                    : 'lar la-circle'
                "
                size="13px"
              />
              {{ svc.name }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Vaccines picker -->
    <div v-if="tab === 'vaccines'" class="prx-body">
      <div v-if="loadingVaccines" class="prx-empty">
        <q-spinner-dots color="teal" size="24px" />
      </div>
      <div v-else-if="!availableVaccines.length" class="prx-empty">
        <q-icon name="las la-syringe" size="36px" style="color: var(--text-disabled)" />
        <span>Nenhuma vacina disponível no catálogo</span>
      </div>
      <div v-else class="prx-vac-list">
        <div
          v-for="svc in availableVaccines"
          :key="svc.id"
          class="prx-vac-row"
          :class="{
            'prx-vac-row--on': vaccineItems.some((v) => v.id === svc.id),
          }"
          @click="toggleVaccine(svc)"
        >
          <q-icon
            :name="
              vaccineItems.some((v) => v.id === svc.id)
                ? 'las la-check-circle'
                : 'lar la-circle'
            "
            size="18px"
            :style="
              vaccineItems.some((v) => v.id === svc.id)
                ? 'color: var(--st-teal-text)'
                : 'color:var(--text-disabled)'
            "
          />
          <div class="prx-vac-icon">
            <q-icon name="las la-syringe" size="15px" />
          </div>
          <div class="prx-vac-info">
            <div class="prx-vac-name">{{ svc.name }}</div>
            <div v-if="svc.description" class="prx-vac-desc">
              {{ svc.description }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Items — Farmácia -->
    <div v-if="tab === 'pharma'" class="prx-body">
      <div v-if="!form.items.length" class="prx-empty">
        <q-icon
          name="las la-prescription-bottle-alt"
          size="40px"
          style="color: var(--text-disabled)"
        />
        <span>Nenhum medicamento adicionado</span>
        <span style="font-size: var(--fs-label); color: var(--text-faint)"
          >Pesquise e seleccione medicamentos acima</span
        >
      </div>
      <div v-else class="amb-items">
        <div class="amb-items-head amb-items-head--pharma">
          <span>Medicamento</span>
          <span>Quantidade *</span>
          <span>Dose *</span>
          <span>Frequência *</span>
          <span>Via *</span>
          <span>Duração</span>
          <span></span>
        </div>
        <div
          v-for="(item, idx) in form.items"
          :key="item.id ?? idx"
          class="amb-item-row amb-item-row--pharma"
        >
          <span class="amb-item-name">{{ item.name }}</span>
          <input
            v-model="item.qtd"
            class="pi-input"
            :class="{ 'pi-input--err': item._touched && !item.qtd }"
            placeholder="ex: 30"
            @blur="item._touched = true"
          />
          <input
            v-model="item.dose"
            class="pi-input"
            :class="{ 'pi-input--err': item._touched && !item.dose }"
            placeholder="ex: 500mg"
            @blur="item._touched = true"
          />
          <select
            v-model="item.frequency"
            class="pi-input pi-select"
            :class="{ 'pi-input--err': item._touched && !item.frequency }"
            @blur="item._touched = true"
          >
            <option value="" disabled>Seleccionar…</option>
            <option v-for="f in FREQUENCIES" :key="f" :value="f">{{ f }}</option>
          </select>
          <select
            v-model="item.canal"
            class="pi-input pi-select"
            :class="{ 'pi-input--err': item._touched && !item.canal }"
            @blur="item._touched = true"
          >
            <option value="" disabled>Seleccionar…</option>
            <option v-for="v in VIAS" :key="v" :value="v">{{ v }}</option>
          </select>
          <span class="amb-qty">
            {{ pharmaDuration(item) != null ? pharmaDuration(item) + " d" : "—" }}
          </span>
          <q-btn
            flat
            round
            dense
            icon="las la-times"
            size="xs"
            color="grey-4"
            @click="form.items.splice(idx, 1)"
          />
        </div>
      </div>
    </div>

    <!-- Items — Ambulatório -->
    <div v-if="tab === 'ambulatory'" class="prx-body">
      <div v-if="!formAmbulatory.items.length" class="prx-empty">
        <q-icon name="las la-syringe" size="40px" style="color: var(--text-disabled)" />
        <span>Nenhum injetável selecionado</span>
        <span style="font-size: var(--fs-label); color: var(--text-faint)"
          >Seleccione os injetáveis no painel acima</span
        >
      </div>
      <div v-else class="amb-items">
        <div class="amb-items-head">
          <span>Injetável</span>
          <span>Classificação</span>
          <span>Dias *</span>
          <span>Frequência *</span>
          <span>Qtd</span>
          <span></span>
        </div>
        <div
          v-for="(item, idx) in formAmbulatory.items"
          :key="item.id ?? idx"
          class="amb-item-row"
        >
          <span class="amb-item-name">{{ item.name }}</span>
          <span>
            <span
              class="amb-clf-badge"
              :class="`amb-clf--${(item.classificacao ?? '').toLowerCase()}`"
            >
              {{ item.classificacao ?? "—" }}
            </span>
          </span>
          <input
            v-model.number="item.duration"
            type="number"
            min="1"
            class="pi-input"
            :class="{ 'pi-input--err': item._touched && !item.duration }"
            placeholder="ex: 5"
            @blur="item._touched = true"
          />
          <select
            v-model="item.frequency"
            class="pi-input pi-select"
            :class="{ 'pi-input--err': item._touched && !item.frequency }"
            @blur="item._touched = true"
          >
            <option value="" disabled>Seleccionar…</option>
            <option v-for="f in FREQUENCIES" :key="f" :value="f">
              {{ f }}
            </option>
          </select>
          <span class="amb-qty">
            {{
              item.duration && item.frequency
                ? freqToDaily(item.frequency) * item.duration
                : "—"
            }}
          </span>
          <q-btn
            flat
            round
            dense
            icon="las la-times"
            size="xs"
            color="grey-4"
            @click="toggleAmbItem(item)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { SessionStorage } from "quasar";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { api } from "src/boot/axios";
import { showNotify } from "src/utils/notify";

const route = useRoute();
const user = SessionStorage.getItem("alfavida_user");
const emits = defineEmits(["finish"]);

const tab = ref("pharma");
watch(tab, () => {
  searchText.value = "";
  searchResults.value = [];
});
const saving = ref(false);
const searching = ref(false);
const searchText = ref("");
const searchResults = ref([]);
const availableVaccines = ref([]);
const loadingVaccines = ref(false);
const vaccineItems = ref([]);
const allInjetaveis = ref([]);
let customerId = null;
let _searchTimer = null;

const FREQUENCIES = [
  "1x/dia",
  "2x/dia",
  "3x/dia",
  "4x/dia",
  "6/6h",
  "8/8h",
  "12/12h",
  "24/24h",
  "Em SOS",
  "Dose única",
];
const VIAS = [
  "Oral",
  "Sublingual",
  "Intravenoso (IV)",
  "Intramuscular (IM)",
  "Subcutâneo (SC)",
  "Tópico",
  "Inalatório",
  "Ocular",
  "Auricular",
  "Retal",
  "Vaginal",
];

const form = reactive({
  userId: user?.id,
  consultationId: route.params.consultationId,
  type: "PHARMACY",
  items: [],
});
const formAmbulatory = reactive({
  userId: user?.id,
  consultationId: route.params.consultationId,
  type: "AMBULATORY",
  items: [],
});

const onSearchInput = () => {
  clearTimeout(_searchTimer);
  const q = searchText.value.trim();
  if (!q) {
    searchResults.value = [];
    return;
  }

  _searchTimer = setTimeout(async () => {
    searching.value = true;
    try {
      const { data } = await api.get("services/filter/find", {
        params: { search: q, perPage: 20, page: 1 },
      });
      searchResults.value = data.data ?? [];
    } catch (_) {
    } finally {
      searching.value = false;
    }
  }, 280);
};

const hideDropdown = () =>
  setTimeout(() => {
    searchResults.value = [];
  }, 150);

const addItem = (item) => {
  if (form.items.some((i) => i.id === item.id)) {
    showNotify("Já adicionado à lista", false);
    return;
  }
  form.items.push({
    ...item,
    qtd: "",
    dose: "",
    frequency: "",
    canal: "",
    duration: null,
    _touched: false,
  });
  searchText.value = "";
  searchResults.value = [];
};

const toggleVaccine = (svc) => {
  const idx = vaccineItems.value.findIndex((v) => v.id === svc.id);
  if (idx >= 0) vaccineItems.value.splice(idx, 1);
  else vaccineItems.value.push(svc);
};

const injetaveisGroups = computed(() => {
  const order = ["Alfa", "Beta", "Gama"];
  const map = {};
  for (const svc of allInjetaveis.value) {
    const clf = svc.classificacao ?? "Outro";
    if (!map[clf]) map[clf] = { label: clf, price: svc.unit_price, items: [] };
    map[clf].items.push(svc);
  }
  return order.filter((k) => map[k]).map((k) => map[k]);
});

const toggleAmbItem = (svc) => {
  const idx = formAmbulatory.items.findIndex((i) => i.id === svc.id);
  if (idx >= 0) formAmbulatory.items.splice(idx, 1);
  else
    formAmbulatory.items.push({
      ...svc,
      duration: null,
      frequency: "",
      _touched: false,
    });
};

const freqToDaily = (freq) => {
  if (!freq) return 1;
  const xMatch = freq.match(/^(\d+)x\/dia$/i);
  if (xMatch) return Number(xMatch[1]);
  const hMatch = freq.match(/^(\d+)\/(\d+)h$/i);
  if (hMatch) return Math.round(24 / Number(hMatch[2]));
  return 1; // "Em SOS", "Dose única", etc.
};

// Farmácia: a duração (dias) deriva da quantidade e da frequência.
// dias = quantidade / doses por dia. "Dose única" = 1 dia; "Em SOS" não define.
const pharmaDuration = (item) => {
  const q = Number(item?.qtd);
  if (!q || q <= 0 || !item?.frequency) return null;
  if (/única/i.test(item.frequency)) return 1;
  if (/sos/i.test(item.frequency)) return null;
  const daily = freqToDaily(item.frequency);
  return daily ? Math.max(1, Math.round(q / daily)) : null;
};

const fmtCurrency = (val) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "AOA" }).format(
    val ?? 0,
  );

const onSubmit = async () => {
  [...form.items, ...formAmbulatory.items].forEach((i) => {
    i._touched = true;
  });

  const pharmInvalid = form.items.some(
    (i) => !i.qtd || !i.dose || !i.frequency || !i.canal,
  );
  const ambInvalid = formAmbulatory.items.some(
    (i) => !i.duration || !i.frequency,
  );
  if (pharmInvalid || ambInvalid) {
    showNotify("Preenche todos os campos obrigatórios (*)", false);
    return;
  }

  saving.value = true;
  try {
    if (form.items.length) {
      await api.post("prescriptions", {
        userId: user?.id,
        consultationId: route.params.consultationId,
        type: "PHARMACY",
        items: form.items.map((item) => ({
          serviceId: item.id,
          quantity: item.qtd,
          canal: item.canal,
          duration: pharmaDuration(item) ?? 0,
          dose: item.dose,
          frequency: item.frequency,
        })),
      });
    }

    if (formAmbulatory.items.length) {
      await api.post("prescriptions", {
        userId: user?.id,
        consultationId: route.params.consultationId,
        type: "AMBULATORY",
        items: formAmbulatory.items.map((item) => ({
          serviceId: item.id,
          quantity: String(freqToDaily(item.frequency) * (item.duration ?? 1)),
          canal: "Intramuscular (IM)",
          duration: item.duration ?? 0,
          dose: "—",
          frequency: item.frequency,
        })),
      });
    }

    if (vaccineItems.value.length) {
      await Promise.all(
        vaccineItems.value.map((svc) =>
          api.post("administrations", {
            serviceId: svc.id,
            customerId: customerId ?? undefined,
            userId: user?.id,
          }),
        ),
      );
    }

    showNotify("Prescrição guardada com sucesso", true);
    emits("finish");
  } catch (_) {
    showNotify("Erro ao guardar prescrição", false);
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  loadingVaccines.value = true;
  try {
    const [consultRes, vaccinesRes, injetaveisRes] = await Promise.all([
      api.get("consultations/" + route.params.consultationId),
      api.get("services/vaccines/list"),
      api.get("services/injetaveis/list"),
    ]);
    allInjetaveis.value = injetaveisRes.data?.data ?? [];
    availableVaccines.value = vaccinesRes.data?.data ?? [];
    const consultation = consultRes.data?.data;
    customerId = consultation?.screening?.customer?.id ?? null;
    (consultation?.prescriptions ?? []).forEach((p) => {
      const target = p.type === "PHARMACY" ? form.items : formAmbulatory.items;
      target.splice(
        0,
        target.length,
        ...p.items.map((el) => ({
          name: el.service.name,
          id: el.service.id,
          classificacao: el.service.classificacao ?? null,
          qtd: el.quantity,
          dose: el.dose,
          frequency: el.frequency,
          canal: el.canal,
          duration: el.duration,
          _touched: false,
        })),
      );
    });
  } catch (_) {
    availableVaccines.value = [];
  } finally {
    loadingVaccines.value = false;
  }
});
</script>

<style scoped lang="scss">
.prx-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
}

// ── Header ──
.prx-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--surface-2);
  flex-shrink: 0;
}
.prx-tabs {
  display: flex;
  gap: 4px;
}
.prx-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--r-sm);
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600;
  color: var(--text-muted);
  background: transparent;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all 0.12s;
  &:hover {
    background: var(--border);
    color: var(--text-2);
  }
  &--active {
    background: rgba(66, 153, 225, 0.08);
    color: var(--chip-info);
    border-color: rgba(66, 153, 225, 0.25);
  }
  &--teal:hover {
    background: rgba(13, 148, 136, 0.05);
  }
  &--active-teal {
    background: rgba(13, 148, 136, 0.08) !important;
    color: var(--st-teal-text) !important;
    border-color: rgba(13, 148, 136, 0.25) !important;
  }
}
.prx-badge {
  background: #4299e1;
  color: #fff;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  border-radius: var(--r-sm);
  padding: 1px 6px;
  min-width: 18px;
  text-align: center;
  &--teal {
    background: var(--st-teal);
  }
}

// ── Search ──
.prx-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--border-soft);
  flex-shrink: 0;
  background: var(--surface);
}
.prx-search-input {
  flex: 1;
  border: 1.5px solid var(--border-strong);
  border-radius: var(--r-sm);
  padding: 8px 12px;
  font-size: var(--fs-body); line-height: var(--lh-body);
  color: var(--text-2);
  font-family: inherit;
  outline: none;
  transition: border-color 0.12s;
  &::placeholder {
    color: var(--text-disabled);
  }
  &:focus {
    border-color: var(--st-info);
  }
}
.prx-dropdown {
  position: absolute;
  top: calc(100% - 10px);
  left: 48px;
  right: 20px;
  background: var(--surface);
  border: 1.5px solid var(--border-strong);
  border-radius: var(--r-sm);
  z-index: 100;
  overflow: hidden;
  max-height: 260px;
  overflow-y: auto;
}
.prx-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  cursor: pointer;
  border-bottom: 1px solid var(--surface-3);
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: var(--surface-3);
  }
}
.pdi-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--r-sm);
  flex-shrink: 0;
  background: rgba(159, 122, 234, 0.14);
  color: var(--st-purple-text);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pdi-info {
  flex: 1;
  min-width: 0;
}
.pdi-name {
  font-size: var(--fs-body); line-height: var(--lh-body);
  font-weight: 600;
  color: var(--text-2);
}
.pdi-cat {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  color: var(--text-faint);
  margin-top: 1px;
}
.pdi-price {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600;
  color: var(--st-ok-text);
  flex-shrink: 0;
}

// ── Body ──
.prx-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}
.prx-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 60px 0;
  color: var(--text-faint);
  font-size: var(--fs-body); line-height: var(--lh-body);
  text-align: center;
}

// ── Campos das linhas (partilhados farmácia + ambulatório) ──
.pi-input {
  border: 1.5px solid var(--border-strong);
  border-radius: var(--r-sm);
  padding: 6px 8px;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  color: var(--text-2);
  font-family: inherit;
  outline: none;
  width: 100%;
  background: var(--surface);
  transition: border-color 0.12s;
  &::placeholder {
    color: var(--text-disabled);
  }
  &:focus {
    border-color: var(--st-info);
  }
  &--err {
    border-color: var(--danger) !important;
    background: rgba(229, 62, 62, 0.07) !important;
  }
}
.pi-select {
  cursor: pointer;
  appearance: auto;
  color: var(--text-2);
  option { background: var(--surface); color: var(--text-2); }
  option:disabled { color: var(--text-disabled); }
}

// ── Ambulatory picker ──
.amb-picker {
  flex-shrink: 0;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--surface-2);
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 210px;
  overflow-y: auto;
}
.amb-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.amb-group-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
}
.amb-group-price {
  color: var(--text-muted);
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 500;
}
.amb-clf-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--r-sm);
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  letter-spacing: 0.4px;
  color: #fff;
}
.amb-clf--alfa {
  background: #38a169;
}
.amb-clf--beta {
  background: #d97706;
}
.amb-clf--gama {
  background: var(--st-danger);
}
.amb-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.amb-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: var(--r-pill);
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 500;
  background: var(--surface);
  border: 1.5px solid var(--border-strong);
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.12s;
  &:hover {
    border-color: #94a3b8;
    background: var(--surface-3);
  }
  &--on {
    border-color: var(--st-teal);
    background: rgba(13, 148, 136, 0.08);
    color: var(--st-teal-text);
    font-weight: 600;
  }
}

// ── Ambulatory items table ──
.amb-items {
  display: flex;
  flex-direction: column;
}
.amb-items-head {
  display: grid;
  grid-template-columns: 1fr 100px 90px 160px 50px 36px;
  gap: 8px;
  padding: 12px 12px;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--surface-2);
  border-radius: var(--r-sm) 8px 0 0;
  border: 1.5px solid var(--border);
  border-bottom: none;
}
.amb-item-row {
  display: grid;
  grid-template-columns: 1fr 100px 90px 160px 50px 36px;
  gap: 8px;
  padding: 12px 12px;
  align-items: center;
  border: 1.5px solid var(--border);
  border-top: none;
  &:last-child {
    border-radius: 0 0 var(--r-sm) var(--r-sm);
  }
  &:hover {
    background: var(--surface-2);
  }
}
.amb-item-name {
  font-size: var(--fs-body);
  font-weight: 500;
  color: var(--text-2);
  min-width: 0;
  line-height: 1.3;
  word-break: break-word;
}

/* Farmácia usa a mesma tabela, com colunas próprias (7) */
.amb-items-head--pharma,
.amb-item-row--pharma {
  grid-template-columns: 1fr 88px 100px 150px 150px 84px 34px;
}
.amb-qty {
  font-size: var(--fs-body); line-height: var(--lh-body);
  font-weight: 700;
  color: var(--chip-info);
  text-align: center;
}

// ── Vaccines ──
.prx-vac-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.prx-vac-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--border-strong);
  cursor: pointer;
  background: var(--surface-2);
  transition: all 0.15s;
  &:hover {
    border-color: #5eead4;
    background: rgba(13, 148, 136, 0.02);
  }
  &--on {
    border-color: var(--st-teal);
    background: rgba(13, 148, 136, 0.05);
  }
}
.prx-vac-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--r-sm);
  flex-shrink: 0;
  background: rgba(13, 148, 136, 0.12);
  color: var(--st-teal-text);
  display: flex;
  align-items: center;
  justify-content: center;
  .prx-vac-row--on & {
    background: rgba(13, 148, 136, 0.14);
  }
}
.prx-vac-info {
  flex: 1;
  min-width: 0;
}
.prx-vac-name {
  font-size: var(--fs-body); line-height: var(--lh-body);
  font-weight: 600;
  color: var(--text);
}
.prx-vac-desc {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  color: var(--text-muted);
  margin-top: 2px;
}
</style>
