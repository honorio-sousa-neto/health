<template>
  <div class="sp-wrap">

    <!-- Header -->
    <div class="sp-header">
      <div>
        <div class="sp-title">
          <q-icon name="las la-user-injured" size="18px" style="color: var(--st-purple)" />
          Pequenas Cirurgias
        </div>
        <div class="sp-sub">Gestão de curativos e pequenas intervenções cirúrgicas</div>
      </div>
      <div class="sp-header-right">
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
          label="Nova cirurgia"
          color="deep-purple-7"
          style="border-radius: var(--r-sm); font-size: var(--fs-label)"
          @click="isAdding = true"
        />
      </div>
    </div>

    <!-- Stats row -->
    <div class="sp-stats">
      <div class="sps-item">
        <span class="sps-val">{{ items.length }}</span>
        <span class="sps-lbl">Total</span>
      </div>
      <div class="sps-div" />
      <div class="sps-item">
        <span class="sps-val sps-pending">{{ countByStatus('pending') }}</span>
        <span class="sps-lbl">Pendentes</span>
      </div>
      <div class="sps-div" />
      <div class="sps-item">
        <span class="sps-val sps-running">{{ countByStatus('running') }}</span>
        <span class="sps-lbl">Em curso</span>
      </div>
      <div class="sps-div" />
      <div class="sps-item">
        <span class="sps-val sps-done">{{ countByStatus('done') }}</span>
        <span class="sps-lbl">Concluídas</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="sp-state">
      <q-spinner-dots color="deep-purple" size="28px" />
    </div>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="sp-state">
      <q-icon name="las la-user-injured" size="40px" style="color:var(--text-disabled)" />
      <span class="sp-empty-title">{{ search ? 'Sem resultados' : 'Nenhuma cirurgia registada' }}</span>
      <span class="sp-empty-sub">As cirurgias registadas pela enfermaria aparecem aqui</span>
    </div>

    <!-- Cards grid -->
    <div v-else class="sp-grid">
      <div
        v-for="item in filtered" :key="item.id"
        class="sp-card"
        :class="cardCls(item)"
      >
        <!-- Card head -->
        <div class="sc-head">
          <div class="sc-avatar" :class="avatarCls(item)">
            {{ initials(item.customer?.name) }}
          </div>
          <div class="sc-identity">
            <div class="sc-name">{{ item.customer?.name ?? 'Paciente desconhecido' }}</div>
            <div class="sc-phone">{{ item.customer?.phone ?? '' }}</div>
          </div>
          <span class="sc-level-chip" :class="levelCls(item.service?.name)">
            {{ item.service?.name ?? '—' }}
          </span>
        </div>

        <!-- Info row -->
        <div class="sc-info">
          <div class="sc-info-item">
            <q-icon name="las la-stethoscope" size="12px" />
            {{ item.service?.description ?? '—' }}
          </div>
          <div v-if="item.observation" class="sc-info-item">
            <q-icon name="las la-comment-medical" size="12px" />
            {{ item.observation }}
          </div>
        </div>

        <!-- Footer -->
        <div class="sc-footer">
          <div class="sc-footer-left">
            <span class="sc-status-chip" :class="statusCls(item.status)">
              <q-icon :name="statusIcon(item.status)" size="11px" />
              {{ statusLabel(item.status) }}
            </span>
            <span class="sc-paid-chip" :class="item.paid ? 'sp-paid' : 'sp-unpaid'">
              <q-icon :name="item.paid ? 'las la-check-circle' : 'las la-clock'" size="11px" />
              {{ item.paid ? 'Pago' : 'Por pagar' }}
            </span>
          </div>
          <div class="sc-actions" v-if="item.paid">
            <q-btn
              v-if="item.status === 'pending'"
              unelevated no-caps dense
              label="Iniciar"
              icon="las la-play-circle"
              color="deep-purple-7"
              style="border-radius: var(--r-sm); font-size: var(--fs-label); padding:4px 12px"
              :loading="actionId === item.id"
              @click="updateStatus(item, 'running')"
            />
            <q-btn
              v-else-if="item.status === 'running'"
              unelevated no-caps dense
              label="Concluir"
              icon="las la-check-circle"
              color="teal-7"
              style="border-radius: var(--r-sm); font-size: var(--fs-label); padding:4px 12px"
              :loading="actionId === item.id"
              @click="updateStatus(item, 'done')"
            />
            <span v-else class="sc-done-label">
              <q-icon name="las la-check-double" size="13px" />
              Concluída
            </span>
          </div>
          <div v-else class="sc-unpaid-hint">
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
            <q-icon name="las la-user-injured" size="16px" style="color: var(--st-purple)" />
            Nova cirurgia
          </div>
          <q-btn flat round dense icon="close" color="grey-5" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <AddSurgery @save="onSave" @cancel="isAdding = false" />
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { api } from "src/boot/axios";
import io from "src/utils/socket";
import AddSurgery from "./AddSurgery.vue";
import { showNotify } from "src/utils/notify";

