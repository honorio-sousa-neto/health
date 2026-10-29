<template>
  <div class="os-wrap">

    <!-- Done state -->
    <div v-if="submitted" class="os-done">
      <q-icon name="las la-check-circle" size="22px" style="color:#32b989" />
      <div>
        <div class="os-done-title">Observação solicitada</div>
        <div class="os-done-sub">{{ submittedName }}</div>
      </div>
    </div>

    <!-- Form -->
    <div v-else class="os-form">

      <!-- Observation type -->
      <div class="os-field-label">Tipo de observação</div>
      <div v-if="loading" class="os-loading">
        <q-spinner-dots color="orange" size="18px" />
      </div>
      <div v-else class="os-options">
        <div
          v-for="opt in options" :key="opt.id"
          class="os-option" :class="model === opt.id && 'os-option--selected'"
          @click="model = opt.id"
        >
          <div class="os-opt-dot" :class="model === opt.id && 'os-opt-dot--on'" />
          <div>
            <div class="os-opt-name">{{ opt.name }}</div>
            <div v-if="opt.description" class="os-opt-desc">{{ opt.description }}</div>
          </div>
        </div>
      </div>

      <template v-if="model">

        <!-- Optional lab exams -->
        <div class="os-field-label" style="margin-top:14px">Exames de laboratório <span class="os-optional">(opcional)</span></div>
        <div v-if="loadingExams" class="os-loading"><q-spinner-dots color="orange" size="14px" /></div>
        <div v-else class="os-exam-groups">
          <div v-for="section in examSections" :key="section.name" class="os-exam-group">
            <div class="os-exam-group-name">{{ section.name }}</div>
            <div class="os-exam-chips">
              <span
                v-for="svc in section.Service" :key="svc.id"
                class="os-exam-chip" :class="exams.includes(svc.id) && 'os-exam-chip--on'"
                @click="toggleExam(svc.id)"
              >
                <q-icon :name="exams.includes(svc.id) ? 'las la-check-circle' : 'las la-circle'" size="11px" />
                {{ svc.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- Soro e medicação -->
        <div class="os-serum-section">
          <div class="oss-header-row">
            <div class="oss-header">
              <q-icon name="las la-syringe" size="14px" />
              Soro e medicação
              <span class="os-optional">(opcional)</span>
            </div>
            <q-btn flat no-caps dense icon="las la-plus" label="Adicionar" color="teal-8"
              style="font-size:var(--fs-label)" @click="showAddSerum = !showAddSerum" />
          </div>

          <!-- Add form -->
          <div v-if="showAddSerum" class="os-add-serum">
            <q-select
              v-model="newSerum.productId"
              class="os-product-select"
              :options="filteredPharmacyProducts"
              option-label="name"
              option-value="id"
              emit-value
              map-options
              use-input
              input-debounce="200"
              borderless
              dense
              clearable
              :loading="loadingPharmacyProducts"
              :disable="loadingPharmacyProducts"
              label="Artigo da farmácia"
              @filter="filterPharmacyProducts"
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label v-if="scope.opt.unit_price != null" caption>
                      {{ formatPrice(scope.opt.unit_price) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey-6 text-caption">
                    Nenhum artigo encontrado
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <div class="os-add-row">
              <input v-model="newSerum.dose" class="os-input" placeholder="Dose (ex: 500ml, 1g)" />
              <select v-model="newSerum.via" class="os-select">
                <option value="EV">EV – Endovenoso</option>
                <option value="IM">IM – Intramuscular</option>
                <option value="SC">SC – Subcutâneo</option>
                <option value="VO">VO – Oral</option>
                <option value="SL">SL – Sublingual</option>
              </select>
            </div>
            <div class="os-add-actions">
              <q-btn unelevated no-caps label="Confirmar" color="teal-8" size="sm"
                style="border-radius:var(--r-sm)" :disable="!newSerum.productId" @click="confirmAddSerum" />
              <q-btn flat no-caps label="Cancelar" size="sm" @click="showAddSerum = false" />
            </div>
          </div>

          <!-- Serum list -->
          <div v-if="serums.length" class="os-serum-list">
            <div v-for="(s, i) in serums" :key="i" class="os-serum-item">
              <div class="osi-icon"><q-icon name="las la-syringe" size="14px" style="color:#319795" /></div>
              <div class="osi-info">
                <span class="osi-name">{{ s.nome }}</span>
                <span class="osi-meta">{{ s.dose }}&nbsp;·&nbsp;{{ s.via }}</span>
              </div>
              <q-btn flat round dense icon="las la-times" size="xs" color="grey-5" @click="serums.splice(i, 1)" />
            </div>
          </div>
          <div v-else-if="!showAddSerum" class="os-serum-empty">
            Nenhum soro ou medicação indicado
          </div>
        </div>

      </template>

      <q-btn
        unelevated no-caps
        icon="las la-save"
        label="Solicitar observação"
        color="orange-8"
        :disable="!model"
        :loading="saving"
        style="border-radius:var(--r-sm); font-size:var(--fs-label); margin-top:16px"
        @click="onSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { api } from "src/boot/axios";
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { showNotify } from "src/utils/notify";

const props = defineProps({
  initialServiceId: { type: String, default: "" },
  customerId: { type: String, default: "" },
});
const emit = defineEmits(["submitted"]);

const route   = useRoute();
const model   = ref("");
const exams   = ref([]);
const saving  = ref(false);
const loading = ref(false);
const loadingExams  = ref(false);
const submitted     = ref(!!props.initialServiceId);
const submittedName = ref("");

const serums       = ref([]);
const showAddSerum = ref(false);
const newSerum     = reactive({ productId: null, nome: "", dose: "", via: "EV" });

const options      = reactive([]);
const examSections = reactive([]);
const pharmacyProducts = ref([]);
const filteredPharmacyProducts = ref([]);
const loadingPharmacyProducts = ref(false);

const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const formatPrice = (value) =>
  new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2 }).format(Number(value)) + " Kz";

const toggleExam = (id) => {
  const idx = exams.value.indexOf(id);
  if (idx >= 0) exams.value.splice(idx, 1);
  else exams.value.push(id);
};

const confirmAddSerum = () => {
  const selectedProduct = pharmacyProducts.value.find((item) => item.id === newSerum.productId);
  if (!selectedProduct) return;

  serums.value.push({
    productId: selectedProduct.id,
    nome: selectedProduct.name,
    dose: newSerum.dose,
    via: newSerum.via,
  });
  Object.assign(newSerum, { productId: null, nome: "", dose: "", via: "EV" });
  showAddSerum.value = false;
};

const fetchOptions = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("services/observation/list");
    const all = data.data ?? [];
    options.splice(0, options.length, ...all);
    if (props.initialServiceId) {
      const match = all.find((s) => s.id === props.initialServiceId);
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

const filterPharmacyProducts = (val, update) => {
  update(() => {
    const needle = normalizeText(val);
    filteredPharmacyProducts.value = needle
      ? pharmacyProducts.value.filter((item) => normalizeText(item.name).includes(needle))
      : pharmacyProducts.value;
  });
};

const fetchPharmacyProducts = async () => {
  loadingPharmacyProducts.value = true;
  try {
    const { data: productsRes } = await api.get("products/pharmacy/articles");
    const products = productsRes.data ?? [];
    pharmacyProducts.value = products;
    filteredPharmacyProducts.value = products;
  } catch (_) {
    pharmacyProducts.value = [];
    filteredPharmacyProducts.value = [];
  } finally {
    loadingPharmacyProducts.value = false;
  }
};

const onSubmit = async () => {
  if (!model.value) return;
  saving.value = true;
  try {
    await api.post("observations", {
      consultationId: route.params.consultationId,
      serviceId: model.value,
      exams: exams.value,
      serum: serums.value.length ? serums.value : undefined,
    });
    submittedName.value = options.find((o) => o.id === model.value)?.name ?? "";
    submitted.value = true;
    emit("submitted");
    showNotify("Observação solicitada", true);
  } catch (_) {
    showNotify("Erro ao solicitar observação", false);
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await Promise.all([fetchOptions(), fetchExams(), fetchPharmacyProducts()]);
});
</script>

<style scoped lang="scss">
.os-wrap { display: flex; flex-direction: column; }

.os-done {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; background: rgba(50,185,137,0.08);
  border: 1px solid rgba(50,185,137,0.25); border-radius: var(--r-sm);
}
.os-done-title { font-size: var(--fs-body); font-weight: 700; color: var(--chip-ok); }
.os-done-sub   { font-size: var(--fs-label); color: #48bb78; margin-top: 1px; }

.os-form { display: flex; flex-direction: column; }
.os-loading { display: flex; justify-content: center; padding: 12px 0; }

.os-field-label {
  font-size: var(--fs-label); font-weight: 800; color: var(--st-warn);
  text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px;
}
.os-optional { font-weight: 400; color: var(--text-faint); text-transform: none; letter-spacing: 0; font-size: var(--fs-label); }

.os-options { display: flex; flex-direction: column; gap: 6px; }
.os-option {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 12px; border: 1.5px solid var(--border-strong); border-radius: var(--r-sm);
  cursor: pointer; transition: all 0.12s; background: var(--surface);
  &:hover { border-color: #ed8936; background: rgba(237,137,54,0.04); }
}
.os-option--selected { border-color: var(--st-warn); background: rgba(237,137,54,0.06); }
.os-opt-dot {
  width: 14px; height: 14px; border-radius: 50%; border: 2px solid #cbd5e0;
  flex-shrink: 0; margin-top: 2px; transition: all 0.12s;
}
.os-opt-dot--on { border-color: var(--st-warn); background: var(--st-warn); }
.os-opt-name { font-size: var(--fs-body); font-weight: 600; color: var(--text-2); }
.os-opt-desc { font-size: var(--fs-label); color: var(--text-faint); margin-top: 2px; }

.os-exam-groups { display: flex; flex-direction: column; gap: 10px; }
.os-exam-group-name { font-size: var(--fs-label); font-weight: 700; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
.os-exam-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.os-exam-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); padding: 4px 10px; border-radius: var(--r-pill);
  border: 1.5px solid var(--border-strong); color: var(--text-muted); background: var(--surface-3);
  cursor: pointer; transition: all 0.12s;
  &:hover { border-color: #ed8936; color: var(--st-warn); background: rgba(237,137,54,0.06); }
}
.os-exam-chip--on { border-color: var(--st-warn); color: var(--st-warn); background: rgba(237,137,54,0.08); font-weight: 600; }

/* ── Soro e medicação ─────────────────────────────────────── */
.os-serum-section {
  margin-top: 14px; border: 1.5px solid var(--border-strong); border-radius: var(--r-sm); overflow: hidden;
}
.oss-header-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; background: var(--surface-3); border-bottom: 1px solid var(--border);
}
.oss-header {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--fs-label); font-weight: 800; color: #319795;
  text-transform: uppercase; letter-spacing: 0.6px;
}

.os-add-serum {
  background: var(--surface-3); border-bottom: 1px solid var(--border);
  padding: 12px; display: flex; flex-direction: column; gap: 8px;
}
.os-add-row { display: flex; gap: 8px; }
.os-input {
  flex: 1; border: 1.5px solid var(--border-strong); border-radius: var(--r-sm);
  padding: 7px 10px; font-size: var(--fs-body); color: var(--text-2); font-family: inherit; outline: none;
  &::placeholder { color: var(--text-disabled); }
  &:focus { border-color: #319795; }
}
.os-product-select {
  flex: 1; min-width: 0;
}
.os-product-select :deep(.q-field__control) {
  border: 1.5px solid var(--border-strong); border-radius: var(--r-sm);
  min-height: 36px; padding: 0 10px; background: var(--surface);
  transition: border-color 0.12s;
}
.os-product-select :deep(.q-field__control:hover) {
  border-color: #cbd5e0;
}
.os-product-select.q-field--focused :deep(.q-field__control) {
  border-color: #319795;
}
.os-product-select :deep(.q-field__native),
.os-product-select :deep(.q-field__label) {
  font-size: var(--fs-body); color: var(--text-3);
}
.os-product-select :deep(.q-field__label) {
  color: var(--text-faint);
}
.os-select {
  border: 1.5px solid var(--border-strong); border-radius: var(--r-sm);
  padding: 7px 10px; font-size: var(--fs-label); color: var(--text-3);
  font-family: inherit; background: var(--surface); outline: none;
  &:focus { border-color: #319795; }
}
.os-add-actions { display: flex; gap: 8px; }

.os-serum-list { display: flex; flex-direction: column; }
.os-serum-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-bottom: 1px solid var(--border);
  &:last-child { border-bottom: none; }
}
.osi-icon { flex-shrink: 0; }
.osi-info { flex: 1; min-width: 0; }
.osi-name { display: block; font-size: var(--fs-body); font-weight: 600; color: var(--text-2); }
.osi-meta { display: block; font-size: var(--fs-label); color: var(--text-faint); margin-top: 1px; }
.os-serum-empty {
  font-size: var(--fs-label); color: var(--text-faint); text-align: center; padding: 14px;
}
</style>
