<template>
  <div class="vac-wrap">

    <!-- Header -->
    <div class="vac-header">
      <div>
        <div class="vac-title">
          <q-icon name="las la-syringe" size="18px" style="color: var(--st-teal)" />
          Vacinas
        </div>
        <div class="vac-sub">Registo e gestão de vacinas — fluxo via recepção</div>
      </div>
      <div class="vac-header-right">
        <q-input
          dense outlined v-model="search"
          placeholder="Pesquisar paciente…"
          style="min-width:200px; background:var(--surface); border-radius: var(--r-sm)"
          debounce="300"
        >
          <template #prepend><q-icon name="las la-search" size="14px" color="grey-5" /></template>
        </q-input>
        <q-btn
          unelevated no-caps icon="las la-plus"
          label="Registar vacina"
          color="teal-7"
          style="border-radius: var(--r-sm); font-size: var(--fs-label)"
          @click="isAdding = true"
        />
      </div>
    </div>

    <!-- Stats -->
    <div class="vac-stats">
      <div class="vs-item">
        <span class="vs-val">{{ items.length }}</span>
        <span class="vs-lbl">Total</span>
      </div>
      <div class="vs-div" />
      <div class="vs-item">
        <span class="vs-val vs-paid">{{ countPaid }}</span>
        <span class="vs-lbl">Pagas</span>
      </div>
      <div class="vs-div" />
      <div class="vs-item">
        <span class="vs-val vs-unpaid">{{ items.length - countPaid }}</span>
        <span class="vs-lbl">Por pagar</span>
      </div>
      <div class="vs-div" />
      <div class="vs-item">
        <span class="vs-val vs-done">{{ countDone }}</span>
        <span class="vs-lbl">Administradas</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="vac-state">
      <q-spinner-dots color="teal" size="28px" />
    </div>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="vac-state">
      <q-icon name="las la-syringe" size="40px" style="color:var(--text-disabled)" />
      <span class="vac-empty-title">{{ search ? 'Sem resultados' : 'Nenhuma vacina registada' }}</span>
      <span class="vac-empty-sub">As vacinas registadas na recepção aparecem aqui</span>
    </div>

    <!-- Cards -->
    <div v-else class="vac-grid">
      <div
        v-for="item in filtered" :key="item.id"
        class="vac-card"
        :class="item.status === 'done' ? 'vc--done' : item.status === 'running' ? 'vc--running' : ''"
      >
        <!-- Head -->
        <div class="vc-head">
          <div class="vc-avatar">{{ initials(item.customer?.name) }}</div>
          <div class="vc-identity">
            <div class="vc-name">{{ item.customer?.name ?? 'Paciente desconhecido' }}</div>
            <div class="vc-service">
              <q-icon name="las la-syringe" size="11px" />
              {{ item.service?.name ?? '—' }}
            </div>
          </div>
          <span class="vc-paid-chip" :class="item.paid ? 'vpc--paid' : 'vpc--unpaid'">
            <q-icon :name="item.paid ? 'las la-check-circle' : 'las la-clock'" size="11px" />
            {{ item.paid ? 'Pago' : 'Por pagar' }}
          </span>
        </div>

        <!-- Footer -->
        <div class="vc-footer">
          <span class="vc-status-chip" :class="statusCls(item.status)">
            <q-icon :name="statusIcon(item.status)" size="11px" />
            {{ statusLabel(item.status) }}
          </span>
          <div v-if="item.paid && item.status !== 'done'">
            <q-btn
              unelevated no-caps dense
              :label="item.status === 'pending' ? 'Administrar' : 'Concluir'"
              :icon="item.status === 'pending' ? 'las la-play-circle' : 'las la-check-circle'"
              color="teal-7"
              style="border-radius: var(--r-sm); font-size: var(--fs-label); padding:4px 12px"
              :loading="actionId === item.id"
              @click="updateStatus(item)"
            />
          </div>
          <div v-else-if="item.status === 'done'" class="vc-done-label">
            <q-icon name="las la-check-double" size="13px" />
            Administrada
          </div>
          <div v-else class="vc-locked">
            <q-icon name="las la-lock" size="12px" />
            Aguarda pagamento
          </div>
        </div>
      </div>
    </div>

    <!-- Add dialog -->
    <q-dialog v-model="isAdding" persistent>
      <q-card style="width:520px; border-radius: var(--r-panel); max-width: 92vw">
        <q-card-section class="row items-center justify-between q-pb-sm">
          <div style="font-size: var(--fs-title); font-weight:700; color:var(--text); display:flex; align-items:center; gap:8px">
            <q-icon name="las la-syringe" size="16px" style="color: var(--st-teal)" />
            Registar vacina
          </div>
          <q-btn flat round dense icon="close" color="grey-5" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>

          <!-- Patient -->
          <div class="vf-field">
            <div class="vf-label">Paciente</div>
            <q-select
              v-model="form.customerId"
              :options="customerOptions"
              option-value="value" option-label="label"
              emit-value map-options
              use-input input-debounce="300"
              @filter="filterCustomers"
              placeholder="Pesquisar paciente…"
              outlined dense clearable
            >
              <template #prepend><q-icon name="las la-user" size="14px" color="grey-5" /></template>
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey text-caption">Nenhum paciente encontrado</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Vaccine service -->
          <div class="vf-field">
            <div class="vf-label">Tipo de vacina</div>
            <q-select
              v-model="form.serviceId"
              :options="vaccineServices.map((s) => ({ label: s.name, value: s.id }))"
              emit-value map-options
              placeholder="Seleccionar vacina…"
              outlined dense
            >
              <template #prepend><q-icon name="las la-syringe" size="14px" color="grey-5" /></template>
            </q-select>
          </div>

          <div class="vf-actions">
            <q-btn flat no-caps label="Cancelar" color="grey-6" v-close-popup />
            <q-btn
              unelevated no-caps
              label="Registar"
              icon="las la-check"
              color="teal-7"
              style="border-radius: var(--r-sm)"
              :disable="!form.serviceId"
              :loading="saving"
              @click="onSave"
            />
          </div>

        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { computed, onMounted, ref, reactive } from "vue";
