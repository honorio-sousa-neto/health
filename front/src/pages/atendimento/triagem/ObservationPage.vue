<template>
  <div class="op-wrap">
    <!-- Header -->
    <div class="op-header">
      <div>
        <div class="op-title">
          <q-icon name="las la-procedures" size="17px" style="color: var(--st-info)" />
          Observações
        </div>
        <div class="op-sub">
          {{ allObs.length }} registo{{ allObs.length !== 1 ? "s" : "" }} ·
          actualiza em tempo real
        </div>
      </div>
      <div class="op-counters">
        <div v-if="countPending" class="op-counter op-counter--warn">
          <q-icon name="las la-clock" size="12px" />
          {{ countPending }} aguarda faturação
        </div>
        <div v-if="countRunning" class="op-counter op-counter--blue">
          <q-icon name="las la-spinner" size="12px" />
          {{ countRunning }} em curso
        </div>
        <div v-if="countDone" class="op-counter op-counter--green">
          <q-icon name="las la-check" size="12px" />
          {{ countDone }} concluída{{ countDone !== 1 ? "s" : "" }}
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="op-state">
      <q-spinner-dots color="primary" size="24px" />
    </div>

    <!-- Empty -->
    <div v-else-if="!allObs.length" class="op-state">
      <q-icon name="las la-procedures" size="36px" style="color: var(--text-disabled)" />
      <span class="op-empty-title">Nenhuma observação registada</span>
      <span class="op-empty-sub"
        >As observações solicitadas pelo médico aparecem aqui</span
      >
    </div>

    <!-- Cards -->
    <div v-else class="op-grid">
      <div v-for="item in allObs" :key="item.id" class="op-card">
        <!-- Card header -->
        <div class="oc-head" :class="`oc-head--${cardTier(item)}`">
          <div class="oc-avatar">
            {{ initials(item.consultation?.screening?.customer?.name) }}
          </div>
          <div class="oc-identity">
            <div class="oc-name">
              {{ item.consultation?.screening?.customer?.name ?? "—" }}
            </div>
            <div class="oc-service">{{ item.service?.name ?? "—" }}</div>
          </div>
          <span class="oc-status-chip" :class="`sc--${cardTier(item)}`">
            <q-icon :name="statusIcon(item)" size="11px" />
            {{ statusLabel(item) }}
          </span>
        </div>

        <!-- Locked: awaiting billing -->
        <div v-if="!item.paid" class="oc-locked">
          <q-icon name="las la-lock" size="18px" style="color: var(--text-disabled)" />
          <span>Aguarda faturação pela recepção</span>
        </div>

        <!-- Active content -->
        <div v-else class="oc-body">
          <div v-if="item.consultation?.description" class="oc-field">
            <div class="oc-field-label">Recomendações médicas</div>
            <div class="oc-field-val">{{ item.consultation.description }}</div>
          </div>
          <div
            v-if="item.status === 'running' && item.endTime"
            class="oc-timer"
            :class="timerCls(item)"
          >
            <q-icon name="las la-clock" size="13px" />
            <span class="oc-timer-val">{{
              fmtCountdown(getRemaining(item.endTime))
            }}</span>
            <span class="oc-timer-label">restante</span>
          </div>
          <div
            v-if="item.endTime && item.status !== 'running'"
            class="oc-field"
          >
            <div class="oc-field-label">Previsto término</div>
            <div class="oc-field-val">{{ fmtDateTime(item.endTime) }}</div>
          </div>
        </div>

        <!-- Actions -->
        <div class="oc-footer">
          <q-btn
            v-if="item.paid && item.status === 'pending'"
            unelevated
            no-caps
            icon="las la-play"
            label="Iniciar observação"
            color="primary"
            style="border-radius: var(--r-sm); font-size: var(--fs-label); flex: 1"
            @click="openDialog(item)"
          />
          <q-btn
            v-else-if="item.paid && item.status === 'running'"
            unelevated
            no-caps
            icon="las la-edit"
            label="Continuar observação"
            color="teal-8"
            style="border-radius: var(--r-sm); font-size: var(--fs-label); flex: 1"
            @click="openDialog(item)"
          />
          <div v-else-if="item.status === 'done'" class="oc-done-msg">
            <q-icon
              name="las la-check-circle"
              size="14px"
              style="color: var(--st-ok)"
            />
            Observação concluída
          </div>
          <div v-else class="oc-pending-msg">
            <q-icon
              name="las la-hourglass-half"
              size="13px"
              style="color: var(--chip-warn)"
            />
            Aguarda faturação
          </div>
        </div>
      </div>
    </div>

    <!-- ── Observation Dialog ── -->
    <q-dialog v-model="dialogOpen" persistent>
      <div class="od-wrap" v-if="dialogItem">
        <!-- Dialog header -->
        <div class="od-header">
          <div class="odh-left">
            <q-btn
              flat
              round
              dense
              icon="las la-times"
              color="grey-6"
              @click="closeDialog"
            />
            <div>
              <div class="odh-name">
                {{ dialogItem.consultation?.screening?.customer?.name ?? "—" }}
              </div>
              <div class="odh-service">
                {{ dialogItem.service?.name ?? "—" }}
              </div>
            </div>
          </div>
          <span class="odh-chip" :class="`sc--${cardTier(dialogItem)}`">
            <q-icon :name="statusIcon(dialogItem)" size="11px" />
            {{ statusLabel(dialogItem) }}
          </span>
        </div>

        <!-- Timer (when running) -->
        <div
          v-if="dialogItem.status === 'running' && dialogItem.endTime"
          class="od-timer"
          :class="dialogTimerCls"
        >
          <div class="odt-inner">
            <q-icon name="las la-clock" size="20px" />
            <div>
              <div class="odt-val">{{ fmtCountdown(dialogRemaining) }}</div>
              <div class="odt-label">
                {{
                  dialogRemaining === 0 ? "Tempo esgotado" : "tempo restante"
                }}
              </div>
            </div>
          </div>
        </div>

        <!-- Scrollable content -->
        <div class="od-body">
          <!-- Doctor's recommendations -->
          <div
            v-if="dialogItem.consultation?.description"
            class="od-section od-section--blue"
          >
            <div class="ods-header">
              <q-icon name="las la-user-md" size="14px" />
              Recomendações do médico
            </div>
            <div class="ods-text">
              {{ dialogItem.consultation.description }}
            </div>
          </div>

          <!-- Nursing notes -->
          <div class="od-section">
            <div class="ods-header">
              <q-icon name="las la-notes-medical" size="14px" />
              Notas de observação
            </div>
            <textarea
              v-model="form.notes"
              class="od-textarea"
              rows="4"
              placeholder="Registe tudo o que foi realizado durante esta observação…"
            />
          </div>

          <!-- Serum / medication -->
          <div class="od-section">
            <div class="ods-header-row">
              <div class="ods-header">
                <q-icon name="las la-syringe" size="14px" />
                Soro e medicação
              </div>
              <!-- <q-btn
                flat
                no-caps
                dense
                icon="las la-plus"
                label="Adicionar"
                color="teal-8"
                style="font-size: var(--fs-label)"
                @click="showAddSerum = !showAddSerum"
              /> -->
            </div>

            <!-- Add serum form -->
            <div v-if="showAddSerum" class="od-add-serum">
              <input
                v-model="newSerum.nome"
                class="od-input"
                placeholder="Nome (ex: Soro fisiológico 0.9%)"
              />
              <div class="od-add-row">
                <input
                  v-model="newSerum.dose"
                  class="od-input"
                  placeholder="Dose (ex: 500ml, 1g)"
                />
                <select v-model="newSerum.via" class="od-select">
                  <option value="EV">EV – Endovenoso</option>
                  <option value="IM">IM – Intramuscular</option>
                  <option value="SC">SC – Subcutâneo</option>
                  <option value="VO">VO – Oral</option>
                  <option value="SL">SL – Sublingual</option>
                </select>
              </div>
              <div class="od-add-actions">
                <q-btn
                  unelevated
                  no-caps
                  label="Confirmar"
                  color="teal-8"
                  size="sm"
                  style="border-radius: var(--r-sm)"
                  @click="confirmAddSerum"
                />
                <q-btn
                  flat
                  no-caps
                  label="Cancelar"
                  size="sm"
                  @click="showAddSerum = false"
                />
              </div>
            </div>

            <!-- Serum list -->
            <div v-if="form.serums.length" class="od-serum-list">
              <div v-for="(s, i) in form.serums" :key="i" class="od-serum-item">
                <div class="osi-icon">
                  <q-icon
                    name="las la-syringe"
                    size="14px"
                    style="color: var(--st-teal)"
                  />
                </div>
                <div class="osi-info">
                  <span class="osi-name">{{ s.nome }}</span>
                  <span class="osi-meta"
                    >{{ s.dose }}&nbsp;·&nbsp;{{ s.via }}</span
                  >
                </div>
                <!-- <q-btn
                  flat
                  round
                  dense
                  icon="las la-times"
                  size="xs"
                  color="grey-5"
                  @click="form.serums.splice(i, 1)"
                /> -->
              </div>
            </div>
            <div v-else-if="!showAddSerum" class="od-serum-empty">
              Nenhum soro ou medicação registada
            </div>
          </div>
        </div>

        <!-- Dialog footer -->
        <div class="od-footer">
          <q-btn
            v-if="dialogItem.status === 'pending'"
            unelevated
            no-caps
            icon="las la-play"
            label="Iniciar observação"
            color="primary"
            style="border-radius: var(--r-sm); font-size: var(--fs-body); flex: 1"
            :loading="actioning === dialogItem.id"
            @click="startFromDialog"
          />
          <template v-else-if="dialogItem.status === 'running'">
            <q-btn
              unelevated
              no-caps
              icon="las la-save"
              label="Guardar notas"
              color="teal-8"
              style="
                border-radius: var(--r-sm);
                font-size: var(--fs-body);
                flex: 1;
                margin-right: 8px;
              "
              :loading="saving === dialogItem.id"
              @click="saveFromDialog"
            />
            <q-btn
              unelevated
              no-caps
              icon="las la-stop"
              label="Terminar"
              color="red-8"
              style="border-radius: var(--r-sm); font-size: var(--fs-body)"
              :loading="actioning === dialogItem.id"
              @click="finishFromDialog"
            />
          </template>
          <div v-else class="od-done-msg">
            <q-icon
              name="las la-check-circle"
              size="16px"
              style="color: var(--st-ok)"
            />
            Observação concluída
          </div>
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, toRaw } from "vue";
import { useCommom } from "src/composables/commom";

