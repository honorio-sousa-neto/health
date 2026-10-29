<template>
  <div class="notif-wrap" ref="wrapRef">
    <div class="notif-bell" :class="{ 'notif-bell--active': items.length > 0 }" @click="panelOpen = !panelOpen">
      <q-icon name="las la-bell" size="19px" />
      <span v-if="unread > 0" class="notif-badge">{{ unread > 9 ? '9+' : unread }}</span>
    </div>

    <Teleport to="body">
      <transition name="notif-slide">
        <div v-if="panelOpen" class="notif-panel" :style="panelStyle">
          <div class="notif-panel__head">
            <span>Notificações</span>
            <button v-if="items.length" class="notif-clear-btn" @click="clearAll">Limpar tudo</button>
          </div>

          <div v-if="!items.length" class="notif-empty">
            <q-icon name="las la-bell-slash" size="30px" style="color:var(--text-disabled)" />
            <span>Sem notificações</span>
          </div>

          <div v-else class="notif-list">
            <div
              v-for="item in items" :key="item.id"
              class="notif-item" :class="[`notif-item--${item.type}`, { 'notif-item--unread': !item.read }]"
              @click="markRead(item.id)"
            >
              <div class="notif-item__icon">
                <q-icon :name="typeIcon(item.type)" size="15px" />
              </div>
              <div class="notif-item__body">
                <div class="notif-item__title">{{ item.title }}</div>
                <div class="notif-item__msg">{{ item.patientName ?? item.message }}</div>
                <div class="notif-item__time">{{ fmtTime(item.timestamp) }}</div>
              </div>
              <div v-if="!item.read" class="notif-item__dot" />
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { SessionStorage, Notify } from "quasar";
import { io } from "src/utils/socket";
import { api } from "src/boot/axios";

const user = SessionStorage.getItem("alfavida_user");
const BASE_URL = api.defaults.baseURL.replace(/\/api$/, "");
const socket = io(BASE_URL, { transports: ["websocket"] });

// ── State ──────────────────────────────────────────────────────
const panelOpen = ref(false);
const items = ref([]);
const wrapRef = ref(null);
const unread = computed(() => items.value.filter((i) => !i.read).length);

const panelStyle = computed(() => {
  if (!wrapRef.value) return {};
  const rect = wrapRef.value.getBoundingClientRect();
  return {
    top:  `${rect.bottom + 8}px`,
    left: `${Math.max(8, rect.left - 280 + rect.width)}px`,
  };
});

// ── Load persisted notifications on mount ──────────────────────
const loadPersisted = async () => {
  try {
    const { data: res } = await api.get("notifications");
    const loaded = (res.data ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      patientName: n.patientName,
      type: n.type,
      timestamp: n.createdAt,
      read: n.readBy?.includes(user?.id),
    }));
    // merge: add persisted ones that aren't already in items (by id)
    const existingIds = new Set(items.value.map((i) => i.id));
    loaded.forEach((n) => { if (!existingIds.has(n.id)) items.value.push(n); });
    items.value.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (_) {}
};

// ── Socket ─────────────────────────────────────────────────────
onMounted(() => {
  loadPersisted();

  socket.on("connect", () => {
    if (user?.role) socket.emit("join:role", user.role);
  });

  socket.on("notification", (payload) => {
    // avoid duplicate if we already loaded it from DB
    if (payload.id && items.value.some((i) => i.id === payload.id)) return;
    push(payload);
  });

  socket.on("screening:create", () => {
    if (["nurse", "techNursian", "admin"].includes(user?.role))
      push({ title: "Nova triagem", message: "Paciente enviado para triagem", type: "alert" });
  });
  socket.on("consultation:create", () => {
    if (["doctor", "admin"].includes(user?.role))
      push({ title: "Nova consulta", message: "Paciente pronto para consulta", type: "alert" });
  });
  socket.on("exams:request", () => {
    if (["analyst", "chiefLab", "techLab", "admin"].includes(user?.role))
      push({ title: "Pedido de exame", message: "Novo exame solicitado", type: "info" });
  });

  document.addEventListener("click", onClickOutside);
});

onUnmounted(() => {
  socket.disconnect();
  document.removeEventListener("click", onClickOutside);
});

function onClickOutside(e) {
  if (wrapRef.value && !wrapRef.value.contains(e.target)) panelOpen.value = false;
}

// ── Add notification ───────────────────────────────────────────
function push(payload) {
  const item = {
    id: Date.now() + Math.random(),
    title: payload.title ?? "Notificação",
    message: payload.message ?? "",
    patientName: payload.patientName,
    type: payload.type ?? "info",
    timestamp: payload.timestamp ?? new Date().toISOString(),
    read: false,
  };
  items.value.unshift(item);
  if (items.value.length > 50) items.value.pop();
  showToast(item);
  playSound(item.type);
}