import { SessionStorage } from "quasar";
import { api } from "src/boot/axios";
import { showNotify } from "src/utils/notify";

const user = SessionStorage.getItem("alfavida_user");

const items         = ref([]);
const loading       = ref(false);
const isAdding      = ref(false);
const saving        = ref(false);
const search        = ref("");
const actionId      = ref(null);
const vaccineServices = ref([]);
const allCustomers  = ref([]);
const customerOptions = ref([]);

const form = reactive({ serviceId: null, customerId: null });

const fetchAll = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("administrations");
    const all = data.data ?? [];
    items.value = all.filter((i) =>
      i.service?.name?.toLowerCase().includes("vacin")
    );
  } finally {
    loading.value = false;
  }
};

const fetchVaccines = async () => {
  try {
    const { data } = await api.get("services/vaccines/list");
    vaccineServices.value = data.data ?? [];
  } catch {
    vaccineServices.value = [];
  }
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

const filtered = computed(() => {
  const s = search.value.trim().toLowerCase();
  if (!s) return items.value;
  return items.value.filter((i) => i.customer?.name?.toLowerCase().includes(s));
});

const countPaid = computed(() => items.value.filter((i) => i.paid).length);
const countDone = computed(() => items.value.filter((i) => i.status === "done").length);

const updateStatus = async (item) => {
  const next = item.status === "pending" ? "running" : "done";
  actionId.value = item.id;
  try {
    await api.patch(`administrations/${item.id}`, { status: next });
    item.status = next;
  } catch {
    showNotify("Erro ao actualizar", false);
  } finally {
    actionId.value = null;
  }
};

const onSave = async () => {
  if (!form.serviceId) return;
  saving.value = true;
  try {
    await api.post("administrations", {
      serviceId:  form.serviceId,
      customerId: form.customerId || undefined,
      userId:     user?.id,
    });
    isAdding.value = false;
    form.serviceId = null;
    form.customerId = null;
    showNotify("Vacina registada", true);
    await fetchAll();
  } catch {
    showNotify("Erro ao registar", false);
  } finally {
    saving.value = false;
  }
};

const initials = (name) =>
  name?.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("") ?? "?";

const statusLabel = (s) => ({ pending: "Pendente", running: "Em curso", done: "Administrada" })[s] ?? s;
const statusIcon  = (s) => ({ pending: "las la-hourglass-half", running: "las la-spinner", done: "las la-check-circle" })[s] ?? "las la-circle";
const statusCls   = (s) => ({ pending: "vss--pending", running: "vss--running", done: "vss--done" })[s] ?? "";

onMounted(() => {
  fetchAll();
  fetchVaccines();
  fetchCustomers();
});
</script>

<style scoped lang="scss">
.vac-wrap {
  display: flex; flex-direction: column; gap: 20px;
  padding: 20px 24px; min-height: 100%;
}

.vac-header {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
}
.vac-title {
  display: flex; align-items: center; gap: 8px;
  font-size: var(--fs-section); line-height: var(--lh-tight); font-weight: 700; color: var(--text);
}
.vac-sub { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 3px; margin-left: 26px; }
.vac-header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

/* Stats */
.vac-stats {
  display: flex; align-items: center; gap: 20px;
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  padding: 14px 20px;
}
.vs-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.vs-val  { font-size: var(--fs-display); font-weight: 700; color: var(--text-2); line-height: 1; }
.vs-lbl  { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.5px; }
.vs-div  { width: 1px; height: 28px; background: var(--border); }
.vs-paid   { color: var(--st-ok-text); }
.vs-unpaid { color: var(--danger); }
.vs-done   { color: var(--st-teal-text); }

/* States */
.vac-state {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 80px 0; color: var(--text-faint); font-size: var(--fs-body); line-height: var(--lh-body);
}
.vac-empty-title { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 600; color: var(--text-3); }
.vac-empty-sub   { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }

/* Grid */
.vac-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

/* Card */
.vac-card {
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  overflow: hidden;
  display: flex; flex-direction: column;
  &:hover { background: var(--surface-2); border-color: var(--border-control); }
  &.vc--running { border-left-color: var(--st-teal); }
  &.vc--done    { border-left-color: var(--st-ok); opacity: 0.85; }
}

.vc-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; border-bottom: 1px solid var(--border-soft);
}
.vc-avatar {
  width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #4fd1c5, #319795);
  color: #fff; font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.vc-identity { flex: 1; min-width: 0; }
.vc-name    { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vc-service { display: flex; align-items: center; gap: 4px; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 2px; }

.vc-paid-chip {
  display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; padding: 3px 9px; border-radius: var(--r-pill);
}
.vpc--paid   { color: var(--chip-ok); background: rgba(50,185,137,0.1); border: 1px solid rgba(50,185,137,0.3); }
.vpc--unpaid { color: var(--danger); background: rgba(229,62,62,0.1);  border: 1px solid rgba(229,62,62,0.3); }

.vc-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; border-top: 1px solid var(--surface-3); margin-top: auto;
}
.vc-status-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; padding: 3px 9px;
  border-radius: var(--r-pill); border: 1.5px solid transparent;
}
.vss--pending { color: var(--chip-warn); background: rgba(237,137,54,0.08); border-color: rgba(237,137,54,0.25); }
.vss--running { color: #285e61; background: rgba(49,151,149,0.08); border-color: rgba(49,151,149,0.25); }
.vss--done    { color: var(--chip-ok); background: rgba(50,185,137,0.08); border-color: rgba(50,185,137,0.25); }

.vc-done-label {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--st-ok-text);
}
.vc-locked {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint);
}

/* Form */
.vf-field  { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.vf-label  {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.6px;
}
.vf-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
</style>
