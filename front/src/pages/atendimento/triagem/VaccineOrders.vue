<template>
  <div class="vac-wrap">

    <!-- Header -->
    <div class="vac-header">
      <div>
        <div class="vac-title">
          <q-icon name="las la-syringe" size="18px" style="color: var(--st-teal)" />
          Ordens de vacinação
        </div>
        <div class="vac-sub">Ordens pendentes de administração</div>
      </div>
      <div class="vac-header-right">
        <q-input
          dense outlined v-model="search"
          placeholder="Pesquisar paciente…"
          style="min-width:180px; background:var(--surface); border-radius: var(--r-sm)"
          debounce="300"
        >
          <template #prepend><q-icon name="las la-search" size="14px" color="grey-5" /></template>
        </q-input>
        <q-btn
          unelevated no-caps icon="las la-plus"
          label="Registar vacina"
          color="teal-7"
          style="border-radius: var(--r-sm); font-size: var(--fs-label)"
          @click="openAdd"
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
        <span class="vs-val vs--pending">{{ countByStatus('pending') }}</span>
        <span class="vs-lbl">Pendentes</span>
      </div>
      <div class="vs-div" />
      <div class="vs-item">
        <span class="vs-val vs--running">{{ countByStatus('running') }}</span>
        <span class="vs-lbl">Em curso</span>
      </div>
      <div class="vs-div" />
      <div class="vs-item">
        <span class="vs-val vs--done">{{ countByStatus('done') }}</span>
        <span class="vs-lbl">Concluídas</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="vac-state">
      <q-spinner-dots color="teal-6" size="28px" />
    </div>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="vac-state">
      <q-icon name="las la-syringe" size="44px" style="color:#d1fae5" />
      <span class="vac-empty-title">{{ search ? 'Sem resultados' : 'Nenhuma ordem de vacinação' }}</span>
      <span class="vac-empty-sub">As ordens registadas pela recepção aparecem aqui</span>
    </div>

    <!-- Cards -->
    <div v-else class="vac-grid">
      <div
        v-for="item in filtered"
        :key="item.id"
        class="vc-card"
        :class="cardCls(item.status)"
      >
        <!-- Top stripe -->
        <div class="vc-stripe" :class="stripeCls(item.status)" />

        <!-- Head -->
        <div class="vc-head">
          <div class="vc-avatar">
            <q-icon name="las la-syringe" size="20px" />
          </div>
          <div class="vc-identity">
            <div class="vc-patient">{{ item.customer?.name ?? 'Paciente desconhecido' }}</div>
            <div class="vc-service">{{ item.service?.name ?? '—' }}</div>
          </div>
          <span class="vc-status-chip" :class="statusChipCls(item.status)">
            <q-icon :name="statusIcon(item.status)" size="11px" />
            {{ statusLabel(item.status) }}
          </span>
        </div>

        <!-- Meta row -->
        <div class="vc-meta">
          <span class="vcm-item">
            <q-icon name="las la-calendar" size="12px" />
            {{ fmtDate(item.createdAt) }}
          </span>
          <span class="vcm-item">
            <q-icon name="las la-clock" size="12px" />
            {{ fmtTime(item.createdAt) }}
          </span>
          <span class="vc-paid-chip" :class="item.paid ? 'vcp--paid' : 'vcp--unpaid'">
            {{ item.paid ? 'Pago' : 'Por pagar' }}
          </span>
        </div>

        <!-- Action -->
        <div class="vc-footer">
          <template v-if="item.status === 'done'">
            <span class="vc-done-label">
              <q-icon name="las la-check-double" size="13px" />
              Vacinação concluída
            </span>
          </template>
          <template v-else-if="!item.paid">
            <span class="vc-locked">
              <q-icon name="las la-lock" size="12px" />
              Aguarda pagamento
            </span>
          </template>
          <template v-else>
            <q-btn
              unelevated no-caps
              :label="item.status === 'pending' ? 'Iniciar vacinação' : 'Marcar como concluída'"
              :icon="item.status === 'pending' ? 'las la-play-circle' : 'las la-check-circle'"
              :color="item.status === 'pending' ? 'teal-7' : 'green-7'"
              style="border-radius: var(--r-sm); font-size: var(--fs-label)"
              :loading="actionId === item.id"
              @click="updateStatus(item)"
            />
          </template>
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
          Registar ordem de vacinação
        </div>
        <q-btn flat round dense icon="close" color="grey-5" v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-section>

        <div class="vf-field">
          <div class="vf-label">Paciente</div>
          <q-select
            v-model="newForm.customerId"
            :options="customerOptions"
            option-value="value" option-label="label"
            emit-value map-options
            use-input input-debounce="300"
            @filter="filterCustomers"
            placeholder="Pesquisar paciente…"
            borderless dense clearable
            class="vf-sel"
          >
            <template #prepend><q-icon name="las la-user" size="14px" color="grey-5" /></template>
            <template #no-option>
              <q-item><q-item-section class="text-grey text-caption">Nenhum paciente encontrado</q-item-section></q-item>
            </template>
          </q-select>
        </div>

        <div class="vf-field">
          <div class="vf-label">Tipo de vacina</div>
          <q-select
            v-model="newForm.serviceId"
            :options="vaccineServices.map((s) => ({ label: s.name, value: s.id }))"
            emit-value map-options
            placeholder="Seleccionar vacina…"
            borderless dense
            class="vf-sel"
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
            :disable="!newForm.serviceId || !newForm.customerId"
            :loading="saving"
            @click="onSaveNew"
          />
        </div>

      </q-card-section>
    </q-card>
  </q-dialog>