const { loading, data, fetchAll, update } = useCommom("observations");
const actioning = ref(null);
const saving = ref(null);

/* ── Global tick (1s) for all timers ── */
const nowMs = ref(Date.now());
let tickInterval = null;

/* ── Observations list ── */
const allObs = computed(() =>
  [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
);

const countPending = computed(() => allObs.value.filter((i) => !i.paid).length);
const countRunning = computed(
  () => allObs.value.filter((i) => i.paid && i.status === "running").length,
);
const countDone = computed(
  () => allObs.value.filter((i) => i.status === "done").length,
);

/* ── Card helpers ── */
const cardTier = (item) => {
  if (!item.paid) return "locked";
  if (item.status === "done") return "done";
  if (item.status === "running") return "running";
  return "pending";
};

const statusLabel = (item) => {
  if (!item.paid) return "Aguarda faturação";
  if (item.status === "pending") return "Aguarda início";
  if (item.status === "running") return "Em curso";
  return "Concluída";
};

const statusIcon = (item) => {
  if (!item.paid) return "las la-lock";
  if (item.status === "pending") return "las la-hourglass-half";
  if (item.status === "running") return "las la-spinner";
  return "las la-check-circle";
};

/* ── Timer helpers ── */
const getRemaining = (endTime) => {
  if (!endTime) return null;
  return Math.max(0, new Date(endTime).getTime() - nowMs.value);
};

const fmtCountdown = (ms) => {
  if (ms === null || ms === undefined) return "—";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const timerCls = (item) => {
  const rem = getRemaining(item.endTime);
  if (rem === null) return "";
  if (rem === 0) return "oc-timer--expired";
  if (rem < 5 * 60 * 1000) return "oc-timer--warn";
  return "oc-timer--ok";
};

/* ── Formatting ── */
const initials = (name) =>
  name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() ?? "?";

const fmtDateTime = (val) =>
  val
    ? new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(val))
    : "—";

/* ── Dialog state ── */
const dialogOpen = ref(false);
const dialogItemId = ref(null);
const dialogItem = computed(
  () => allObs.value.find((o) => o.id === dialogItemId.value) ?? null,
);

const form = reactive({ notes: "", serums: [] });
const showAddSerum = ref(false);
const newSerum = reactive({ nome: "", dose: "", via: "EV" });

const dialogRemaining = computed(() => getRemaining(dialogItem.value?.endTime));

const dialogTimerCls = computed(() => {
  const rem = dialogRemaining.value;
  if (rem === null) return "";
  if (rem === 0) return "od-timer--expired";
  if (rem < 5 * 60 * 1000) return "od-timer--warn";
  return "";
});

const openDialog = (item) => {
  dialogItemId.value = item.id;
  form.notes = item.description ?? "";
  form.serums = Array.isArray(item.serum) ? [...item.serum] : [];
  showAddSerum.value = false;
  Object.assign(newSerum, { nome: "", dose: "", via: "EV" });
  dialogOpen.value = true;
};

const closeDialog = () => {
  dialogOpen.value = false;
  dialogItemId.value = null;
};

const confirmAddSerum = () => {
  if (!newSerum.nome.trim()) return;
  form.serums.push({
    nome: newSerum.nome,
    dose: newSerum.dose,
    via: newSerum.via,
  });
  Object.assign(newSerum, { nome: "", dose: "", via: "EV" });
  showAddSerum.value = false;
};

/* ── Actions ── */
const buildPayload = (extra = {}) => ({
  description: form.notes,
  serum: form.serums.map((s) => ({ ...toRaw(s) })),
  ...extra,
});

const startFromDialog = async () => {
  if (!dialogItemId.value) return;
  actioning.value = dialogItemId.value;
  try {
    await update(buildPayload({ status: "running" }), dialogItemId.value);
    await fetchAll();
  } finally {
    actioning.value = null;
  }
};

const saveFromDialog = async () => {
  if (!dialogItemId.value) return;
  saving.value = dialogItemId.value;
  try {
    await update(buildPayload(), dialogItemId.value);
    await fetchAll();
  } finally {
    saving.value = null;
  }
};

const finishFromDialog = async () => {
  if (!dialogItemId.value) return;
  actioning.value = dialogItemId.value;
  try {
    await update(buildPayload({ status: "done" }), dialogItemId.value);
    await fetchAll();
    closeDialog();
  } finally {
    actioning.value = null;
  }
};

onMounted(() => {
  fetchAll();
  tickInterval = setInterval(() => {
    nowMs.value = Date.now();
  }, 1000);
});
onUnmounted(() => clearInterval(tickInterval));
</script>

<style scoped lang="scss">
.op-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 24px;
  min-height: 100%;
}

