<template>
  <div>
    <div v-if="showNormal">

      <!-- Search -->
      <q-input
        class="fi"
        borderless clearable
        v-model="filter"
        label="Filtrar serviços..."
      >
        <template #prepend>
          <q-icon name="las la-search" size="16px" color="grey-5" />
        </template>
      </q-input>

      <!-- Loading -->
      <div v-if="loading" class="svc-loading">
        <q-spinner-dots color="primary" size="28px" />
      </div>

      <!-- Catalog -->
      <div v-else class="svc-catalog q-mt-xs">

        <template v-for="master in filteredCatalog" :key="master.id">
          <div v-if="masterHasServices(master)">

            <!-- Master category toggle -->
            <div class="master-header" @click="toggleMaster(master.id)">
              <span class="master-name">{{ master.name }}</span>
              <q-icon
                :name="isOpen(master.id) ? 'las la-angle-up' : 'las la-angle-down'"
                size="14px"
                color="grey-5"
              />
            </div>

            <!-- Subcategories + services -->
            <div v-show="isOpen(master.id) || !!filter">
              <template v-for="sub in master.subCategories" :key="sub.id">
                <div v-if="filteredServices(sub).length">
                  <div class="svc-section">{{ sub.name }}</div>

                  <div
                    v-for="svc in filteredServices(sub)"
                    :key="svc.id"
                    class="svc-row"
                    :class="{ 'svc-row--added': isAdded(svc.id) }"
                    @click="addToInvoice(svc)"
                  >
                    <div class="svc-info">
                      <div class="svc-name">{{ svc.name }}</div>
                    </div>
                    <div class="svc-right">
                      <div class="svc-price">{{ fmt(displayPrice(svc)) }}</div>
                      <div class="svc-btn">
                        <q-icon
                          :name="isAdded(svc.id) ? 'las la-check' : 'las la-plus'"
                          size="13px"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </template>
            </div>

          </div>
        </template>

        <!-- Empty search state -->
        <div v-if="filter && !filteredCatalog.some(masterHasServices)" class="svc-empty">
          <q-icon name="las la-search" size="28px" color="grey-4" />
          <div>Sem resultados para "{{ filter }}"</div>
        </div>

        <!-- Empty catalog -->
        <div v-if="!loading && !catalog.length" class="svc-empty">
          <q-icon name="las la-folder-open" size="28px" color="grey-4" />
          <div>Sem serviços disponíveis</div>
        </div>

      </div>
    </div>

    <div v-else>
      <ServiceIntern :intern-id="storeInvoice.form.beneficial.split('@')[1]" />
    </div>
  </div>
</template>

<script setup>
import { api } from "src/boot/axios";
import { useInvoiceStore } from "src/stores/invoice";
import { computed, onMounted, reactive, ref } from "vue";
import ServiceIntern from "./ServiceIntern.vue";

const filter = ref("");
const loading = ref(false);
const catalog = ref([]);
const storeInvoice = useInvoiceStore();

// Which master categories are expanded
const openIds = reactive(new Set());
const toggleMaster = (id) => {
  openIds.has(id) ? openIds.delete(id) : openIds.add(id);
};
const isOpen = (id) => openIds.has(id);

const showNormal = computed(() =>
  storeInvoice.form.asNormal ||
  (storeInvoice.form.beneficial && !storeInvoice.form.beneficial.includes("intern"))
);

const fmt = (val) =>
  new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val ?? 0);

const displayPrice = (svc) => {
  if (storeInvoice.form.beneficial === "protocol") {
    const pct = storeInvoice.form.customer?.protocol?.value ?? 0;
    return svc.unit_price - (svc.unit_price * pct) / 100;
  }
  return svc.unit_price;
};

const isAdded = (id) => storeInvoice.form.invoiceItems.some((item) => item.id === id);

const filteredServices = (sub) => {
  if (!filter.value) return sub.Service;
  const needle = filter.value.toLowerCase();
  return sub.Service.filter((s) => s.name.toLowerCase().includes(needle));
};

const masterHasServices = (master) =>
  master.subCategories.some((sub) => filteredServices(sub).length > 0);

const filteredCatalog = computed(() => catalog.value);

const addToInvoice = (svc) => {
  if (isAdded(svc.id)) return;
  if (svc.type === "PRODUCT") storeInvoice.products.push(svc);
  storeInvoice.form.invoiceItems.push({
    id: svc.id, name: svc.name, description: svc.description,
    quantity: 1, discount: svc.discount || 0,
    unit_price: displayPrice(svc),
    total: displayPrice(svc),
    category: svc.category, exam: svc.exam,
    imagiology: svc.imagiology, treatmentObservation: svc.treatmentObservation,
    Hospitalization: svc.Hospitalization, consultation: svc.consultation,
  });
};

onMounted(async () => {
  loading.value = true;
  try {
    const { data } = await api.get("services/catalog");
    catalog.value = data.data;
    // Open the first master category by default
    if (data.data.length) openIds.add(data.data[0].id);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">

/* ── Loading ── */
.svc-loading {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

/* ── Master category header ── */
.master-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 6px 5px;
  margin-top: 6px;
  border-bottom: 1.5px solid var(--border);
  cursor: pointer;
  user-select: none;
  transition: background 0.12s;
  border-radius: var(--r-sm) 6px 0 0;

  &:hover { background: var(--surface-3); }
}

.master-name {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text-3);
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

/* ── Subcategory section label ── */
.svc-section {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600;
  color: var(--text-faint);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  padding: 8px 4px 3px;
}

/* ── Service row ── */
.svc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 8px;
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: background 0.14s;
  margin-bottom: 1px;

  &:hover:not(.svc-row--empty) {
    background: var(--st-ok-tint);
    .svc-btn { opacity: 1; background: #32b989; color: #fff; }
    .svc-price { color: var(--st-ok-text); }
  }

  &.svc-row--added {
    background: rgba(50, 185, 137, 0.07);
    cursor: default;
    .svc-btn { opacity: 1; background: rgba(50, 185, 137, 0.15); color: var(--st-ok-text); }
    .svc-name { color: var(--st-ok-text); }
    .svc-price { color: var(--st-ok-text); }
  }

}

.svc-info { flex: 1; min-width: 0; }

.svc-name {
  font-size: var(--fs-body); line-height: var(--lh-body);
  color: var(--text-2);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.14s;
}

.svc-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.svc-price {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600;
  color: var(--text-3);
  white-space: nowrap;
  transition: color 0.14s;
}

.svc-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--surface-3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-faint);
  opacity: 0;
  flex-shrink: 0;
  transition: opacity 0.14s, background 0.14s, color 0.14s;
}

.svc-row.svc-row--added .svc-btn { opacity: 1; }

/* ── Empty state ── */
.svc-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 0;
  color: var(--text-faint);
  font-size: var(--fs-label); line-height: var(--lh-tight);
}
</style>
