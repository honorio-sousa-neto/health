<template>
  <div class="am-wrap">

    <!-- Header -->
    <div class="am-header">
      <div>
        <div class="am-title">
          <q-icon name="las la-pills" size="18px" style="color:var(--chip-info)" />
          Administração de Fármacos
        </div>
        <div class="am-sub">Gestão de administrações IM/IV e fármacos de terceiros</div>
      </div>
      <div class="am-header-right">
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
          label="Nova administração"
          color="blue-7"
          style="border-radius: var(--r-sm); font-size: var(--fs-label)"
          @click="isAdding = true"
        />
      </div>
    </div>

    <!-- Stats -->
    <div class="am-stats">
      <div class="ams-item">
        <span class="ams-val">{{ items.length }}</span>
        <span class="ams-lbl">Total</span>
      </div>
      <div class="ams-div" />
      <div class="ams-item">
        <span class="ams-val ams-im">{{ countByType('IM') }}</span>
        <span class="ams-lbl">IM</span>
      </div>
      <div class="ams-div" />
      <div class="ams-item">
        <span class="ams-val ams-iv">{{ countByType('IV') }}</span>
        <span class="ams-lbl">IV</span>
      </div>
      <div class="ams-div" />
      <div class="ams-item">
        <span class="ams-val ams-third">{{ countThirdParty }}</span>
        <span class="ams-lbl">Terceiros</span>
      </div>
      <div class="ams-div" />
      <div class="ams-item">
        <span class="ams-val ams-running">{{ countByStatus('running') }}</span>
        <span class="ams-lbl">Em curso</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="am-state">
      <q-spinner-dots color="primary" size="28px" />
    </div>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="am-state">
      <q-icon name="las la-pills" size="40px" style="color:var(--text-disabled)" />
      <span class="am-empty-title">{{ search ? 'Sem resultados' : 'Nenhuma administração registada' }}</span>
      <span class="am-empty-sub">As administrações da enfermaria aparecem aqui</span>
    </div>

    <!-- Cards -->
    <div v-else class="am-grid">
      <div
        v-for="item in filtered" :key="item.id"
        class="am-card"
        :class="item.status === 'running' ? 'amc--running' : item.status === 'done' ? 'amc--done' : ''"
      >
        <!-- Head -->
        <div class="amc-head">
          <div class="amc-avatar" :class="typeAvatarCls(item)">
            {{ item.type ?? '?' }}
          </div>
          <div class="amc-identity">
            <div class="amc-name">{{ item.customer?.name ?? 'Paciente desconhecido' }}</div>
            <div class="amc-service">
              {{ item.service?.name ?? '—' }}
              <span v-if="item.quantity" class="amc-qty">· {{ item.quantity }}</span>
              <span v-if="item.type" class="amc-type-inline">{{ item.type }}</span>
            </div>
          </div>
          <div class="amc-badges">
            <span class="amc-type-chip" :class="item.type === 'IM' ? 'tc--im' : item.type === 'IV' ? 'tc--iv' : 'tc--none'">
              {{ item.type ?? '—' }}
            </span>
            <span v-if="item.isThirdParty" class="amc-third-chip">
              <q-icon name="las la-box" size="10px" />
              Terceiros
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div class="amc-footer">
          <div class="amc-footer-left">
            <span class="amc-status-chip" :class="statusCls(item.status)">
              <q-icon :name="statusIcon(item.status)" size="11px" />
              {{ statusLabel(item.status) }}
            </span>
            <span class="amc-paid-chip" :class="item.paid ? 'apc--paid' : 'apc--unpaid'">
              {{ item.paid ? 'Pago' : 'Por pagar' }}
            </span>
          </div>
          <div v-if="item.paid && item.status !== 'done'">
            <q-btn
              unelevated no-caps dense
              :label="item.status === 'pending' ? 'Iniciar' : 'Concluir'"
              :icon="item.status === 'pending' ? 'las la-play-circle' : 'las la-check-circle'"
              :color="item.status === 'pending' ? 'blue-7' : 'teal-7'"
              style="border-radius: var(--r-sm); font-size: var(--fs-label); padding:4px 12px"
              :loading="actionId === item.id"
              @click="updateStatus(item)"
            />
          </div>
          <div v-else-if="item.status === 'done'" class="amc-done-label">
            <q-icon name="las la-check-double" size="13px" />
            Concluído
          </div>
          <div v-else class="amc-locked">
            <q-icon name="las la-lock" size="12px" />
            Aguarda pagamento
          </div>
        </div>
      </div>
    </div>

    <!-- Add dialog -->
    <q-dialog v-model="isAdding" persistent>
      <q-card style="width:560px; border-radius: var(--r-panel); max-width: 92vw">
        <q-card-section class="row items-center justify-between q-pb-sm">
          <div style="font-size: var(--fs-title); font-weight:700; color:var(--text); display:flex; align-items:center; gap:8px">
            <q-icon name="las la-pills" size="16px" style="color:var(--chip-info)" />
            Nova administração de fármacos
          </div>
          <q-btn flat round dense icon="close" color="grey-5" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <NewAdministrationMedicaments @change="onAdded" @cancel="isAdding = false" />
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { api } from "src/boot/axios";
import { showNotify } from "src/utils/notify";
import NewAdministrationMedicaments from "./NewAdministrationMedicaments.vue";

const items   = ref([]);
const loading = ref(false);
const search  = ref("");
const isAdding = ref(false);
const actionId = ref(null);

const fetchAll = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("administrations");
    items.value = data.data ?? [];
  } finally {
    loading.value = false;
  }
};

