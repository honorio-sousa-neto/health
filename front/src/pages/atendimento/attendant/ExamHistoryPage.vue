<template>
  <div class="ehp-wrap">

    <!-- Toolbar -->
    <div class="ehp-toolbar">
      <div>
        <div class="ehp-title">Histórico de pedidos</div>
        <div class="ehp-sub">{{ billed.length }} pedido{{ billed.length !== 1 ? 's' : '' }} faturado{{ billed.length !== 1 ? 's' : '' }}</div>
      </div>
      <div class="ehp-search">
        <q-icon name="las la-search" size="15px" color="grey-5" />
        <input v-model="search" class="ehp-search-input" placeholder="Pesquisar paciente…" />
        <q-icon v-if="search" name="las la-times" size="14px" class="ehp-clear" color="grey-5" @click="search = ''" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="ehp-state">
      <q-spinner-dots color="primary" size="24px" />
    </div>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="ehp-state">
      <q-icon name="las la-history" size="32px" style="color:var(--text-disabled)" />
      <span>Nenhum pedido faturado{{ search ? ' para esta pesquisa' : '' }}</span>
    </div>

    <!-- Table -->
    <div v-else class="ehp-table">
      <div class="ehp-head">
        <span class="hh-cell hh-patient">Paciente</span>
        <span class="hh-cell hh-doctor">Médico</span>
        <span class="hh-cell hh-exams">Exames</span>
        <span class="hh-cell hh-status">Estado</span>
        <span class="hh-cell hh-date">Data</span>
      </div>
      <div v-for="item in filtered" :key="item.id" class="ehp-row">
        <span class="hr-cell hr-patient">
          <div class="hr-avatar">{{ initials(item.screening?.customer?.name) }}</div>
          <span>{{ item.screening?.customer?.name ?? '—' }}</span>
        </span>
        <span class="hr-cell hr-doctor">{{ item.doctor?.name ?? '—' }}</span>
        <span class="hr-cell hr-exams">
          <div class="hr-exam-list">
            <span
              v-for="exam in item.exams"
              :key="exam.id"
              class="hr-exam-chip"
              :class="exam.paid ? 'hr-exam-chip--paid' : 'hr-exam-chip--pending'"
            >
              {{ exam.exam?.name }}
            </span>
          </div>
        </span>
        <span class="hr-cell hr-status">
          <span v-if="item.exams.every((e) => e.paid)" class="status-chip status-chip--done">
            <q-icon name="las la-check" size="11px" />
            Tudo faturado
          </span>
          <span v-else class="status-chip status-chip--partial">
            <q-icon name="las la-exclamation" size="11px" />
            Parcialmente faturado
          </span>
        </span>
        <span class="hr-cell hr-date">{{ fmtDate(item.createdAt) }}</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useCommom } from "src/composables/commom";

const { loading, data } = useCommom("request-exams");
const search = ref("");

/* Consultations where at least one exam has been paid */
const billed = computed(() =>
  (data ?? []).filter((item) => item.exams?.some((e) => e.paid))
);

const filtered = computed(() => {
  if (!search.value.trim()) return billed.value;
  const q = search.value.toLowerCase();
  return billed.value.filter((item) =>
    item.screening?.customer?.name?.toLowerCase().includes(q) ||
    item.doctor?.name?.toLowerCase().includes(q)
  );
});

const initials = (name) => {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
};

const fmtDate = (d) => {
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-AO", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d));
};
</script>

<style scoped lang="scss">
.ehp-wrap { display: flex; flex-direction: column; gap: 16px; }

.ehp-toolbar {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
}
.ehp-title { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text); }
.ehp-sub   { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 2px; }

.ehp-search {
  display: flex; align-items: center; gap: 6px;
  background: var(--surface); border: 1.5px solid var(--border-strong); border-radius: var(--r-sm);
  padding: 6px 10px; min-width: 220px;
  &:focus-within { border-color: var(--st-info); }
}
.ehp-search-input {
  border: none; outline: none; background: transparent;
  font-size: var(--fs-body); line-height: var(--lh-body); color: var(--text-2); flex: 1; font-family: inherit;
  &::placeholder { color: var(--text-disabled); }
}
.ehp-clear { cursor: pointer; }

.ehp-state {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 48px 0; color: var(--text-faint); font-size: var(--fs-body); line-height: var(--lh-body);
}

/* Table */
.ehp-table {
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border); overflow: hidden;
}
.ehp-head {
  display: grid;
  grid-template-columns: 1.4fr 1fr 2fr 140px 100px;
  padding: 14px 16px; background: var(--surface-3); border-bottom: 1px solid var(--border);
}
.hh-cell {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 800; color: var(--text-faint);
  text-transform: uppercase; letter-spacing: 0.6px;
}
.ehp-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr 2fr 140px 100px;
  padding: 14px 16px; border-bottom: 1px solid var(--surface-3); align-items: center;
  transition: background 0.12s;
  &:last-child { border-bottom: none; }
  &:hover { background: var(--surface-2); }
}
.hr-cell { font-size: var(--fs-body); line-height: var(--lh-body); color: var(--text-2); }

.hr-patient {
  display: flex; align-items: center; gap: 8px; font-weight: 500;
}
.hr-avatar {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #4299e1, var(--st-info));
  color: #fff; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.hr-doctor { color: var(--text-muted); font-size: var(--fs-label); line-height: var(--lh-tight); }
.hr-date   { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }
.hr-actions { display: flex; justify-content: flex-end; }

.hr-exam-list { display: flex; flex-wrap: wrap; gap: 4px; }
.hr-exam-chip {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 500; padding: 2px 8px; border-radius: var(--r-sm);
}
.hr-exam-chip--paid    { color: var(--chip-ok); background: rgba(50,185,137,0.1);  border: 1px solid rgba(50,185,137,0.25); }
.hr-exam-chip--pending { color: var(--chip-warn); background: rgba(237,137,54,0.1); border: 1px solid rgba(237,137,54,0.25); }

.status-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; padding: 3px 10px; border-radius: var(--r-pill);
}
.status-chip--done    { color: var(--chip-ok); background: rgba(50,185,137,0.08);  border: 1px solid rgba(50,185,137,0.3); }
.status-chip--partial { color: var(--chip-info); background: rgba(66,153,225,0.08); border: 1px solid rgba(66,153,225,0.3); }
</style>
