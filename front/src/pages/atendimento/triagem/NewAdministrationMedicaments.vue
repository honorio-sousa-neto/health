<template>
  <div class="na-wrap">

    <!-- Patient -->
    <div class="na-field">
      <div class="na-label">Paciente</div>
      <q-select
        v-model="form.customerId"
        :options="customerOptions"
        option-value="value"
        option-label="label"
        emit-value map-options
        use-input input-debounce="300"
        @filter="filterCustomers"
        placeholder="Pesquisar paciente…"
        borderless dense clearable
        class="na-sel"
      >
        <template #prepend>
          <q-icon name="las la-user" size="14px" color="grey-5" />
        </template>
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey text-caption">Nenhum paciente encontrado</q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>

    <!-- Type IM/IV -->
    <div class="na-field">
      <div class="na-label">Tipo de administração</div>
      <div class="na-type-grid">
        <div class="na-type-card ntc--im" :class="form.type === 'IM' ? 'selected' : ''" @click="selectType('IM')">
          <div class="ntc-code">IM</div>
          <div class="ntc-desc">Intra Muscular</div>
          <q-icon v-if="form.type === 'IM'" name="las la-check-circle" size="16px" class="ntc-check" />
        </div>
        <div class="na-type-card ntc--iv" :class="form.type === 'IV' ? 'selected' : ''" @click="selectType('IV')">
          <div class="ntc-code">IV</div>
          <div class="ntc-desc">Intra Venosa</div>
          <q-icon v-if="form.type === 'IV'" name="las la-check-circle" size="16px" class="ntc-check" />
        </div>
      </div>
    </div>

    <!-- Service cards -->
    <div v-if="form.type" class="na-field">
      <div class="na-label">Serviço — {{ form.type }}</div>
      <div v-if="filteredServices.length" class="na-svc-grid">
        <div
          v-for="svc in filteredServices" :key="svc.id"
          class="na-svc-card"
          :class="form.serviceId === svc.id ? 'nsvc--selected' : ''"
          @click="form.serviceId = svc.id"
        >
          <div class="nsvc-name">{{ svc.name }}</div>
          <div class="nsvc-price">{{ formatPrice(svc.unit_price) }} Kz</div>
          <q-icon v-if="form.serviceId === svc.id" name="las la-check-circle" size="14px" class="nsvc-check" />
        </div>
      </div>
      <div v-else class="na-empty-svc">
        <q-icon name="las la-exclamation-circle" size="16px" />
        Nenhum serviço de {{ form.type }} encontrado
      </div>
    </div>

    <!-- Third party toggle -->
    <div class="na-third-row" @click="form.isThirdParty = !form.isThirdParty">
      <div class="ntr-icon" :class="form.isThirdParty ? 'ntr-icon--on' : ''">
        <q-icon name="las la-box" size="14px" />
      </div>
      <div class="ntr-text">
        <div class="ntr-title">Fármacos de terceiros</div>
        <div class="ntr-sub">O paciente traz os seus próprios medicamentos</div>
      </div>
      <q-toggle v-model="form.isThirdParty" color="orange-7" dense @click.stop />
    </div>

    <!-- Drug selector -->
    <div v-if="!form.isThirdParty" class="na-field">
      <div class="na-label">
        Fármacos a administrar
        <span v-if="drugItems.length" class="na-label-count">{{ drugItems.length }}</span>
      </div>

      <!-- Search to add -->
      <q-select
        v-model="drugPickerVal"
        :options="drugOptions"
        option-label="label"
        use-input input-debounce="300"
        @filter="filterDrugs"
        @update:model-value="addDrug"
        placeholder="Pesquisar e adicionar fármaco…"
        borderless dense
        class="na-sel"
      >
        <template #prepend>
          <q-icon name="las la-search" size="14px" color="grey-5" />
        </template>
        <template #append>
          <q-icon name="las la-plus-circle" size="16px" color="blue-5" />
        </template>
        <template #option="scope">
          <q-item v-bind="scope.itemProps" dense>
            <q-item-section>
              <q-item-label style="font-size: var(--fs-body); font-weight:600; color:var(--text)">{{ scope.opt.label }}</q-item-label>
              <q-item-label caption style="font-size: var(--fs-label); color:var(--text-faint)">
                {{ formatPrice(scope.opt.value.amount) }} Kz
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey text-caption">Nenhum fármaco encontrado</q-item-section>
          </q-item>
        </template>
      </q-select>

      <!-- Drug list with quantity -->
      <div v-if="drugItems.length" class="na-drug-list">
        <div v-for="(item, i) in drugItems" :key="item.id" class="na-drug-row">
          <div class="ndr-info">
            <div class="ndr-name">{{ item.name }}</div>
            <div class="ndr-price">{{ formatPrice(item.amount) }} Kz / un.</div>
          </div>
          <div class="ndr-controls">
            <button class="ndr-btn" @click="changeQty(i, -1)">−</button>
            <input
              type="number"
              v-model.number="item.quantity"
              min="1"
              class="ndr-qty-input"
              @input="item.quantity = Math.max(1, item.quantity || 1)"
            />
            <button class="ndr-btn" @click="changeQty(i, 1)">+</button>
          </div>
          <button class="ndr-rm" @click="removeDrug(i)" title="Remover">
            <q-icon name="las la-times" size="13px" />
          </button>
        </div>
        <!-- Total row -->
        <div class="na-drug-total">
          <span>Total fármacos</span>
          <span class="ndt-val">{{ formatPrice(drugTotal) }} Kz</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="na-actions">
      <q-btn flat no-caps label="Cancelar" color="grey-6" @click="$emit('cancel')" />
      <q-btn
        unelevated no-caps
        label="Registar administração"
        icon="las la-check"
        color="blue-7"
        style="border-radius: var(--r-sm)"
        :disable="!form.serviceId || !form.type"
        :loading
        @click="onSubmit"
      />
    </div>

  </div>
