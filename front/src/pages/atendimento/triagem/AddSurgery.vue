<template>
  <div class="as-wrap">

    <!-- Customer search -->
    <div class="as-field">
      <div class="as-label">Paciente</div>
      <q-select
        v-model="form.customerId"
        :options="customerOptions"
        option-value="value"
        option-label="label"
        emit-value map-options
        use-input
        input-debounce="300"
        @filter="filterCustomers"
        placeholder="Pesquisar paciente…"
        outlined dense
        clearable
      >
        <template #prepend>
          <q-icon name="las la-user" size="14px" color="grey-5" />
        </template>
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey text-caption">
              Nenhum paciente encontrado
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>

    <!-- Service (level) -->
    <div class="as-field">
      <div class="as-label">Tipo de procedimento</div>
      <div class="as-level-grid">
        <div
          v-for="svc in services" :key="svc.id"
          class="as-level-card"
          :class="[levelCardCls(svc.name), form.serviceId === svc.id ? 'selected' : '']"
          @click="form.serviceId = svc.id"
        >
          <div class="alc-name">{{ svc.name }}</div>
          <div class="alc-desc">{{ svc.description }}</div>
          <q-icon
            v-if="form.serviceId === svc.id"
            name="las la-check-circle"
            size="16px"
            class="alc-check"
          />
        </div>
      </div>
    </div>

    <!-- Observation -->
    <div class="as-field">
      <div class="as-label">Observações (opcional)</div>
      <textarea
        v-model="form.observation"
        class="as-textarea"
        rows="3"
        placeholder="Notas clínicas sobre o procedimento…"
      />
    </div>

    <!-- Actions -->
    <div class="as-actions">
      <q-btn flat no-caps label="Cancelar" color="grey-6" @click="$emit('cancel')" />
      <q-btn
        unelevated no-caps
        label="Registar cirurgia"
        icon="las la-check"
        color="deep-purple-7"
        style="border-radius: var(--r-sm)"
        :disable="!form.serviceId"
        @click="onSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { api } from "src/boot/axios";
import { showNotify } from "src/utils/notify";

const emit = defineEmits(["save", "cancel"]);

const services       = ref([]);
const allCustomers   = ref([]);
const customerOptions = ref([]);

const form = reactive({
  serviceId:   null,
  customerId:  null,
  observation: "",
});

const fetchServices = async () => {
  const { data } = await api.get("services/surgeries/list");
  services.value = data.data ?? [];
};

const fetchCustomers = async () => {
  const { data } = await api.get("customers");
  allCustomers.value = (data.data ?? []).map((c) => ({ label: c.name, value: c.id }));
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

const levelCardCls = (name) => {
  const n = (name ?? "").toUpperCase();
  if (n.includes("ALFA"))  return "lc--alfa";
  if (n.includes("BETA"))  return "lc--beta";
  if (n.includes("GAMA"))  return "lc--gama";
  return "";
};

const onSubmit = () => {
  if (!form.serviceId) {
    showNotify("Seleccione o nível do curativo", false);
    return;
  }
  emit("save", {
    serviceId:   form.serviceId,
    customerId:  form.customerId || undefined,
    observation: form.observation || undefined,
  });
};

onMounted(() => {
  fetchServices();
  fetchCustomers();
});
</script>

<style scoped lang="scss">
.as-wrap { display: flex; flex-direction: column; gap: 16px; }

.as-field { display: flex; flex-direction: column; gap: 6px; }
.as-label {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.6px;
}

/* Level cards */
.as-level-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
}
.as-level-card {
  position: relative; padding: 12px 14px; border-radius: var(--r-sm);
  border: 2px solid var(--border-strong); cursor: pointer;
  transition: all 0.15s; background: var(--surface-2);
  &:hover { border-color: var(--st-purple); background: var(--st-purple-tint); }
  &.selected { border-color: currentColor; background: var(--bg); }
}
.lc--alfa {
  --bg: rgba(56,161,105,0.06);
  &.selected { border-color: var(--st-ok); background: rgba(56,161,105,0.08); }
  .alc-name { color: var(--chip-ok); }
  .alc-check { color: var(--st-ok-text); }
}
.lc--beta {
  --bg: rgba(237,137,54,0.06);
  &.selected { border-color: var(--st-warn); background: rgba(237,137,54,0.08); }
  .alc-name { color: var(--chip-warn); }
  .alc-check { color: var(--st-warn-text); }
}
.lc--gama {
  --bg: rgba(229,62,62,0.06);
  &.selected { border-color: var(--st-danger); background: rgba(229,62,62,0.08); }
  .alc-name { color: var(--danger); }
  .alc-check { color: var(--danger); }
}
.lc--nebul {
  --bg: rgba(66,153,225,0.06);
  &:hover { border-color: var(--st-info); background: rgba(66,153,225,0.06); }
  &.selected { border-color: var(--st-info); background: rgba(66,153,225,0.08); }
  .alc-name { color: var(--st-info-text); }
  .alc-check { color: var(--st-info-text); }
}
.alc-name  { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 800; letter-spacing: 0.5px; }
.alc-desc  { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); margin-top: 3px; }
.alc-check { position: absolute; top: 8px; right: 8px; }

/* Textarea */
.as-textarea {
  width: 100%; box-sizing: border-box; resize: vertical; min-height: 72px;
  border: 1.5px solid var(--border-strong); border-radius: var(--r-sm);
  padding: 10px 12px; font-size: var(--fs-body); color: var(--text-2);
  font-family: inherit; line-height: 1.6; outline: none;
  &::placeholder { color: var(--text-disabled); }
  &:focus { border-color: var(--st-purple); }
}

/* Actions */
.as-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
</style>