const filtered = computed(() => {
  const s = search.value.trim().toLowerCase();
  if (!s) return items.value;
  return items.value.filter((i) =>
    i.customer?.name?.toLowerCase().includes(s)
  );
});

const countByType    = (type)   => items.value.filter((i) => i.type === type).length;
const countByStatus  = (status) => items.value.filter((i) => i.status === status).length;
const countThirdParty = computed(() => items.value.filter((i) => i.isThirdParty).length);

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

const onAdded = async () => {
  isAdding.value = false;
  showNotify("Administração registada", true);
  await fetchAll();
};

const typeAvatarCls = (item) => {
  if (item.type === "IM") return "av--im";
  if (item.type === "IV") return "av--iv";
  return "av--default";
};

const statusLabel = (s) => ({ pending: "Pendente", running: "Em curso", done: "Concluído" })[s] ?? s;
const statusIcon  = (s) => ({ pending: "las la-hourglass-half", running: "las la-spinner", done: "las la-check-circle" })[s] ?? "las la-circle";
const statusCls   = (s) => ({ pending: "ss--pending", running: "ss--running", done: "ss--done" })[s] ?? "";

onMounted(fetchAll);
</script>

<style scoped lang="scss">
.am-wrap {
  display: flex; flex-direction: column; gap: 20px;
  padding: 20px 24px; min-height: 100%;
}

/* Header */
.am-header {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
}
.am-title {
  display: flex; align-items: center; gap: 8px;
  font-size: var(--fs-section); line-height: var(--lh-tight); font-weight: 700; color: var(--text);
}
.am-sub { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 3px; margin-left: 26px; }
.am-header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

/* Stats */
.am-stats {
  display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  padding: 14px 20px;
}
.ams-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.ams-val  { font-size: var(--fs-display); font-weight: 700; color: var(--text-2); line-height: 1; }
.ams-lbl  { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.5px; }
.ams-div  { width: 1px; height: 28px; background: var(--border); }
.ams-im      { color: var(--chip-info); }
.ams-iv      { color: var(--chip-purple); }
.ams-third   { color: var(--chip-warn); }
.ams-running { color: var(--st-ok-text); }

/* States */
.am-state {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 80px 0; color: var(--text-faint); font-size: var(--fs-body); line-height: var(--lh-body);
}
.am-empty-title { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 600; color: var(--text-3); }
.am-empty-sub   { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }

/* Grid */
.am-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

/* Card */
.am-card {
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  overflow: hidden;
  display: flex; flex-direction: column;
  &:hover { background: var(--surface-2); border-color: var(--border-control); }
  &.amc--running { border-left-color: var(--st-info); }
  &.amc--done    { border-left-color: var(--st-ok); opacity: 0.8; }
}

/* Head */
.amc-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; border-bottom: 1px solid var(--border-soft);
}
.amc-avatar {
  width: 44px; height: 44px; border-radius: var(--r-sm); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 800; color: #fff; letter-spacing: 0.5px;
}
.av--im      { background: linear-gradient(135deg, #63b3ed, var(--st-info-text)); }
.av--iv      { background: linear-gradient(135deg, #b794f4, var(--st-purple-text)); }
.av--default { background: var(--border-strong); color: var(--text-muted); }

.amc-identity { flex: 1; min-width: 0; }
.amc-name    { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.amc-service { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 2px; }
.amc-qty         { font-weight: 700; color: var(--text-3); }
.amc-type-inline { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--chip-purple); background: rgba(128,90,213,0.1); border-radius: var(--r-sm); padding: 1px 5px; margin-left: 2px; }

.amc-badges  { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }

.amc-type-chip {
  display: inline-flex; align-items: center; justify-content: center;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 800; padding: 2px 10px;
  border-radius: var(--r-pill); letter-spacing: 0.5px;
}
.tc--im   { color: var(--chip-info); background: rgba(66,153,225,0.12); border: 1px solid rgba(66,153,225,0.3); }
.tc--iv   { color: var(--chip-purple); background: rgba(128,90,213,0.12); border: 1px solid rgba(128,90,213,0.3); }
.tc--none { color: var(--text-faint); background: var(--surface-3);               border: 1px solid var(--border-strong); }

.amc-third-chip {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--chip-warn);
  background: rgba(237,137,54,0.1); border: 1px solid rgba(237,137,54,0.3);
  padding: 2px 8px; border-radius: var(--r-pill);
}

/* Footer */
.amc-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; border-top: 1px solid var(--surface-3);
  margin-top: auto; flex-wrap: wrap; gap: 8px;
}
.amc-footer-left { display: flex; align-items: center; gap: 6px; }

.amc-status-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; padding: 3px 9px;
  border-radius: var(--r-pill); border: 1.5px solid transparent;
}
.ss--pending { color: var(--chip-warn); background: rgba(237,137,54,0.08); border-color: rgba(237,137,54,0.25); }
.ss--running { color: var(--chip-info); background: rgba(66,153,225,0.08); border-color: rgba(66,153,225,0.25); }
.ss--done    { color: var(--chip-ok); background: rgba(50,185,137,0.08); border-color: rgba(50,185,137,0.25); }

.amc-paid-chip {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; padding: 3px 9px; border-radius: var(--r-pill);
}
.apc--paid   { color: var(--chip-ok); background: rgba(50,185,137,0.08); }
.apc--unpaid { color: var(--danger); background: rgba(229,62,62,0.08); }

.amc-done-label {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--st-ok-text);
}
.amc-locked {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint);
}
</style>