</template>

<script setup>
import { SessionStorage } from "quasar";
import { reactive, ref, computed, onMounted } from "vue";
import { api } from "src/boot/axios";
import { showNotify } from "src/utils/notify";

const emit = defineEmits(["change", "cancel"]);

const user            = SessionStorage.getItem("alfavida_user");
const services        = ref([]);
const allCustomers    = ref([]);
const customerOptions = ref([]);
const drugOptions     = ref([]);
const drugPickerVal   = ref(null);
const drugItems       = ref([]);   // [{ id, name, amount, quantity }]
const loading         = ref(false);

const form = reactive({
  serviceId:    null,
  customerId:   null,
  type:         null,
  isThirdParty: false,
  userId:       user?.id,
});

const filteredServices = computed(() =>
  form.type ? services.value.filter((s) => s.name.toUpperCase().includes(form.type)) : []
);

const drugTotal = computed(() =>
  drugItems.value.reduce((sum, d) => sum + d.amount * (d.quantity || 1), 0)
);

const selectType = (type) => {
  form.type      = type;
  form.serviceId = null;
};

const formatPrice = (val) =>
  Number(val ?? 0).toLocaleString("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const addDrug = (opt) => {
  if (!opt) return;
  const drug = opt.value ?? opt;
  const existing = drugItems.value.find((d) => d.id === drug.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    drugItems.value.push({ id: drug.id, name: drug.name, amount: drug.amount, quantity: 1 });
  }
  drugPickerVal.value = null;
};

const changeQty = (i, delta) => {
  const item = drugItems.value[i];
  item.quantity = Math.max(1, (item.quantity || 1) + delta);
};

const removeDrug = (i) => drugItems.value.splice(i, 1);

const fetchServices = async () => {
  const { data } = await api.get("services/administration-medics/list");
  services.value = data.data ?? [];
};

const fetchCustomers = async () => {
  const { data } = await api.get("customers");
  allCustomers.value    = (data.data ?? []).map((c) => ({ label: c.name, value: c.id }));
  customerOptions.value = allCustomers.value;
};

const filterCustomers = (val, update) => {
  update(() => {
    const q = val.toLowerCase();
    customerOptions.value = q
      ? allCustomers.value.filter((c) => c.label.toLowerCase().includes(q))
      : allCustomers.value;
  });
};

const filterDrugs = async (val, update, abort) => {
  try {
    const { data } = await api.get("services/pharmacy/list", {
      params: { search: val || undefined },
    });
    update(() => {
      drugOptions.value = (data.data ?? []).map((d) => ({
        label: d.name,
        value: { id: d.id, name: d.name, amount: d.unit_price },
      }));
    });
  } catch {
    abort();
  }
};

const onSubmit = async () => {
  if (!form.serviceId || !form.type) {
    showNotify("Seleccione o tipo e o serviço de administração", false);
    return;
  }
  loading.value = true;
  try {
    const drugs = !form.isThirdParty && drugItems.value.length
      ? drugItems.value.map(({ id, name, amount, quantity }) => ({ id, name, amount, quantity }))
      : undefined;

    await api.post("administrations", {
      serviceId:    form.serviceId,
      userId:       form.userId,
      customerId:   form.customerId || undefined,
      type:         form.type,
      isThirdParty: form.isThirdParty,
      ...(drugs ? { drugs } : {}),
    });
    emit("change");
  } catch {
    showNotify("Erro ao registar", false);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchServices();
  fetchCustomers();
});
</script>

<style scoped lang="scss">
.na-wrap { display: flex; flex-direction: column; gap: 16px; }

.na-field { display: flex; flex-direction: column; gap: 6px; }
.na-label {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.6px;
}
.na-label-count {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%;
  background: #3182ce; color: #fff;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 800; letter-spacing: 0;
  text-transform: none;
}

