<template>
  <div class="pr-wrap">

    <!-- Loading -->
    <div v-if="loading" class="pr-state">
      <q-spinner-dots color="primary" size="24px" />
    </div>

    <!-- Empty -->
    <div v-else-if="!data.length" class="pr-state">
      <q-icon name="las la-pills" size="32px" style="color:var(--text-disabled)" />
      <span>Sem receitas médicas pendentes</span>
    </div>

    <!-- Cards -->
    <div v-else class="pr-grid">
      <div v-for="item in data" :key="item.id" class="pr-card">

        <!-- Header -->
        <div class="pr-card-head">
          <div class="pr-avatar">{{ initials(item?.consultation?.screening?.customer?.name) }}</div>
          <div class="pr-patient-info">
            <div class="pr-patient-name">{{ item?.consultation?.screening?.customer?.name ?? '—' }}</div>
            <div class="pr-date">
              <q-icon name="las la-calendar" size="12px" />
              {{ fmtDate(item.createdAt) }}
            </div>
          </div>
          <div class="pr-count-badge">{{ item.items?.length ?? 0 }} item{{ (item.items?.length ?? 0) !== 1 ? 's' : '' }}</div>
        </div>

        <!-- Items list -->
        <div class="pr-items">
          <div v-for="remedy in (item.items ?? [])" :key="remedy.id" class="pr-item-row">
            <q-icon name="las la-pills" size="13px" style="color: var(--st-purple); flex-shrink:0" />
            <span class="pr-item-name">{{ remedy.service?.name }}</span>
            <span class="pr-item-qty">× {{ remedy.quantity }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="pr-card-foot">
          <q-btn
            unelevated no-caps
            icon="las la-file-invoice-dollar"
            label="Faturar"
            color="deep-purple-8"
            style="border-radius: var(--r-sm); font-size: var(--fs-label); flex:1"
            @click="$router.push({ name: 'emitir-documento-form', params: { pharmacyId: item.id } })"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useCommom } from "src/composables/commom";

const { loading, data } = useCommom("prescriptions");

const initials = (name) => {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
};

const fmtDate = (val) => val
  ? new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(val))
  : "—";
</script>

<style scoped lang="scss">
.pr-wrap { width: 100%; }

.pr-state {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 40px 0; color: var(--text-faint); font-size: var(--fs-body); line-height: var(--lh-body);
}

.pr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.pr-card {
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  overflow: hidden; display: flex; flex-direction: column;
  &:hover { background: var(--surface-2); border-color: var(--border-control); }
}

.pr-card-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; border-bottom: 1px solid var(--border-soft); background: var(--surface-2);
}
.pr-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #b794f4, #9f7aea);
  color: #fff; font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.pr-patient-info { flex: 1; min-width: 0; }
.pr-patient-name {
  font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text-2);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pr-date {
  display: flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 2px;
}
.pr-count-badge {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--st-purple-text);
  background: rgba(159,122,234,0.1); border: 1px solid rgba(159,122,234,0.25);
  padding: 3px 9px; border-radius: var(--r-pill); white-space: nowrap; flex-shrink: 0;
}

.pr-items { padding: 10px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.pr-item-row {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 8px; border-radius: var(--r-sm); background: var(--surface-3);
}
.pr-item-name { flex: 1; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-2); font-weight: 500; }
.pr-item-qty  { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); white-space: nowrap; }

.pr-card-foot {
  display: flex; align-items: center;
  padding: 12px 16px; border-top: 1px solid var(--border-soft); margin-top: auto;
}
</style>
