<template>
  <div class="or-wrap">

    <!-- Loading -->
    <div v-if="loading" class="or-state">
      <q-spinner-dots color="primary" size="24px" />
    </div>

    <!-- Empty -->
    <div v-else-if="!pending.length" class="or-state">
      <q-icon name="las la-procedures" size="32px" style="color:var(--text-disabled)" />
      <span>Sem pedidos de observação pendentes</span>
    </div>

    <!-- Cards -->
    <div v-else class="or-grid">
      <div v-for="item in pending" :key="item.id" class="or-card">

        <!-- Header -->
        <div class="or-card-head">
          <div class="or-avatar">{{ initials(item.consultation?.screening?.customer?.name) }}</div>
          <div class="or-patient-info">
            <div class="or-patient-name">{{ item.consultation?.screening?.customer?.name ?? '—' }}</div>
            <div class="or-service">
              <q-icon name="las la-procedures" size="12px" />
              {{ item.service?.name ?? '—' }}
            </div>
          </div>
        </div>

        <!-- Details -->
        <div class="or-body">
          <div v-if="item.service?.description" class="or-row">
            <span class="or-label">Descrição</span>
            <span class="or-val">{{ item.service.description }}</span>
          </div>
          <div class="or-row">
            <span class="or-label">Preço</span>
            <span class="or-val">{{ item.service?.unit_price != null ? fmtPrice(item.service.unit_price) : '—' }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="or-card-foot">
          <q-btn
            unelevated no-caps
            icon="las la-file-invoice-dollar"
            label="Faturar"
            color="orange-8"
            style="border-radius: var(--r-sm); font-size: var(--fs-label); flex:1"
            @click="$router.push({ name: 'emitir-documento-form', params: { observationId: item.id } })"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useCommom } from "src/composables/commom";

const { loading, data } = useCommom("observations");

const pending = computed(() => (data ?? []).filter((item) => !item.paid));

const initials = (name) => {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
};

const fmtPrice = (v) =>
  new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2 }).format(v ?? 0) + " Kz";
</script>

<style scoped lang="scss">
.or-wrap { width: 100%; }

.or-state {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 40px 0; color: var(--text-faint); font-size: var(--fs-body); line-height: var(--lh-body);
}

.or-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.or-card {
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  overflow: hidden; display: flex; flex-direction: column;
  &:hover { background: var(--surface-2); border-color: var(--border-control); }
}

.or-card-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; border-bottom: 1px solid var(--border-soft); background: var(--surface-2);
}
.or-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #f6ad55, #ed8936);
  color: #fff; font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.or-patient-info { flex: 1; min-width: 0; }
.or-patient-name {
  font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text-2);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.or-service {
  display: flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 2px;
}

.or-body { padding: 10px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.or-row  { display: flex; justify-content: space-between; align-items: center; }
.or-label { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }
.or-val   { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 500; color: var(--text-2); }

.or-card-foot {
  display: flex; align-items: center;
  padding: 12px 16px; border-top: 1px solid var(--border-soft); margin-top: auto;
}
</style>