/* ── Selects ── */
.na-sel :deep(.q-field__control) {
  background: var(--surface-3);
  border-radius: var(--r-sm);
  border: 1.5px solid transparent;
  padding: 0 12px;
  min-height: 40px;
  transition: border-color 0.18s, background 0.18s;
}
.na-sel :deep(.q-field__control:hover) { background: var(--surface-3); }
.na-sel.q-field--focused :deep(.q-field__control) {
  border-color: var(--st-info);
  background: var(--surface);
}
.na-sel :deep(.q-field__label)           { color: var(--text-faint); font-size: var(--fs-label); line-height: var(--lh-tight); }
.na-sel :deep(.q-field__native),
.na-sel :deep(.q-field__input)           { font-size: var(--fs-body); line-height: var(--lh-body); color: var(--text); }
.na-sel :deep(.q-select__dropdown-icon) { color: var(--text-faint); }
.na-sel :deep(.q-field__marginal)       { color: var(--text-faint); }

/* ── Type cards ── */
.na-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.na-type-card {
  position: relative; padding: 14px 16px; border-radius: var(--r-sm);
  border: 2px solid var(--border-strong); cursor: pointer; background: var(--surface-2);
  transition: all 0.15s;
}
.ntc-code  { font-size: var(--fs-heading); line-height: var(--lh-tight); font-weight: 800; letter-spacing: 1px; }
.ntc-desc  { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); margin-top: 3px; }
.ntc-check { position: absolute; top: 10px; right: 10px; }
.ntc--im {
  &:hover { border-color: var(--st-info); background: rgba(66,153,225,0.04); }
  .ntc-code { color: var(--chip-info); }
  .ntc-check { color: var(--st-info-text); }
  &.selected { border-color: var(--st-info); background: rgba(66,153,225,0.08); }
}
.ntc--iv {
  &:hover { border-color: var(--st-purple); background: rgba(128,90,213,0.04); }
  .ntc-code { color: var(--chip-purple); }
  .ntc-check { color: var(--st-purple-text); }
  &.selected { border-color: var(--st-purple); background: rgba(128,90,213,0.08); }
}

/* ── Service cards ── */
.na-svc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
}
.na-svc-card {
  position: relative; padding: 12px 14px; border-radius: var(--r-sm);
  border: 2px solid var(--border-strong); cursor: pointer; background: var(--surface-2);
  transition: all 0.15s;
  &:hover { border-color: var(--st-info); background: rgba(66,153,225,0.04); }
  &.nsvc--selected { border-color: var(--st-info); background: rgba(49,130,206,0.08); }
}
.nsvc-name  { font-size: var(--fs-label); font-weight: 600; color: var(--text-2); line-height: 1.3; }
.nsvc-price { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 4px; }
.nsvc-check { position: absolute; top: 8px; right: 8px; color: var(--chip-info); }
.na-empty-svc {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); padding: 10px 0;
}

/* ── Third party row ── */
.na-third-row {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 14px; border-radius: var(--r-sm); cursor: pointer;
  border: 1.5px solid var(--border-strong); background: var(--surface-2);
  transition: border-color 0.15s;
  &:hover { border-color: var(--st-warn); }
}
.ntr-icon {
  width: 34px; height: 34px; border-radius: var(--r-sm); flex-shrink: 0;
  background: var(--border); color: var(--text-faint);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  &.ntr-icon--on { background: rgba(237,137,54,0.12); color: var(--chip-warn); }
}
.ntr-text  { flex: 1; }
.ntr-title { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 600; color: var(--text-2); }
.ntr-sub   { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 2px; }

/* ── Drug list ── */
.na-drug-list {
  display: flex; flex-direction: column;
  border: 1.5px solid var(--border); border-radius: var(--r-sm);
  overflow: hidden;
}

.na-drug-row {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 14px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--surface);
  transition: background 0.12s;
  &:hover { background: var(--surface-2); }
  &:last-of-type { border-bottom: none; }
}

.ndr-info  { flex: 1; min-width: 0; }
.ndr-name  { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ndr-price { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 1px; }

.ndr-controls {
  display: flex; align-items: center; gap: 0;
  background: var(--surface-3); border: 1.5px solid var(--border-strong);
  border-radius: var(--r-sm); overflow: hidden; flex-shrink: 0;
}
.ndr-btn {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text-3);
  background: transparent; border: none; cursor: pointer;
  transition: background 0.12s, color 0.12s;
  &:hover { background: var(--border-strong); color: var(--text); }
  &:active { background: #cbd5e0; }
}
.ndr-qty-input {
  width: 36px; height: 28px;
  text-align: center; border: none; outline: none;
  background: transparent; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700;
  color: var(--text); -moz-appearance: textfield;
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button { -webkit-appearance: none; }
}

.ndr-rm {
  width: 26px; height: 26px; border-radius: var(--r-sm); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; cursor: pointer; color: var(--text-disabled);
  transition: background 0.12s, color 0.12s;
  &:hover { background: rgba(229,62,62,0.08); color: var(--danger); }
}

.na-drug-total {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px;
  background: var(--surface-3);
  border-top: 1.5px solid var(--border);
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-muted);
}
.ndt-val { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text-2); }

/* ── Actions ── */
.na-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
</style>