</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { SessionStorage } from "quasar";
import { api } from "src/boot/axios";
import { showNotify } from "src/utils/notify";

const user = SessionStorage.getItem("alfavida_user");

const items    = ref([]);
const loading  = ref(false);
const search   = ref("");
const actionId = ref(null);

const isAdding        = ref(false);
const saving          = ref(false);
const vaccineServices = ref([]);
const allCustomers    = ref([]);
const customerOptions = ref([]);
const newForm         = reactive({ serviceId: null, customerId: null });

const openAdd = async () => {
  isAdding.value = true;
  if (!vaccineServices.value.length) {
    try {
      const { data } = await api.get("services/vaccines/list");
      vaccineServices.value = data.data ?? [];
    } catch { vaccineServices.value = []; }
  }
  if (!allCustomers.value.length) {
    const { data } = await api.get("customers");
    allCustomers.value = (data.data ?? []).map((c) => ({ label: c.name, value: c.id }));
    customerOptions.value = allCustomers.value;
  }
};

const filterCustomers = (val, update) => {
  update(() => {
    const q = val.toLowerCase();
    customerOptions.value = q
      ? allCustomers.value.filter((c) => c.label.toLowerCase().includes(q))
      : allCustomers.value;
  });
};

const onSaveNew = async () => {
  if (!newForm.serviceId || !newForm.customerId) return;
  saving.value = true;
  try {
    await api.post("administrations", {
      serviceId:  newForm.serviceId,
      customerId: newForm.customerId,
      userId:     user?.id,
    });
    isAdding.value     = false;
    newForm.serviceId  = null;
    newForm.customerId = null;
    showNotify("Ordem de vacinação registada", true);
    await fetchAll();
  } catch {
    showNotify("Erro ao registar", false);
  } finally {
    saving.value = false;
  }
};

const fetchAll = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("administrations/vaccines");
    items.value = data.data ?? [];
  } finally {
    loading.value = false;
  }
};

const filtered = computed(() => {
  const s = search.value.trim().toLowerCase();
  if (!s) return items.value;
  return items.value.filter((i) =>
    i.customer?.name?.toLowerCase().includes(s) ||
    i.service?.name?.toLowerCase().includes(s)
  );
});

const countByStatus = (status) => items.value.filter((i) => i.status === status).length;

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

const statusLabel   = (s) => ({ pending: "Pendente", running: "Em curso", done: "Concluída" })[s] ?? s;
const statusIcon    = (s) => ({ pending: "las la-hourglass-half", running: "las la-spinner", done: "las la-check-circle" })[s] ?? "las la-circle";
const statusChipCls = (s) => ({ pending: "sc--pending", running: "sc--running", done: "sc--done" })[s] ?? "";
const cardCls       = (s) => ({ running: "vc--running", done: "vc--done" })[s] ?? "";
const stripeCls     = (s) => ({ pending: "str--pending", running: "str--running", done: "str--done" })[s] ?? "";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" }) : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }) : "—";

onMounted(fetchAll);
</script>

