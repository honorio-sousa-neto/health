<template>
  <div class="hp-wrap">

    <!-- Header -->
    <div class="hp-header">
      <div>
        <div class="hp-title">
          <q-icon name="las la-history" size="17px" style="color: var(--st-purple)" />
          Histórico de Exames
        </div>
        <div class="hp-sub">Resultados registados e enviados ao médico</div>
      </div>
      <div class="hp-header-right">
        <q-input
          dense outlined v-model="search"
          placeholder="Pesquisar paciente ou médico…"
          style="min-width:220px; background:var(--surface); border-radius: var(--r-sm)"
          debounce="300"
        >
          <template #prepend><q-icon name="las la-search" size="14px" color="grey-5" /></template>
        </q-input>
        <q-btn
          unelevated no-caps icon="las la-arrow-left" label="Pedidos"
          color="grey-7"
          style="border-radius: var(--r-sm); font-size: var(--fs-label)"
          @click="$router.push({ name: 'pedidos-exame' })"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="hp-state">
      <q-spinner-dots color="purple" size="24px" />
    </div>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="hp-state">
      <q-icon name="las la-history" size="36px" style="color:var(--text-disabled)" />
      <span class="hp-empty-title">Sem resultados registados</span>
      <span class="hp-empty-sub">O histórico de exames analisados aparece aqui</span>
    </div>

    <!-- Cards -->
    <div v-else class="hp-grid">
      <div v-for="item in filtered" :key="item.id" class="hp-card">

        <!-- Card head -->
        <div class="hc-head">
          <div class="hc-avatar">{{ initials(item.screening?.customer?.name) }}</div>
          <div class="hc-identity">
            <div class="hc-name">{{ item.screening?.customer?.name ?? '—' }}</div>
            <div class="hc-doctor">
              <q-icon name="las la-user-md" size="11px" />
              Dr. {{ item.doctor?.name ?? '—' }}
            </div>
          </div>
          <span class="hc-stage-chip" :class="stageCls(item.stage)">
            {{ stageLabel(item.stage) }}
          </span>
        </div>

        <!-- Exam results -->
        <div class="hc-exams">
          <div v-for="exam in (item.exams ?? [])" :key="exam.id" class="hc-exam-row">
            <q-icon
              name="las la-vial" size="12px"
              :style="`color:${resultColor(exam)}`"
            />
            <span class="hc-exam-name">{{ exam.exam?.name ?? '—' }}</span>
            <span v-if="exam.resultColor" class="hc-result-chip" :class="exam.resultColor === 'GREEN' ? 'hrc--normal' : 'hrc--altered'">
              {{ exam.resultColor === 'GREEN' ? 'Normal' : 'Alterado' }}
            </span>
            <span v-else-if="exam.paid" class="hc-result-chip hrc--pending">
              Sem resultado
            </span>
          </div>
          <div v-if="!item.exams?.length" class="hc-no-exams">Sem exames registados</div>
        </div>

        <!-- Footer -->
        <div class="hc-footer">
          <div class="hc-date">
            <q-icon name="las la-calendar" size="12px" />
            {{ fmtDate(item.createdAt) }}
          </div>
          <q-btn
            flat no-caps dense
            icon="las la-eye"
            label="Ver resultados"
            color="purple-8"
            style="font-size: var(--fs-label)"
            @click="$router.push({ name: 'ver-exame', params: { id: item.id } })"
          />
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { api } from "src/boot/axios";

const loading = ref(false);
const items   = ref([]);
const search  = ref("");

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("request-exams/view-results");
    items.value = data.data ?? [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const filtered = computed(() => {
  const s = search.value.trim().toLowerCase();
  if (!s) return items.value;
  return items.value.filter(
    (i) =>
      i.screening?.customer?.name?.toLowerCase().includes(s) ||
      i.doctor?.name?.toLowerCase().includes(s),
  );
});

const stageLabel = (stage) => {
  if (stage === "EXAM_RESULT") return "Concluído";
  if (stage === "CONSULTING_CLINIC") return "Em análise";
  return stage ?? "—";
};

const stageCls = (stage) =>
  stage === "EXAM_RESULT" ? "sc--done" : "sc--running";

const resultColor = (exam) => {
  if (exam.resultColor === "GREEN") return "#32b989";
  if (exam.resultColor === "RED")   return "#e53e3e";
  return "#cbd5e0";
};

const initials = (name) =>
  name?.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("") ?? "?";

const fmtDate = (val) =>
  val
    ? new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(val))
    : "—";
</script>

<style scoped lang="scss">
.hp-wrap {
  display: flex; flex-direction: column; gap: 20px;
  padding: 20px 24px; min-height: 100%;
}

/* Header */
.hp-header {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
}
.hp-title {
  display: flex; align-items: center; gap: 8px;
  font-size: var(--fs-section); line-height: var(--lh-tight); font-weight: 700; color: var(--text);
}
.hp-sub { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 3px; margin-left: 25px; }
.hp-header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

/* States */
.hp-state {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 80px 0; color: var(--text-faint); font-size: var(--fs-body); line-height: var(--lh-body);
}
.hp-empty-title { font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 600; color: var(--text-3); }
.hp-empty-sub   { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }

/* Grid */
.hp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

/* Card */
.hp-card {
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border);
  overflow: hidden; display: flex; flex-direction: column;
  &:hover { background: var(--surface-2); border-color: var(--border-control); }
}

/* Card head */
.hc-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 14px; border-bottom: 1px solid var(--border-soft); background: var(--surface-2);
}
.hc-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #b794f4, var(--st-purple));
  color: #fff; font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.hc-identity { flex: 1; min-width: 0; }
.hc-name   {
  font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.hc-doctor {
  display: flex; align-items: center; gap: 4px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 2px;
}

/* Stage chip */
.hc-stage-chip {
  display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; padding: 3px 9px;
  border-radius: var(--r-pill); border: 1.5px solid transparent;
}
.sc--done    { color: var(--chip-ok); background: rgba(50,185,137,0.08);  border-color: rgba(50,185,137,0.25); }
.sc--running { color: var(--chip-purple); background: rgba(128,90,213,0.08);  border-color: rgba(128,90,213,0.25); }

/* Exams */
.hc-exams {
  padding: 10px 14px; display: flex; flex-direction: column; gap: 6px; flex: 1;
}
.hc-exam-row {
  display: flex; align-items: center; gap: 7px;
  padding: 5px 8px; border-radius: var(--r-sm); background: var(--surface-3);
}
.hc-exam-name {
  flex: 1; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-2); font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.hc-result-chip {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; padding: 2px 8px;
  border-radius: var(--r-pill); flex-shrink: 0;
}
.hrc--normal  { color: var(--chip-ok); background: rgba(50,185,137,0.1); }
.hrc--altered { color: var(--danger); background: rgba(229,62,62,0.1); }
.hrc--pending { color: var(--text-faint); background: var(--border); }
.hc-no-exams  { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); padding: 4px 0; }

/* Footer */
.hc-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-top: 1px solid var(--surface-3); margin-top: auto;
}
.hc-date {
  display: flex; align-items: center; gap: 5px;
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint);
}
</style>
