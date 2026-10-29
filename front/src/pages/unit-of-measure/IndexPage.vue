<template>
  <div>
    <!-- ── Cabeçalho ──────────────────────────────────────────────── -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h6 text-weight-semibold">Unidades de medida</div>
        <div class="text-caption text-grey-5">Gerir unidades usadas em materiais e compras</div>
      </div>
      <q-btn
        unelevated no-caps color="teal-7" icon="las la-plus" label="Nova unidade"
        :to="{ name: 'nova-unidade' }"
      />
    </div>

    <!-- ── Pesquisa ───────────────────────────────────────────────── -->
    <div class="form-card q-mb-md" style="max-width: 960px; padding: 8px 14px">
      <q-input
        v-model="search"
        borderless dense
        placeholder="Pesquisar unidade…"
      >
        <template #prepend><q-icon name="las la-search" color="grey-5" size="18px" /></template>
        <template #append>
          <q-icon v-if="search" name="las la-times" color="grey-5" size="16px"
            class="cursor-pointer" @click="search = ''" />
        </template>
      </q-input>
    </div>

    <!-- ── Tabela ─────────────────────────────────────────────────── -->
    <div class="form-card" style="padding: 0">

      <div v-if="!store.loading && !filtered.length" class="empty-state">
        <q-icon name="las la-ruler" size="40px" color="grey-4" />
        <div class="text-grey-5 q-mt-sm">Nenhuma unidade encontrada</div>
      </div>

      <div v-else-if="store.loading" class="q-pa-md q-gutter-y-sm">
        <q-skeleton v-for="n in 6" :key="n" height="44px" square />
      </div>

      <template v-else>
        <div class="table-header">
          <div class="col-abbr  text-caption text-grey-5 text-uppercase">Abrev.</div>
          <div class="col-name  text-caption text-grey-5 text-uppercase">Nome</div>
          <div class="col-kind  text-caption text-grey-5 text-uppercase">Tipo</div>
          <div class="col-cat   text-caption text-grey-5 text-uppercase">Categoria</div>
          <div class="col-base  text-caption text-grey-5 text-uppercase">Referência</div>
          <div class="col-actions" />
        </div>

        <div
          v-for="(unit, i) in filtered"
          :key="unit.id"
          class="unit-row"
          :class="{ 'unit-row--alt': i % 2 === 1 }"
        >
          <div class="col-abbr">
            <span class="abbr-chip">{{ unit.abbreviation }}</span>
          </div>
          <div class="col-name">{{ unit.name }}</div>
          <div class="col-kind">
            <span class="kind-chip" :class="unit.kind === 'measure' ? 'kind-chip--measure' : 'kind-chip--count'">
              {{ unit.kind === 'measure' ? 'medida' : 'contagem' }}
            </span>
          </div>
          <div class="col-cat">
            <span v-if="unit.category" class="cat-chip">{{ unit.category }}</span>
            <span v-else class="text-grey-4">—</span>
          </div>
          <div class="col-base">
            <span v-if="unit.baseUnit" class="text-grey-6 text-caption">
              ×{{ unit.factor }}&nbsp;{{ unit.baseUnit.abbreviation }}
            </span>
            <span v-else class="base-badge">base</span>
          </div>
          <div class="col-actions">
            <q-btn flat round dense size="sm" icon="las la-pen" color="grey-6"
              :to="{ name: 'editar-unidade', params: { id: unit.id } }">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense size="sm" icon="las la-trash" color="red-4"
              @click="confirmDelete(unit)">
              <q-tooltip>Remover</q-tooltip>
            </q-btn>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useUnitOfMeasureStore } from "src/stores/unit-of-measure";

const store = useUnitOfMeasureStore();
const $q    = useQuasar();
const search= ref("");

onMounted(() => store.index());

const filtered = computed(() => {
  const q = search.value.toLowerCase();
  if (!q) return store.units;
  return store.units.filter(
    (u) => u.name.toLowerCase().includes(q) || u.abbreviation.toLowerCase().includes(q)
  );
});

const confirmDelete = (unit) => {
  $q.dialog({
    title: "Remover unidade",
    message: `Tem a certeza que quer remover "${unit.name}"?`,
    cancel: { flat: true, label: "Cancelar" },
    ok: { unelevated: true, color: "red-7", label: "Remover" },
    persistent: true,
  }).onOk(() => store.destroy(unit.id));
};
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
}

.table-header,
.unit-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
}

.table-header {
  border-bottom: 2px solid var(--border);
  background: var(--surface-2);
  padding-top: 8px;
  padding-bottom: 8px;
}

.unit-row {
  border-bottom: 1px solid var(--border-soft);
  &:last-child { border-bottom: none; }
  &--alt { background: var(--surface-2); }
}

.col-abbr    { flex: 0 0 72px; }
.col-name    { flex: 1; font-size: var(--fs-body); line-height: var(--lh-body); color: var(--text); }
.col-kind    { flex: 0 0 90px; }
.col-cat     { flex: 0 0 140px; }
.col-base    { flex: 0 0 100px; }
.col-actions { display: flex; gap: 4px; margin-left: auto; }

.abbr-chip {
  display: inline-block;
  background: var(--st-ok-tint);
  color: var(--st-ok-text);
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 3px 10px;
  border-radius: var(--r-pill);
  text-transform: lowercase;
}

.kind-chip {
  display: inline-block;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--r-pill);
  text-transform: capitalize;

  &--measure { background: var(--st-info-tint); color: var(--chip-info); }
  &--count   { background: var(--st-warn-tint); color: var(--st-warn-text); }
}

.cat-chip {
  display: inline-block;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--r-pill);
  background: var(--surface-3);
  color: var(--text-muted);
  text-transform: capitalize;
}

.base-badge {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--st-ok-text);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
</style>