const items   = ref([]);
const loading = ref(false);
const search  = ref("");
const isAdding = ref(false);
const actionId = ref(null);

const fetchAll = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("surgeries");
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

const countByStatus = (status) => items.value.filter((i) => i.status === status).length;

const updateStatus = async (item, status) => {
  actionId.value = item.id;
  try {
    await api.patch(`surgeries/${item.id}`, { status });
    item.status = status;
  } catch {
    showNotify("Erro ao actualizar", false);
  } finally {
    actionId.value = null;
  }
};

const onSave = async (form) => {
  try {
    await api.post("surgeries", form);
    isAdding.value = false;
    showNotify("Cirurgia registada", true);
    await fetchAll();
  } catch {
    showNotify("Erro ao registar", false);
  }
};

const initials = (name) =>
  name?.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("") ?? "?";

const levelCls = (name) => {
  const n = (name ?? "").toUpperCase();
  if (n.includes("ALFA"))   return "lc--alfa";
  if (n.includes("BETA"))   return "lc--beta";
  if (n.includes("GAMA"))   return "lc--gama";
  if (n.includes("NEBULIZ")) return "lc--nebul";
  return "lc--default";
};

const cardCls   = (item) => item.status === "done" ? "sc--done" : item.status === "running" ? "sc--running" : "";
const avatarCls = (item) => {
  const n = (item.service?.name ?? "").toUpperCase();
  if (n.includes("GAMA"))    return "av--gama";
  if (n.includes("BETA"))    return "av--beta";
  if (n.includes("NEBULIZ")) return "av--nebul";
  return "av--alfa";
};

const statusLabel = (s) => ({ pending: "Pendente", running: "Em curso", done: "Concluída" })[s] ?? s;
const statusIcon  = (s) => ({ pending: "las la-hourglass-half", running: "las la-spinner", done: "las la-check-circle" })[s] ?? "las la-circle";
const statusCls   = (s) => ({ pending: "ss--pending", running: "ss--running", done: "ss--done" })[s] ?? "";

const socket = io(api.defaults.baseURL.slice(0, -4));
onMounted(() => {
  fetchAll();
  socket.on("surgery:updated", fetchAll);
});
</script>

<style scoped lang="scss">
.sp-wrap {
  display: flex; flex-direction: column; gap: 20px;
  padding: 20px 24px; min-height: 100%;
}

/* Header */
.sp-header {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
}
.sp-title {
  display: flex; align-items: center; gap: 8px;
  font-size: var(--fs-section); line-height: var(--lh-tight); font-weight: 700; color: var(--text);
}
.sp-sub { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 3px; margin-left: 26px; }
.sp-header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

