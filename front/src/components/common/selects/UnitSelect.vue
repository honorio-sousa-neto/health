<template>
  <q-select
    class="fi"
    borderless
    v-model="model"
    :options="grouped"
    option-value="id"
    emit-value
    map-options
    :label="label"
    :dense="dense"
    :rules="rules"
    lazy-rules
    clearable
    use-input
    input-debounce="200"
    :loading="store.loading"
    popup-content-class="fi-popup"
    @filter="onFilter"
  >
    <!-- valor seleccionado -->
    <template #selected-item="scope">
      <span class="unit-chip" :class="scope.opt.kind === 'count' ? 'unit-chip--count' : ''">
        {{ scope.opt.abbreviation }}
      </span>
      <span class="unit-name">{{ scope.opt.name }}</span>
    </template>

    <!-- cada item do dropdown -->
    <template #option="scope">
      <!-- cabeçalho de grupo -->
      <template v-if="scope.opt.__header">
        <div class="group-header">{{ scope.opt.label }}</div>
      </template>

      <!-- opção normal -->
      <q-item v-else v-bind="scope.itemProps" dense class="unit-option">
        <q-item-section side class="unit-option__abbr">
          <span class="unit-chip" :class="scope.opt.kind === 'count' ? 'unit-chip--count' : ''">
            {{ scope.opt.abbreviation }}
          </span>
        </q-item-section>
        <q-item-section>
          <q-item-label class="unit-option__name">{{ scope.opt.name }}</q-item-label>
          <q-item-label v-if="scope.opt.kind === 'measure' && scope.opt.baseUnit" caption>
            1 {{ scope.opt.abbreviation }} = {{ scope.opt.factor }} {{ scope.opt.baseUnit.abbreviation }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>

    <template #no-option>
      <q-item dense>
        <q-item-section class="text-grey-5 text-caption">Sem resultados</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useUnitOfMeasureStore } from "src/stores/unit-of-measure";

const store = useUnitOfMeasureStore();
const model = defineModel();

defineProps({
  label: { type: String, default: "Unidade" },
  dense: { type: Boolean, default: false },
  rules: { type: Array, default: () => [] },
});

const query = ref("");

const CATEGORY_ORDER = [
  "peso", "volume", "comprimento", "área",
  "forma farmacêutica", "quantidade",
];

const buildGrouped = (units) => {
  const groups = {};
  for (const u of units) {
    const key = u.category ?? "outras";
    if (!groups[key]) groups[key] = [];
    groups[key].push(u);
  }

  const keys = [
    ...CATEGORY_ORDER.filter((k) => groups[k]),
    ...Object.keys(groups).filter((k) => !CATEGORY_ORDER.includes(k)),
  ];

  const result = [];
  for (const cat of keys) {
    result.push({ __header: true, label: cat, disable: true });
    result.push(...groups[cat]);
  }
  return result;
};

const grouped = computed(() => {
  const q = query.value.toLowerCase();
  const base = q
    ? store.units.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.abbreviation.toLowerCase().includes(q) ||
          (u.category ?? "").toLowerCase().includes(q)
      )
    : store.units;
  return buildGrouped(base);
});

onMounted(async () => {
  if (!store.units.length) await store.index();
});

const onFilter = (val, update) => {
  query.value = val;
  update();
};
</script>

<style scoped lang="scss">
/* A cópia local de `.fi` saiu; a definição vive no app.scss. */

/* A abreviatura. Era pílula pastel — verde para medida, âmbar para contagem —
   e a cor não dizia nada que o nome ao lado já não dissesse. Fica o peso, que
   chega para a destacar do nome sem gastar duas cores da escala de estado. */
.unit-chip {
  display: inline-flex;
  align-items: center;
  color: var(--text-2);
  font-size: var(--fs-label);
  font-weight: var(--fw-forte);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.3px;
  margin-right: 6px;
  flex-shrink: 0;
  white-space: nowrap;

}

.unit-name {
  font-size: var(--fs-body);
  color: var(--text);
}

/* cabeçalho de grupo no dropdown */
.group-header {
  padding: 10px 16px 3px;
  font-size: var(--fs-label);
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--text-faint);
  border-top: 1px solid var(--border-soft);

  &:first-child { border-top: none; padding-top: 6px; }
}

/* item de opção */
.unit-option {
  padding-left: 16px;
}

.unit-option__abbr {
  min-width: 52px;
  padding-right: 8px;
}

.unit-option__name {
  font-size: var(--fs-body);
  color: var(--text);
}
</style>
