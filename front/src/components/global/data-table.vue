<template>
  <div class="data-page">
    <!-- Toolbar -->
    <div class="data-toolbar row items-center justify-between q-mb-lg">
      <div class="row items-center q-gutter-sm">
        <q-select
          v-if="storeName == 'service' || storeName == 'material'"
          outlined
          dense
          v-model="store.pagination.category"
          label="Categoria"
          :options="[
            { label: 'Enfermaria', value: 'ENF' },
            { label: 'Farmácia', value: 'FAR' },
            { label: 'Laboratório', value: 'LAB' },
            { label: 'Estomatologia', value: 'EST' },
            { label: 'Ecografia', value: 'ECO' },
            { label: 'Raio-X', value: 'RX' },
            { label: 'Especialidade', value: 'ESP' },
          ]"
          emit-value
          map-options
          style="min-width: 160px"
          @update:model-value="fetchData"
        />
        <q-input
          outlined
          dense
          style="min-width: 240px"
          placeholder="Pesquisar..."
          v-model="store.pagination.meta.search"
          debounce="300"
          @update:model-value="fetchData"
        >
          <template v-slot:prepend>
            <q-icon name="las la-search" size="16px" color="grey-5" />
          </template>
        </q-input>
      </div>
      <q-btn
        color="primary"
        no-caps
        unelevated
        label="Novo"
        icon="las la-plus"
        @click="goToAdd"
      />
    </div>

    <!-- Cards grid -->
    <div v-if="!aCarregar && !falhou && rows.length" class="cards-grid">
      <div v-for="row in rows" :key="row.id" class="data-card">
        <div class="card-body" @click="goToView(row.id)">
          <div class="card-avatar">
            {{ getInitials(row[titleCol?.field] ?? row[titleCol?.name]) }}
          </div>
          <div class="card-name ellipsis">
            {{ row[titleCol?.field] ?? row[titleCol?.name] ?? '—' }}
          </div>
          <div class="card-sub ellipsis" v-if="subtitleCol">
            {{ row[subtitleCol?.field] ?? row[subtitleCol?.name] ?? '—' }}
          </div>
          <div class="card-details" v-if="detailCols.length">
            <div v-for="col in detailCols" :key="col.name" class="card-detail">
              <span class="detail-label">{{ col.label }}</span>
              <span class="detail-value ellipsis">
                {{ row[col.field] ?? row[col.name] ?? '—' }}
              </span>
            </div>
          </div>
        </div>
        <div class="card-actions row items-center justify-end">
          <editDestroy :id="row.id" :store="storeName" :path="path.edit" :not-show="false" />
        </div>
      </div>
    </div>

    <EstadoDados
      :carregando="aCarregar"
      :erro="falhou"
      :vazio="!rows.length"
      repetivel
      texto-carregar="A carregar..."
      texto-erro="Não foi possível carregar os registos."
      texto-vazio="Sem registos encontrados"
      tamanho-icone="44px"
      @repetir="recarregar"
    />

    <Pagination
      v-model:page="store.pagination.meta.page"
      v-model:perPage="store.pagination.meta.perPage"
      :total-pages="store.pagination.meta.totalPages"
      @update-search="store.index"
    />

    <!-- Fallback dialog for pages without a dedicated add route -->
    <q-dialog v-model="addNew">
      <q-card style="width: 600px; max-width: 92vw">
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 text-weight-medium">Novo registo</div>
            <q-btn flat round dense icon="las la-times" v-close-popup color="grey-6" />
          </div>
          <slot name="formulary"></slot>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useDynamicStore } from "src/composables/dynamicStore";
import Pagination from "./Pagination.vue";
import editDestroy from "../global/edit-destroy.vue";
import EstadoDados from "../common/EstadoDados.vue";
import { useLigacao } from "src/composables/ligacao";

const router = useRouter();
const addNew = ref(false);

const props = defineProps({
  columns: { type: Array, default: () => [] },
  storeName: { type: String },
  path: { type: Object, default: () => ({ add: null, edit: null }) },
  notShow: { type: Boolean, default: false },
});

const store = useDynamicStore(props.storeName);
const { caido } = useLigacao();

/* ── Estado do carregamento ───────────────────────────────────────────────
 * Este componente lia `store.loading`, que nenhum dos stores que o servem
 * expõe — todos expõem `loadings.loadingAll`, e alguns nem isso. O resultado
 * era `undefined`: o spinner nunca aparecia, e durante cada carregamento a
 * página afirmava "Sem registos encontrados" antes de as linhas surgirem.
 * Lê-se agora as três formas que existem no código, pela ordem em que são
 * usadas. */
const aCarregar = computed(
  () => store?.loadings?.loadingAll ?? store?.loading ?? false,
);

/* Falha é o que o store disser; quando o store ainda não o diz — a maioria
 * não diz — vale a ligação: uma lista vazia com o servidor em baixo é uma
 * lista que não se conseguiu ler, não uma lista sem registos. */
const falhou = computed(
  () => store?.erro ?? (caido.value && !aCarregar.value && !rows.value.length),
);

const recarregar = () => store?.index?.();

const rows = computed(() => {
  const d = store.data;
  if (!d) return [];
  return Array.isArray(d) ? d : d?.data ?? [];
});

const dataCols = computed(() => props.columns.filter(c => c.name !== "actions"));
const titleCol = computed(() => dataCols.value[0]);
const subtitleCol = computed(() => dataCols.value[1]);
const detailCols = computed(() => dataCols.value.slice(2, 4));

const getInitials = (value) => {
  if (!value) return "?";
  return String(value)
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};

const goToAdd = () => {
  if (props.path?.add) {
    router.push({ name: props.path.add });
  } else {
    addNew.value = true;
  }
};

const goToView = (id) => {
  if (props.path?.edit) {
    router.push({ name: props.path.edit, params: { id } });
  }
};

const fetchData = async () => {
  await store.index();
};

onMounted(() => {
  store.index();
});

onUnmounted(() => {
  store?.onReset?.();
});
</script>