/* Header */
.op-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.op-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-section); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text);
}
.op-sub {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  color: var(--text-faint);
  margin-top: 3px;
  margin-left: 25px;
}
.op-counters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.op-counter {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  padding: 5px 12px;
  border-radius: var(--r-pill);
  border: 1.5px solid transparent;
}
.op-counter--warn {
  color: var(--chip-warn);
  background: rgba(237, 137, 54, 0.08);
  border-color: rgba(237, 137, 54, 0.25);
}
.op-counter--blue {
  color: var(--chip-info);
  background: rgba(66, 153, 225, 0.08);
  border-color: rgba(66, 153, 225, 0.25);
}
.op-counter--green {
  color: var(--chip-ok);
  background: rgba(50, 185, 137, 0.08);
  border-color: rgba(50, 185, 137, 0.25);
}

/* States */
.op-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 80px 0;
  color: var(--text-faint);
  font-size: var(--fs-body); line-height: var(--lh-body);
}
.op-empty-title {
  font-size: var(--fs-title); line-height: var(--lh-tight);
  font-weight: 600;
  color: var(--text-3);
}
.op-empty-sub {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  color: var(--text-faint);
}

/* Grid */
.op-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

/* Card */
.op-card {
  background: var(--surface);
  border-radius: var(--r-control);
  border: 1px solid var(--border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  &:hover { background: var(--surface-2); border-color: var(--border-control); }
}

/* Card head */
.oc-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px;
  border-bottom: 1px solid var(--border-soft);
}
.oc-head--locked {
  background: var(--surface-2);
}
.oc-head--pending {
  background: rgba(66, 153, 225, 0.04);
}
.oc-head--running {
  background: rgba(66, 153, 225, 0.06);
}
.oc-head--done {
  background: rgba(50, 185, 137, 0.05);
}

