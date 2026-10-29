<template>
  <div>
    <!-- Cards -->
    <div class="row q-col-gutter-md q-pa-md">
      <div class="col-md-4 col-sm-6 col-xs-12">
        <Card
          text="Entrada"
          :amount="entry"
          icon="las la-arrow-down"
          icon-color="#32b989"
          icon-bg="rgba(50,185,137,0.10)"
          amount-color="#32b989"
          actionable
          @action="openDialog('ENTRY')"
        />
      </div>
      <div class="col-md-4 col-sm-6 col-xs-12">
        <Card
          text="Saída"
          :amount="out"
          icon="las la-arrow-up"
          icon-color="#e53e3e"
          icon-bg="rgba(229,62,62,0.10)"
          amount-color="#e53e3e"
          actionable
          @action="openDialog('OUT')"
        />
      </div>
      <div class="col-md-4 col-sm-6 col-xs-12">
        <Card
          text="Saldo"
          :amount="balance"
          icon="las la-balance-scale"
          icon-color="#4299e1"
          icon-bg="rgba(66,153,225,0.10)"
          amount-color="#1a202c"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div class="q-px-md q-mb-sm">
      <Pagination
        v-model:page="query.page"
        v-model:perpage="query.perPage"
        :total-pages="query.totalPages || 1"
        :total="query.total || 0"
        @fetch="emit('pageChange', query.page)"
      />
    </div>

    <!-- History list -->
    <div class="history-wrap q-px-md">
      <div class="history-card">
        <!-- Toolbar -->
        <div class="hc-toolbar">
          <span class="hc-title">Histórico</span>
        </div>

        <!-- Empty -->
        <div v-if="!rows.length" class="hc-empty">
          <q-icon name="las la-receipt" size="32px" color="grey-4" />
          <div>Sem registos</div>
        </div>

        <!-- Rows -->
        <template v-else>
          <div class="hc-header">
            <span class="hch-desc">Descrição</span>
            <span class="hch-type">Tipo</span>
            <span class="hch-val">Valor</span>
          </div>

          <div
            v-for="row in rows"
            :key="row.id"
            class="hc-row"
          >
            <div class="hcr-desc">
              <div class="hcr-desc-icon" :class="row.type === 'ENTRY' ? 'icon-in' : 'icon-out'">
                <q-icon :name="row.type === 'ENTRY' ? 'las la-arrow-down' : 'las la-arrow-up'" size="13px" />
              </div>
              <span>{{ row.description || '—' }}</span>
            </div>
            <div class="hcr-type">
              <span class="type-badge" :class="row.type === 'ENTRY' ? 'badge-in' : 'badge-out'">
                {{ row.type === 'ENTRY' ? 'Entrada' : 'Saída' }}
              </span>
            </div>
            <div class="hcr-val" :class="row.type === 'ENTRY' ? 'val-in' : 'val-out'">
              {{ row.type === 'ENTRY' ? '+' : '−' }} {{ fmt(row.amount) }}
            </div>
          </div>
        </template>

      </div>
    </div>

    <!-- Dialog -->
    <q-dialog v-model="dialog" persistent>
      <div class="dialog-box">
        <div class="dialog-header">
          <span class="dialog-title">Novo registo</span>
          <q-btn flat round dense icon="las la-times" color="grey-5" v-close-popup />
        </div>
        <Form @saved="onSaved" :loading :initial-type="initialType" />
      </div>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Card from "./card.vue";
import Form from "./form.vue";
import Pagination from "src/components/common/pagination/Pagination.vue";
import { useCreateUpdate } from "src/composables/create-update";

const { create, loading } = useCreateUpdate("flows");
const dialog = ref(false);
const initialType = ref("ENTRY");

const props = defineProps({
  entry: { type: Number, default: 0 },
  out: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  destination: { type: String },
  rows: { type: Array, default: () => [] },
  query: { type: Object, default: () => ({ page: 1, totalPages: 1 }) },
});

const emit = defineEmits(["fetchAgain", "pageChange"]);

const fmt = (val) =>
  new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val ?? 0) + " Kz";

const openDialog = (type) => {
  initialType.value = type;
  dialog.value = true;
};

const changePage = (page) => emit("pageChange", page);

const onSaved = async (payload) => {
  const result = await create({ destination: props.destination, ...payload });
  if (result) {
    dialog.value = false;
    emit("fetchAgain");
  }
};
</script>

<style scoped lang="scss">
/* ── History card ── */
.history-wrap { padding-bottom: 16px; }

.history-card {
  background: var(--surface);
  border-radius: var(--r-control);
  border: 1px solid var(--border);
  overflow: hidden;
}

.hc-toolbar {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-soft);
}

.hc-title {
  font-size: var(--fs-body); line-height: var(--lh-body);
  font-weight: 700;
  color: var(--text-2);
}

/* ── Empty ── */
.hc-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 36px 0;
  color: var(--text-faint);
  font-size: var(--fs-label); line-height: var(--lh-tight);
}

/* ── Header ── */
.hc-header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-soft);
}

.hch-desc { flex: 1; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.6px; }
.hch-type { width: 90px; text-align: center; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.6px; }
.hch-val  { width: 140px; text-align: right; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.6px; }

/* ── Row ── */
.hc-row {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--surface-3);
  transition: background 0.12s;

  &:last-of-type { border-bottom: none; }
  &:hover { background: var(--surface-3); }
}

.hcr-desc {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--fs-body); line-height: var(--lh-body);
  color: var(--text-2);
  font-weight: 500;
  min-width: 0;

  span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
}

.hcr-desc-icon {
  width: 26px;
  height: 26px;
  border-radius: var(--r-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.icon-in  { background: rgba(50,185,137,0.10); color: var(--st-ok-text); }
.icon-out { background: rgba(229,62,62,0.10);  color: var(--danger); }

.hcr-type {
  width: 90px;
  display: flex;
  justify-content: center;
}

.type-badge {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--r-pill);
}
.badge-in  { color: var(--st-ok-text); background: rgba(50,185,137,0.10); }
.badge-out { color: var(--danger); background: rgba(229,62,62,0.10); }

.hcr-val {
  width: 140px;
  text-align: right;
  font-size: var(--fs-body); line-height: var(--lh-body);
  font-weight: 600;
}
.val-in  { color: var(--st-ok-text); }
.val-out { color: var(--danger); }


/* ── Dialog ── */
.dialog-box {
  background: var(--surface);
  border-radius: var(--r-panel);
  width: 420px;
  max-width: 95vw;
  padding: 20px 22px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.dialog-title {
  font-size: var(--fs-title); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text);
}
</style>