<style scoped lang="scss">
.vac-wrap {
  display: flex; flex-direction: column; gap: 20px;
  padding: 20px 24px; min-height: 100%;
}

/* Header */
.vac-header {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
}
.vac-title {
  display: flex; align-items: center; gap: 8px;
  font-size: var(--fs-section); line-height: var(--lh-tight); font-weight: 700; color: var(--text);
}
.vac-sub { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); margin-top: 3px; margin-left: 26px; }
.vac-header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

/* Dialog form */
.vf-field  { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.vf-label  { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; }
.vf-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }

.vf-sel :deep(.q-field__control) {
  background: var(--surface-3);
  border-radius: var(--r-sm);
  border: 1.5px solid transparent;
  padding: 0 12px;
  min-height: 40px;
  transition: border-color 0.18s, background 0.18s;
}
.vf-sel :deep(.q-field__control:hover) { background: var(--st-teal-tint); }
.vf-sel.q-field--focused :deep(.q-field__control) {
  border-color: var(--st-teal);
  background: var(--surface);
}
.vf-sel :deep(.q-field__label)           { color: var(--text-faint); font-size: var(--fs-label); line-height: var(--lh-tight); }
.vf-sel :deep(.q-field__native),
.vf-sel :deep(.q-field__input)           { font-size: var(--fs-body); line-height: var(--lh-body); color: var(--text); }
.vf-sel :deep(.q-select__dropdown-icon) { color: var(--text-faint); }
.vf-sel :deep(.q-field__marginal)       { color: var(--text-faint); }

/* Stats */
.vac-stats {
  display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  padding: 14px 20px;
}
.vs-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.vs-val  { font-size: var(--fs-display); font-weight: 700; color: var(--text-2); line-height: 1; }
.vs-lbl  { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.5px; }
.vs-div  { width: 1px; height: 28px; background: var(--border); }
.vs--pending { color: var(--chip-warn); }
.vs--running { color: var(--chip-info); }
.vs--done    { color: var(--st-teal-text); }

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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

/* Card */
.vc-card {
  background: var(--surface); border-radius: var(--r-panel);
  border: 1px solid var(--border);
  display: flex; flex-direction: column; overflow: hidden;
  transition: transform 0.15s;
  &:hover { background: var(--surface-2); border-color: var(--border-control); }
  &.vc--running { border-color: rgba(56,178,172,0.3); }
  &.vc--done    { border-color: rgba(16,185,129,0.25); opacity: 0.82; }
}

.vc-stripe {
  height: 4px; flex-shrink: 0;
  &.str--pending { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
  &.str--running { background: linear-gradient(90deg, var(--st-teal), #2dd4bf); }
  &.str--done    { background: linear-gradient(90deg, #10b981, #34d399); }
}

/* Head */
.vc-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px 10px;
}
.vc-avatar {
  width: 42px; height: 42px; border-radius: var(--r-control); flex-shrink: 0;
  background: linear-gradient(135deg, var(--st-teal), #2dd4bf);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.vc-identity { flex: 1; min-width: 0; }
.vc-patient  { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vc-service  { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.vc-status-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; padding: 3px 9px;
  border-radius: var(--r-pill); white-space: nowrap; flex-shrink: 0;
}
.sc--pending { color: var(--chip-warn); background: rgba(245,158,11,0.1);  border: 1px solid rgba(245,158,11,0.25); }
.sc--running { color: var(--chip-ok); background: rgba(13,148,136,0.1);  border: 1px solid rgba(13,148,136,0.25); }
.sc--done    { color: var(--chip-ok); background: rgba(16,185,129,0.1);  border: 1px solid rgba(16,185,129,0.25); }

/* Meta */
.vc-meta {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  padding: 0 16px 10px;
}
.vcm-item {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted);
}
.vc-paid-chip {
  margin-left: auto; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600;
  padding: 2px 8px; border-radius: var(--r-pill);
}
.vcp--paid   { color: var(--chip-ok); background: rgba(16,185,129,0.1); }
.vcp--unpaid { color: var(--danger); background: rgba(239,68,68,0.08); }

/* Footer */
.vc-footer {
  padding: 10px 16px 14px;
  border-top: 1px solid var(--surface-3);
  margin-top: auto;
}
.vc-done-label {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--st-ok-text);
}
.vc-locked {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted);
}
</style>