.oc-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(135deg, #4299e1, var(--st-info));
  color: #fff;
  font-size: var(--fs-body); line-height: var(--lh-body);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.oc-head--done .oc-avatar {
  background: linear-gradient(135deg, #68d391, #38a169);
}
.oc-head--running .oc-avatar {
  background: linear-gradient(135deg, #63b3ed, var(--st-info-text));
}

.oc-identity {
  flex: 1;
  min-width: 0;
}
.oc-name {
  font-size: var(--fs-body); line-height: var(--lh-body);
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.oc-service {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  color: var(--text-faint);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status chip */
.oc-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  padding: 3px 9px;
  border-radius: var(--r-pill);
  border: 1.5px solid transparent;
}
.sc--locked {
  color: var(--text-muted);
  background: var(--surface-3);
  border-color: var(--border-strong);
}
.sc--pending {
  color: var(--chip-info);
  background: rgba(66, 153, 225, 0.08);
  border-color: rgba(66, 153, 225, 0.2);
}
.sc--running {
  color: var(--chip-info);
  background: rgba(66, 153, 225, 0.12);
  border-color: rgba(66, 153, 225, 0.3);
}
.sc--done {
  color: var(--chip-ok);
  background: rgba(50, 185, 137, 0.08);
  border-color: rgba(50, 185, 137, 0.2);
}

/* Locked state */
.oc-locked {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 16px;
  color: var(--text-faint);
  font-size: var(--fs-label); line-height: var(--lh-tight);
  text-align: center;
}

/* Body */
.oc-body {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.oc-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.oc-field-label {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 800;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.oc-field-val {
  font-size: var(--fs-label);
  color: var(--text-3);
  line-height: 1.5;
}

/* Card timer */
.oc-timer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--r-sm);
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
}
.oc-timer-val {
  font-size: var(--fs-section); line-height: var(--lh-tight);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.oc-timer-label {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 500;
  opacity: 0.7;
}
.oc-timer--ok {
  color: var(--chip-info);
  background: rgba(66, 153, 225, 0.08);
}
.oc-timer--warn {
  color: var(--chip-warn);
  background: rgba(237, 137, 54, 0.1);
}
.oc-timer--expired {
  color: var(--danger);
  background: rgba(229, 62, 62, 0.1);
}

/* Footer */
.oc-footer {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-top: 1px solid var(--surface-3);
  margin-top: auto;
}
.oc-done-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600;
  color: var(--st-ok-text);
}
.oc-pending-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600;
  color: var(--chip-warn);
}

/* ── Dialog ── */
.od-wrap {
  width: 560px;
  max-width: 96vw;
  max-height: 90vh;
  background: var(--surface);
  border-radius: var(--r-panel);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.od-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--surface-2);
  flex-shrink: 0;
}
.odh-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.odh-name {
  font-size: var(--fs-title); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text);
}
.odh-service {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  color: var(--text-faint);
  margin-top: 1px;
}
.odh-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  padding: 3px 10px;
  border-radius: var(--r-pill);
  border: 1.5px solid transparent;
}