/* Stats */
.sp-stats {
  display: flex; align-items: center; gap: 20px;
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  padding: 14px 20px;
}
.sps-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.sps-val  { font-size: var(--fs-display); font-weight: 700; color: var(--text-2); line-height: 1; }
.sps-lbl  { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.5px; }
.sps-div  { width: 1px; height: 28px; background: var(--border); }
.sps-pending { color: var(--chip-warn); }
.sps-running { color: var(--chip-info); }
.sps-done    { color: var(--st-ok-text); }

/* States */
.sp-state {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 80px 0; color: var(--text-faint); font-size: var(--fs-body); line-height: var(--lh-body);
}
.sp-empty-title { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 600; color: var(--text-3); }
.sp-empty-sub   { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }

/* Grid */
.sp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

/* Card */
.sp-card {
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  overflow: hidden;
  display: flex; flex-direction: column;
  &:hover { background: var(--surface-2); border-color: var(--border-control); }
  /* Estado no contorno inteiro, a 1px, tokenizado. */
  &.sc--running { border-color: var(--chip-info); }
  &.sc--done    { border-color: var(--accent); opacity: 0.85; }
}

/* Card head */
.sc-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; border-bottom: 1px solid var(--border-soft);
}
.sc-avatar {
  width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: #fff;
}
.av--alfa  { background: linear-gradient(135deg, #68d391, #38a169); }
.av--beta  { background: linear-gradient(135deg, #f6ad55, #ed8936); }
.av--gama  { background: linear-gradient(135deg, #fc8181, var(--st-danger)); }
.av--nebul { background: linear-gradient(135deg, #63b3ed, var(--st-info-text)); }

.sc-identity { flex: 1; min-width: 0; }
.sc-name  { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sc-phone { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 1px; }

/* Level chip */
.sc-level-chip {
  display: inline-flex; align-items: center; flex-shrink: 0;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 800; padding: 3px 10px;
  border-radius: var(--r-pill); border: 1.5px solid transparent; letter-spacing: 0.3px;
}
.lc--alfa    { color: var(--chip-ok); background: rgba(56,161,105,0.1);   border-color: rgba(56,161,105,0.3); }
.lc--beta    { color: var(--chip-warn); background: rgba(237,137,54,0.1);   border-color: rgba(237,137,54,0.3); }
.lc--gama    { color: var(--danger); background: rgba(229,62,62,0.1);    border-color: rgba(229,62,62,0.3); }
.lc--nebul   { color: var(--st-info-text); background: rgba(66,153,225,0.1);   border-color: rgba(66,153,225,0.3); }
.lc--default { color: var(--text-muted); background: var(--surface-3);                border-color: var(--border-strong); }

/* Info */
.sc-info {
  padding: 10px 16px; display: flex; flex-direction: column; gap: 5px; flex: 1;
}
.sc-info-item {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted);
}

/* Footer */
.sc-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; border-top: 1px solid var(--surface-3); margin-top: auto;
  flex-wrap: wrap; gap: 8px;
}
.sc-footer-left { display: flex; align-items: center; gap: 6px; }

/* Status chip */
.sc-status-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; padding: 3px 9px;
  border-radius: var(--r-pill); border: 1.5px solid transparent;
}
.ss--pending { color: var(--chip-warn); background: rgba(237,137,54,0.08); border-color: rgba(237,137,54,0.25); }
.ss--running { color: var(--chip-info); background: rgba(66,153,225,0.08); border-color: rgba(66,153,225,0.25); }
.ss--done    { color: var(--chip-ok); background: rgba(50,185,137,0.08); border-color: rgba(50,185,137,0.25); }

/* Paid chip */
.sc-paid-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; padding: 3px 9px;
  border-radius: var(--r-pill);
}
.sp-paid   { color: var(--chip-ok); background: rgba(50,185,137,0.08); }
.sp-unpaid { color: var(--danger); background: rgba(229,62,62,0.08); }

.sc-done-label {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--st-ok-text);
}
.sc-unpaid-hint {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint);
}
.sc-actions { display: flex; align-items: center; }
</style>
