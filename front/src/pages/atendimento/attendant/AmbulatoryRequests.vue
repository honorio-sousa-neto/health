<template>
  <div class="ar-wrap">

    <!-- Loading -->
    <div v-if="loading" class="ar-state">
      <q-spinner-dots color="primary" size="24px" />
    </div>

    <!-- Empty -->
    <div v-else-if="!data.length" class="ar-state">
      <q-icon name="las la-walking" size="32px" style="color:var(--text-disabled)" />
      <span>Sem pedidos de ambulatório pendentes</span>
    </div>

    <!-- Cards -->
    <div v-else class="ar-grid">
      <div v-for="item in data" :key="item.id" class="ar-card">

        <!-- Header -->
        <div class="ar-card-head">
          <div class="ar-avatar">{{ initials(item.consultation?.screening?.customer?.name) }}</div>
          <div class="ar-patient-info">
            <div class="ar-patient-name">{{ item.consultation?.screening?.customer?.name ?? '—' }}</div>
            <div class="ar-date">
              <q-icon name="las la-calendar" size="12px" />
              {{ fmtDate(item.createdAt) }}
            </div>
          </div>
        </div>

        <!-- Services from ambulatory prescriptions -->
        <div class="ar-services">
          <template
            v-for="presc in (item.consultation?.prescriptions ?? []).filter(p => p.type === 'AMBULATORY')"
            :key="presc.id"
          >
            <div v-for="svc in (presc.items ?? [])" :key="svc.id" class="ar-service-row">
              <q-icon name="las la-walking" size="13px" style="color: var(--st-ok); flex-shrink:0" />
              <span class="ar-service-name">{{ svc.service?.name }}</span>
            </div>
          </template>
          <div v-if="!(item.consultation?.prescriptions ?? []).some(p => p.type === 'AMBULATORY')" class="ar-no-services">
            Sem serviços detalhados
          </div>
        </div>

        <!-- Footer -->
        <div class="ar-card-foot">
          <q-btn
            unelevated no-caps
            icon="las la-file-invoice-dollar"
            label="Faturar"
            color="teal-8"
            style="border-radius: var(--r-sm); font-size: var(--fs-label); flex:1"
            @click="$router.push({ name: 'emitir-documento-form', params: { prescriptionId: item.consultation?.prescriptions?.[0]?.id } })"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useCommom } from "src/composables/commom";

const { loading, data } = useCommom("ambulatories");

const initials = (name) => {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
};

const fmtDate = (val) => val
  ? new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(val))
  : "—";
</script>

<style scoped lang="scss">
.ar-wrap { width: 100%; }

.ar-state {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 40px 0; color: var(--text-faint); font-size: var(--fs-body); line-height: var(--lh-body);
}

.ar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.ar-card {
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  overflow: hidden; display: flex; flex-direction: column;
  &:hover { background: var(--surface-2); border-color: var(--border-control); }
}

.ar-card-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; border-bottom: 1px solid var(--border-soft); background: var(--surface-2);
}
.ar-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #68d391, #38a169);
  color: #fff; font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.ar-patient-info { flex: 1; min-width: 0; }
.ar-patient-name {
  font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text-2);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ar-date {
  display: flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 2px;
}

.ar-services { padding: 10px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.ar-service-row {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 8px; border-radius: var(--r-sm); background: var(--surface-3);
}
.ar-service-name { flex: 1; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-2); font-weight: 500; }
.ar-no-services  { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); padding: 4px 0; }

.ar-card-foot {
  display: flex; align-items: center;
  padding: 12px 16px; border-top: 1px solid var(--border-soft); margin-top: auto;
}
</style>