/* Dialog timer */
.od-timer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  border-bottom: 1px solid transparent;
  flex-shrink: 0;
  transition: all 0.3s;
}
.odt-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}
.odt-val {
  font-size: 32px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.odt-label {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 500;
  opacity: 0.7;
  margin-top: 2px;
}
.od-timer--warn {
  color: var(--chip-warn);
  background: rgba(237, 137, 54, 0.08);
  border-color: rgba(237, 137, 54, 0.2);
}
.od-timer--expired {
  color: var(--danger);
  background: rgba(229, 62, 62, 0.08);
  border-color: rgba(229, 62, 62, 0.2);
}
/* default (ok) */
.od-timer:not(.od-timer--warn):not(.od-timer--expired) {
  color: var(--chip-info);
  background: rgba(66, 153, 225, 0.06);
  border-color: rgba(66, 153, 225, 0.15);
}

/* Dialog body */
.od-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Sections */
.od-section {
  padding: 16px;
  border-bottom: 1px solid var(--border-soft);
  &:last-child {
    border-bottom: none;
  }
}
.od-section--blue {
  background: rgba(66, 153, 225, 0.03);
}

.ods-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 800;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 10px;
}
.od-section--blue .ods-header {
  color: var(--st-info-text);
}

.ods-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.ods-header-row .ods-header {
  margin-bottom: 0;
}

