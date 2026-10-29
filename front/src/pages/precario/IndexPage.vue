<template>
  <div class="prc-page">
    <Breadcrumbs>
      <template #children>
        <q-breadcrumbs-el
          label="Preçário"
          active-class="text-h6 text-weight-regular text-teal-8"
          :to="{ name: 'list-precarios' }"
        />
      </template>
    </Breadcrumbs>

    <!-- Master category tabs -->
    <div class="cat-tabs-wrap">
      <div v-if="loading" class="cat-tabs">
        <div v-for="n in 5" :key="n" class="cat-tab-skel">
          <q-skeleton width="90px" height="34px" style="border-radius: var(--r-pill)" />
        </div>
      </div>
      <div v-else class="cat-tabs">
        <button
          v-for="cat in catalog"
          :key="cat.id"
          class="cat-tab"
          :class="{ active: selectedId === cat.id }"
          @click="selectedId = cat.id"
        >
          <q-icon :name="catIcon(cat.name)" size="14px" />
          {{ cat.name }}
          <span class="ct-badge">{{ countServices(cat) }}</span>
        </button>
      </div>
    </div>

    <!-- Content area -->
    <div class="prc-content">

      <div v-if="loading" class="prc-state">
        <q-spinner-dots color="teal-6" size="28px" />
      </div>

      <div v-else-if="!selected" class="prc-state">
        <q-icon name="las la-tags" size="36px" color="grey-4" />
        <span>Selecione uma área clínica</span>
      </div>

      <div v-else>
        <!-- Sub-category sections -->
        <div
          v-for="sub in selected.subCategories"
          :key="sub.id"
          class="sub-section"
        >
          <!-- Sub-header -->
          <div class="sub-header">
            <div class="sh-dot" />
            {{ sub.name }}
            <span class="sh-count">{{ sub.Service?.length ?? 0 }}</span>
          </div>

          <!-- Services table -->
          <div class="prc-card">
            <div class="prc-scroll">
              <div class="prc-header" :style="gridStyle">
                <span class="ph-name">Serviço</span>
                <span class="ph-price">Preço Base</span>
                <span
                  v-for="p in protocols"
                  :key="p.id"
                  class="ph-proto"
                >
                  {{ p.name }}
                  <span class="ph-pct">{{ p.value }}%</span>
                </span>
              </div>

              <div
                v-for="svc in sub.Service"
                :key="svc.id"
                class="prc-row"
                :style="gridStyle"
              >
                <span class="pr-name">{{ svc.name }}</span>
                <span class="pr-price">{{ fmt(svc.unit_price) }} Kz</span>
                <span
                  v-for="p in protocols"
                  :key="p.id"
                  class="pr-proto"
                >
                  <span>{{ fmt(svc.unit_price * (1 - p.value / 100)) }} Kz</span>
                  <span class="pr-save">−{{ fmt(svc.unit_price * p.value / 100) }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import { useProtocolStore } from "src/stores/protocol";
import { api } from "src/boot/axios";
import { ref, computed, reactive, onMounted } from "vue";

const protocolStore = useProtocolStore();
const protocols     = reactive([]);
const catalog       = ref([]);
const loading       = ref(false);
const selectedId    = ref(null);

const selected = computed(() => catalog.value.find((c) => c.id === selectedId.value) ?? null);

const countServices = (cat) =>
  cat.subCategories?.reduce((acc, s) => acc + (s.Service?.length ?? 0), 0) ?? 0;

const ICONS = {
  enfermaria: "las la-hospital",
  laboratório: "las la-flask",
  estomatologia: "las la-tooth",
  radiologia: "las la-x-ray",
  ecografia: "las la-heartbeat",
};
const catIcon = (name) => {
  const key = Object.keys(ICONS).find((k) => (name ?? "").toLowerCase().includes(k));
  return key ? ICONS[key] : "las la-tags";
};

const fmt = (val) =>
  new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(val) || 0);

const gridStyle = computed(() => {
  const protoCols = protocols.map(() => "minmax(130px, 1fr)").join(" ");
  return `grid-template-columns: minmax(180px, 2fr) 130px ${protoCols}`;
});

onMounted(async () => {
  loading.value = true;
  try {
    const [catRes, protoRes] = await Promise.all([
      api.get("services/catalog"),
      protocolStore.index(),
    ]);
    catalog.value = catRes.data.data ?? [];
    protocols.push(...protocolStore.data.data);
    if (catalog.value.length) selectedId.value = catalog.value[0].id;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.prc-page {
  display: flex; flex-direction: column; gap: 0;
  padding-bottom: 32px;
}

/* ── Category tabs ── */
.cat-tabs-wrap {
  padding: 16px 16px 0;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.cat-tabs {
  display: flex; gap: 4px; overflow-x: auto;
  padding-bottom: 0;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}
.cat-tab-skel { padding-bottom: 12px; }

.cat-tab {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 16px 10px; border: none; background: transparent;
  font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 600; color: var(--text-muted); cursor: pointer;
  white-space: nowrap; position: relative;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
  border-radius: 0;

  &:hover { color: var(--st-info-text); }

  &.active {
    color: var(--st-teal-text);
    border-bottom-color: var(--st-teal);
  }
}
.ct-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 6px; border-radius: var(--r-pill);
  background: var(--border); color: var(--text-faint);
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700;

  .active & { background: rgba(13,148,136,0.1); color: var(--st-teal-text); }
}

/* ── Content ── */
.prc-content {
  padding: 20px 16px;
  display: flex; flex-direction: column; gap: 24px;
}

.prc-state {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 60px 0; color: var(--text-faint); font-size: var(--fs-body); line-height: var(--lh-body);
}

/* ── Sub-section ── */
.sub-section { display: flex; flex-direction: column; gap: 10px; }

.sub-header {
  display: flex; align-items: center; gap: 8px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-faint);
  text-transform: uppercase; letter-spacing: 1px;
}
.sh-dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--st-teal); flex-shrink: 0;
}
.sh-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px; border-radius: var(--r-pill);
  background: rgba(13,148,136,0.1); color: var(--st-teal-text);
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; letter-spacing: 0;
}

/* ── Price card ── */
.prc-card {
  background: var(--surface); border-radius: var(--r-control);
  border: 1px solid var(--border); overflow: hidden;
}

.prc-scroll { overflow-x: auto; min-width: 0; }

.prc-header {
  display: grid; padding: 8px 16px;
  border-bottom: 1px solid var(--border-soft); gap: 8px;
  min-width: max-content; background: var(--surface-3);
}
.prc-header span {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-faint);
  text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap;
}
.ph-price { text-align: right; }
.ph-proto {
  text-align: right; display: flex; flex-direction: column;
  align-items: flex-end; gap: 1px;
}
.ph-pct {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--st-teal-text);
  background: rgba(13,148,136,0.10); border-radius: var(--r-pill);
  padding: 1px 6px; text-transform: none; letter-spacing: 0;
}

.prc-row {
  display: grid; align-items: center; padding: 14px 16px;
  gap: 8px; border-bottom: 1px solid var(--surface-3);
  transition: background 0.12s; min-width: max-content;
  &:last-child { border-bottom: none; }
  &:hover { background: var(--surface-3); }
}

.pr-name {
  font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 500; color: var(--text-2);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pr-price {
  text-align: right; font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 600; color: var(--text-3); white-space: nowrap;
}
.pr-proto {
  text-align: right; display: flex; flex-direction: column;
  align-items: flex-end; gap: 1px; white-space: nowrap;
}
.pr-proto > span:first-child { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 600; color: var(--text-2); }
.pr-save { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 500; color: var(--st-teal-text); }
</style>
