<template>
  <div v-if="list.length" class="rx-card">
    <div class="rx-head">
      <q-icon name="las la-file-medical" size="15px" style="color: var(--st-purple)" />
      Prescrições
      <span class="rx-count">{{ totalItems }}</span>
    </div>

    <div class="rx-body">
      <div v-for="(p, pi) in list" :key="p.id ?? pi" class="rx-group">
        <div class="rx-group-head">
          <span class="rx-type" :class="p.type === 'PHARMACY' ? 'rx-type--pharm' : 'rx-type--amb'">
            {{ p.type === 'PHARMACY' ? 'Farmácia' : 'Ambulatório' }}
          </span>
          <span class="rx-status" :class="p.paid ? 'rx-status--paid' : 'rx-status--pending'">
            <q-icon :name="p.paid ? 'las la-check' : 'las la-clock'" size="10px" />
            {{ p.paid ? 'Dispensada' : 'Por dispensar' }}
          </span>
          <span v-if="p.createdAt" class="rx-date">{{ fmtDate(p.createdAt) }}</span>
        </div>

        <div v-if="!(p.items && p.items.length)" class="rx-empty">Sem itens</div>
        <div v-for="(it, ii) in (p.items ?? [])" :key="ii" class="rx-item">
          <div class="rx-item-name">{{ it.service?.name ?? '—' }}</div>
          <div class="rx-item-meta">
            <span v-if="it.dose">{{ it.dose }}</span>
            <span v-if="it.frequency">· {{ it.frequency }}</span>
            <span v-if="Number(it.duration)">· {{ Number(it.duration) }} dia(s)</span>
            <span v-if="it.canal">· {{ it.canal }}</span>
            <span v-if="it.quantity" class="rx-qty">Qtd: {{ it.quantity }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  prescriptions: { type: Array, default: () => [] },
});

const list = computed(() => (props.prescriptions ?? []).filter((p) => p && (p.items?.length || p.id)));
const totalItems = computed(() => list.value.reduce((n, p) => n + (p.items?.length ?? 0), 0));

const fmtDate = (val) =>
  val
    ? new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(val))
    : "";
</script>

<style scoped lang="scss">
.rx-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-control); overflow: hidden;
}
.rx-head {
  display: flex; align-items: center; gap: 7px;
  padding: 12px 13px; background: var(--surface-2); border-bottom: 1px solid var(--border-soft);
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-2);
}
.rx-count {
  margin-left: auto; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--st-purple-text);
  background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.3);
  border-radius: var(--r-pill); padding: 1px 8px;
}
.rx-body { padding: 10px 13px; display: flex; flex-direction: column; gap: 10px; }

.rx-group {
  border-left: 1px solid var(--border-strong); padding-left: 10px;
  display: flex; flex-direction: column; gap: 5px;
}
.rx-group-head { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.rx-type {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; padding: 2px 8px; border-radius: var(--r-pill);
  text-transform: uppercase; letter-spacing: 0.4px;
}
.rx-type--pharm { color: var(--chip-ok); background: rgba(50,185,137,0.1); border: 1px solid rgba(50,185,137,0.3); }
.rx-type--amb   { color: var(--chip-info); background: rgba(66,153,225,0.1); border: 1px solid rgba(66,153,225,0.3); }
.rx-status {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; padding: 2px 8px; border-radius: var(--r-pill);
}
.rx-status--paid    { color: var(--chip-ok); background: rgba(50,185,137,0.08); border: 1px solid rgba(50,185,137,0.25); }
.rx-status--pending { color: var(--chip-warn); background: rgba(237,137,54,0.08); border: 1px solid rgba(237,137,54,0.25); }
.rx-date { margin-left: auto; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }

.rx-item { padding: 4px 0; border-bottom: 1px solid var(--surface-3); }
.rx-item:last-child { border-bottom: none; }
.rx-item-name { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 600; color: var(--text-2); }
.rx-item-meta {
  display: flex; flex-wrap: wrap; gap: 4px; align-items: center;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); margin-top: 1px;
}
.rx-qty { margin-left: auto; color: var(--text-faint); font-weight: 600; }
.rx-empty { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-disabled); font-style: italic; }
</style>