.ods-text {
  font-size: var(--fs-body);
  color: var(--text-3);
  line-height: 1.6;
  white-space: pre-wrap;
}

.od-textarea {
  width: 100%;
  resize: vertical;
  min-height: 100px;
  border: 1.5px solid var(--border-strong);
  border-radius: var(--r-sm);
  padding: 10px 12px;
  font-size: var(--fs-body);
  color: var(--text-2);
  font-family: inherit;
  line-height: 1.6;
  outline: none;
  &::placeholder {
    color: var(--text-disabled);
  }
  &:focus {
    border-color: var(--st-info);
  }
}

/* Add serum form */
.od-add-serum {
  background: var(--surface-3);
  border-radius: var(--r-sm);
  border: 1.5px solid var(--border-strong);
  padding: 12px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.od-add-row {
  display: flex;
  gap: 8px;
}
.od-input {
  flex: 1;
  border: 1.5px solid var(--border-strong);
  border-radius: var(--r-sm);
  padding: 7px 10px;
  font-size: var(--fs-body); line-height: var(--lh-body);
  color: var(--text-2);
  font-family: inherit;
  outline: none;
  &::placeholder {
    color: var(--text-disabled);
  }
  &:focus {
    border-color: var(--st-info);
  }
}
.od-select {
  border: 1.5px solid var(--border-strong);
  border-radius: var(--r-sm);
  padding: 7px 10px;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  color: var(--text-3);
  font-family: inherit;
  background: var(--surface);
  outline: none;
  &:focus {
    border-color: var(--st-info);
  }
}
.od-add-actions {
  display: flex;
  gap: 8px;
}

/* Serum list */
.od-serum-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.od-serum-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--r-sm);
  background: rgba(49, 151, 149, 0.05);
  border: 1px solid rgba(49, 151, 149, 0.15);
}
.osi-icon {
  flex-shrink: 0;
}
.osi-info {
  flex: 1;
  min-width: 0;
}
.osi-name {
  display: block;
  font-size: var(--fs-body); line-height: var(--lh-body);
  font-weight: 600;
  color: var(--text-2);
}
.osi-meta {
  display: block;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  color: var(--text-faint);
  margin-top: 1px;
}

.od-serum-empty {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  color: var(--text-faint);
  text-align: center;
  padding: 12px 0;
}

/* Dialog footer */
.od-footer {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-top: 1px solid var(--border-soft);
  background: var(--surface-2);
  flex-shrink: 0;
}
.od-done-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-body); line-height: var(--lh-body);
  font-weight: 600;
  color: var(--st-ok-text);
}
</style>
