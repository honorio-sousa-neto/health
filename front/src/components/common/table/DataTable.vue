<template>
  <div>
    <slot name="breadcrumbs" />

    <!-- Toolbar (only renders if slot has content) -->
    <div v-if="$slots.action" class="data-toolbar row items-center q-mb-md">
      <slot name="action" />
    </div>

    <!-- Pagination slot (above list) + selector de vista -->
    <div class="dt-bar">
      <div class="dt-bar__pag"><slot name="pagination" /></div>
      <div class="view-switch">
        <button
          class="view-switch__btn"
          :class="{ 'view-switch__btn--on': vista === 'grelha' }"
          @click="definirVista('grelha')"
        >
          <q-icon name="las la-th-large" size="17px" />
          <q-tooltip>Vista em grelha</q-tooltip>
        </button>
        <button
          class="view-switch__btn"
          :class="{ 'view-switch__btn--on': vista === 'tabela' }"
          @click="definirVista('tabela')"
        >
          <q-icon name="las la-list" size="17px" />
          <q-tooltip>Vista em tabela</q-tooltip>
        </button>
      </div>
    </div>

    <!-- Vista em grelha -->
    <div v-if="!loading && !erro && rows.length && vista === 'grelha'" class="cards-grid q-mt-md">
      <template v-for="row in rows" :key="row.id">
        <!-- Custom item slot (override) -->
        <slot v-if="$slots.item" name="item" :props="{ row }" />

        <!-- Default card -->
        <div v-else class="data-card">
          <div class="card-body">
            <div class="card-avatar">
              {{ getInitials(resolveField(row, titleCol)) }}
            </div>
            <div class="card-name ellipsis">
              {{ resolveField(row, titleCol) }}
            </div>
            <div class="card-sub ellipsis" v-if="subtitleCol">
              {{ resolveField(row, subtitleCol) }}
            </div>
          </div>
          <div class="card-actions row items-center justify-center">
            <slot name="buttons" :props="{ row }" />
          </div>
        </div>
      </template>
    </div>

    <!-- Vista em tabela — usa as mesmas colunas já declaradas pelas páginas -->
    <div v-if="!loading && !erro && rows.length && vista === 'tabela'" class="tbl q-mt-md">
      <div class="tbl-head">
        <span
          v-for="col in dataCols"
          :key="col.name"
          class="tbl-head-cell"
          :style="estiloColuna(col)"
        >{{ col.label }}</span>
        <span v-if="$slots.buttons" class="tbl-head-cell tbl-col--actions">Acções</span>
      </div>
      <div v-for="row in rows" :key="row.id" class="tbl-row">
        <span
          v-for="col in dataCols"
          :key="col.name"
          class="tbl-cell"
          :class="{ 'tbl-cell--strong': col === titleCol }"
          :style="estiloColuna(col)"
        >{{ formatar(row, col) }}</span>
        <span v-if="$slots.buttons" class="tbl-cell tbl-col--actions">
          <slot name="buttons" :props="{ row }" />
        </span>
      </div>
    </div>

    <!-- Os três estados num só sítio. O de erro é novo: antes, um pedido que
         falhava chegava aqui como `rows.length === 0` e a página dizia "sem
         registos" — afirmava que não havia nada quando não sabia. -->
    <EstadoDados
      :carregando="loading"
      :erro="erro"
      :vazio="!rows.length"
      :repetivel="!!$attrs.onRepetir"
      texto-carregar="A carregar..."
      texto-erro="Não foi possível carregar os registos."
      texto-vazio="Sem registos encontrados"
      tamanho-icone="44px"
      @repetir="$emit('repetir')"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { LocalStorage } from "quasar";
import EstadoDados from "../EstadoDados.vue";

const props = defineProps({
  rows: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  title: { type: String, default: "" },
  loading: { type: Boolean, default: false },
  // Falha de carregamento. Sem isto, erro e lista vazia eram o mesmo ecrã.
  erro: { type: [Boolean, Object, String], default: false },
  dense: { type: Boolean, default: true },
  selection: { type: String, default: "multiple" },
  grid: { type: Boolean, default: false },
});

defineEmits(["repetir"]);

const selected = defineModel("selected", { default: [] });

const dataCols = computed(() => props.columns.filter((c) => c.name !== "actions"));
const titleCol = computed(() => dataCols.value[0]);
const subtitleCol = computed(() => dataCols.value[1]);

const resolveField = (row, col) => {
  if (!col) return "—";
  const val = typeof col.field === "function" ? col.field(row) : row[col.field] ?? row[col.name];
  return val ?? "—";
};

/* ── Vista: grelha ou tabela ──────────────────────────────────────────────
 * A preferência é global e persistente — quem gosta de tabela quer tabela em
 * todas as listagens, não uma escolha por página.
 */
const CHAVE_VISTA = "alfavida_vista_listas";
const vista = ref(LocalStorage.getItem(CHAVE_VISTA) ?? (props.grid ? "grelha" : "grelha"));
const definirVista = (v) => {
  vista.value = v;
  LocalStorage.set(CHAVE_VISTA, v);
};

/** Respeita o `format` que as páginas já declaram nas colunas. */
const formatar = (row, col) => {
  const bruto = typeof col.field === "function" ? col.field(row) : row[col.field] ?? row[col.name];
  if (typeof col.format === "function") return col.format(bruto, row);
  return bruto ?? "—";
};

/** Larguras relativas: a 1.ª coluna manda, as restantes dividem o resto. */
const estiloColuna = (col) => ({
  flex: col === titleCol ? "2 1 0" : "1 1 0",
  textAlign: col.align === "right" ? "right" : col.align === "center" ? "center" : "left",
});

const getInitials = (value) => {
  if (!value) return "?";
  return String(value)
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};
</script>
