<template>
  <div>
    <!-- Empty state -->
    <div v-if="!items.length" class="items-empty">
      <q-icon name="las la-file-invoice" size="32px" color="grey-4" />
      <div>Nenhum item adicionado</div>
    </div>

    <!-- Item list -->
    <div v-else class="items-list">
      <!-- Header -->
      <div class="items-header">
        <span class="ih-name">Descrição</span>
        <span class="ih-num">Preço</span>
        <span class="ih-num">Qtd</span>
        <span class="ih-num">Desc.</span>
        <span class="ih-num">Total</span>
        <span class="ih-action" />
      </div>

      <!-- Rows -->
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="item-row"
      >
        <!-- Name -->
        <div class="ir-name">
          <div class="ir-name-text">{{ item.name }}</div>
          <div v-if="item.description" class="ir-desc">{{ item.description }}</div>
        </div>

        <!-- Unit price (editable) -->
        <div class="ir-num">
          <span class="ir-val">{{ fmt(item.unit_price) }}</span>
          <q-popup-edit v-model="item.unit_price" title="Alterar preço" buttons persistent v-slot="scope">
            <q-input type="number" v-model.number="scope.value" step="0.01" dense autofocus />
          </q-popup-edit>
        </div>

        <!-- Quantity (editable) -->
        <div class="ir-num">
          <span class="ir-val">{{ item.quantity }}</span>
          <q-popup-edit v-model="item.quantity" title="Alterar quantidade" buttons persistent v-slot="scope">
            <q-input type="number" v-model.number="scope.value" dense autofocus />
          </q-popup-edit>
        </div>

        <!-- Discount (editable) -->
        <div class="ir-num">
          <span class="ir-val ir-discount">{{ fmt(item.discount) }}</span>
          <q-popup-edit v-model="item.discount" title="Alterar desconto" buttons persistent v-slot="scope">
            <q-input type="number" v-model.number="scope.value" step="0.01" dense autofocus />
          </q-popup-edit>
        </div>

        <!-- Total -->
        <div class="ir-num">
          <span class="ir-total">{{ fmt(item.quantity * (item.unit_price - item.discount)) }}</span>
        </div>

        <!-- Remove -->
        <div class="ir-action">
          <q-btn flat round dense size="xs" icon="las la-times" color="grey-4" @click="removeToTable(index)" class="remove-btn" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useSearch } from "src/composables/search";

const { filter } = useSearch("services");
const items = defineModel("items");
const search = ref(null);
const options = ref([]);

const fmt = (val) =>
  new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val ?? 0);

const filterFunction = async (val, update) => {
  try {
    if (!val) return;
    update(async () => {
      const data = await filter(val);
      search.value = null;
      options.value = data;
    });
  } catch (error) {}
};

const removeToTable = (index) => {
  items.value.splice(index, 1);
};
</script>

<style scoped lang="scss">
/* ── Empty state ── */
.items-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 0;
  color: var(--text-faint);
  font-size: var(--fs-label); line-height: var(--lh-tight);
}

/* ── List ── */
.items-list {
  display: flex;
  flex-direction: column;
}

/* ── Header row ── */
.items-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px 6px;
  border-bottom: 1.5px solid var(--border);
  margin-bottom: 2px;
}

.ih-name {
  flex: 1;
  min-width: 0;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text-faint);
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.ih-num {
  width: 72px;
  text-align: right;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text-faint);
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.ih-action {
  width: 28px;
  flex-shrink: 0;
}

/* ── Item row ── */
.item-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: var(--r-sm);
  transition: background 0.12s;

  &:hover {
    background: var(--surface-3);
    .remove-btn { opacity: 1; }
  }
}

.ir-name {
  flex: 1;
  min-width: 0;
}

.ir-name-text {
  font-size: var(--fs-body); line-height: var(--lh-body);
  font-weight: 500;
  color: var(--text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ir-desc {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  color: var(--text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ir-num {
  width: 72px;
  text-align: right;
  cursor: pointer;
  border-radius: var(--r-sm);
  padding: 2px 4px;
  transition: background 0.12s;

  &:hover { background: var(--surface-3); }
}

.ir-val {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  color: var(--text-3);
}

.ir-discount {
  color: var(--danger);
}

.ir-total {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600;
  color: var(--text-2);
}

.ir-action {
  width: 28px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

.remove-btn {
  opacity: 0;
  transition: opacity 0.14s;
  color: var(--text-faint) !important;

  &:hover { color: var(--danger) !important; }
}
</style>