function showToast(item) {
  const icons = { alert: "las la-bell", success: "las la-check-circle", info: "las la-info-circle" };
  Notify.create({
    position: "top-right",
    timeout: 7000,
    html: false,
    message: [item.title, item.patientName, item.message].filter(Boolean).join(" — "),
    color: "white",
    textColor: "dark",
    icon: icons[item.type] ?? "las la-bell",
    classes: `alfavida-toast alfavida-toast--${item.type}`,
    style: "",
    actions: [{ icon: "close", color: "grey-6", size: "xs", handler: () => {} }],
  });
}

function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs = type === "alert" ? [880, 1100] : [660, 880];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  } catch {}
}

// ── Helpers ────────────────────────────────────────────────────
const markRead = (id) => {
  const i = items.value.find((x) => x.id === id);
  if (i) {
    i.read = true;
    // persist if it's a UUID (came from DB or was saved by notify())
    if (typeof id === "string" && id.includes("-")) {
      api.patch(`notifications/${id}/read`).catch(() => {});
    }
  }
};
const clearAll = () => {
  items.value = [];
  panelOpen.value = false;
  api.delete("notifications").catch(() => {});
};
const typeIcon = (t) => ({ alert: "las la-bell", success: "las la-check-circle", info: "las la-info-circle" })[t] ?? "las la-bell";
const fmtTime  = (ts) => ts ? new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" }).format(new Date(ts)) : "";
</script>

<style lang="scss">
.alfavida-toast {
  background: var(--surface) !important;
  border-radius: var(--r-control) !important;
  padding: 12px 14px !important;
  min-width: 280px !important;
  max-width: 360px !important;
  .q-notification__icon { font-size: 22px !important; color: var(--chip-info) !important; }
  .q-notification__actions .q-btn { color: var(--text-muted) !important; }
}

/* O tipo de aviso lê-se no ícone — era a barra lateral que o carregava, e o
   ícone ficava sempre verde independentemente do estado. */
.alfavida-toast--alert   .q-notification__icon { color: var(--danger) !important; }
.alfavida-toast--success .q-notification__icon { color: var(--chip-ok) !important; }
.alfavida-toast--info    .q-notification__icon { color: var(--chip-info) !important; }
</style>

<style scoped lang="scss">
.notif-wrap { position: relative; display: inline-flex; }

.notif-bell {
  position: relative;
  width: 34px; height: 34px; border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-muted); cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover { background: #f1f5f9; color: #475569; }
  &--active { color: #f97316; animation: bell-ring 0.5s ease; }
}

@keyframes bell-ring {
  0%,100% { transform: rotate(0); }
  20%     { transform: rotate(-18deg); }
  40%     { transform: rotate(18deg); }
  60%     { transform: rotate(-10deg); }
  80%     { transform: rotate(10deg); }
}

.notif-badge {
  position: absolute; top: 3px; right: 3px;
  background: #ef4444; color: #fff;
  font-size: var(--fs-label); font-weight: 800;
  min-width: 15px; height: 15px; border-radius: var(--r-pill); padding: 0 3px;
  display: flex; align-items: center; justify-content: center;
  border: 1.5px solid var(--surface); line-height: 1;
}

.notif-panel {
  position: fixed;
  width: 320px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r-panel);
  z-index: 9999;
  overflow: hidden;
}

.notif-panel__head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px;
  font-size: var(--fs-label); font-weight: 700; color: var(--text);
  border-bottom: 1px solid #f1f5f9;
}

.notif-clear-btn {
  font-size: var(--fs-label); font-weight: 600; color: var(--text-muted);
  background: none; border: none; cursor: pointer;
  &:hover { color: var(--danger); }
}

.notif-empty {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 28px; font-size: var(--fs-label); color: var(--text-muted);
}

.notif-list { max-height: 380px; overflow-y: auto; }

.notif-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 11px 14px; border-bottom: 1px solid var(--surface-3);
  cursor: pointer; transition: background 0.12s;
  &:last-child { border-bottom: none; }
  &:hover { background: var(--surface-3); }
  &--unread { background: #fafcff; }
  &--alert   .notif-item__icon { background: #fef2f2; color: var(--danger); }
  &--success .notif-item__icon { background: #f0fdf4; color: #22c55e; }
  &--info    .notif-item__icon { background: #eff6ff; color: #3b82f6; }
}

.notif-item__icon {
  width: 30px; height: 30px; border-radius: var(--r-sm); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}

.notif-item__body { flex: 1; min-width: 0; }
.notif-item__title { font-size: var(--fs-label); font-weight: 700; color: var(--text); }
.notif-item__msg   { font-size: var(--fs-label); color: #64748b; margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notif-item__time  { font-size: var(--fs-label); color: var(--text-muted); margin-top: 2px; }
.notif-item__dot   { width: 7px; height: 7px; border-radius: 50%; background: #3b82f6; flex-shrink: 0; margin-top: 3px; }

.notif-slide-enter-active, .notif-slide-leave-active { transition: opacity 0.18s, transform 0.18s; }
.notif-slide-enter-from, .notif-slide-leave-to { opacity: 0; transform: translateY(-6px) scale(0.97); }
</style>
