<template>
  <q-form @submit.prevent="onSubmit" @reset="onReset">

    <div class="form-card q-mb-md" style="max-width: 640px">
      <div class="form-section-label">Identificação</div>
      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-8">
          <q-input
            v-model="form.name"
            class="fi fi--principal" borderless
            label="Nome *"
            :rules="[required]" lazy-rules
          >
            <template #prepend><q-icon name="las la-tag" color="grey-5" size="16px" /></template>
          </q-input>
        </div>
        <div class="col-12 col-sm-4">
          <q-input
            v-model="form.abbreviation"
            class="fi" borderless
            label="Abreviatura *"
            :rules="[required]" lazy-rules
          >
            <template #prepend><q-icon name="las la-ruler" color="grey-5" size="16px" /></template>
          </q-input>
        </div>
      </div>
    </div>

    <div class="form-card q-mb-lg" style="max-width: 640px">
      <div class="form-section-label">Classificação &amp; conversão</div>
      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-6">
          <q-select
            v-model="form.kind"
            class="fi" borderless
            label="Tipo *"
            :options="KINDS"
            emit-value map-options
          >
            <template #prepend><q-icon name="las la-tag" color="grey-5" size="16px" /></template>
          </q-select>
        </div>
        <div class="col-12 col-sm-6">
          <q-select
            v-model="form.category"
            class="fi" borderless
            label="Categoria"
            :options="categoriesForKind"
            emit-value map-options clearable
          >
            <template #prepend><q-icon name="las la-layer-group" color="grey-5" size="16px" /></template>
          </q-select>
        </div>
        <div class="col-12 col-sm-7">
          <q-select
            v-model="form.baseUnitId"
            class="fi" borderless
            label="Unidade de referência"
            :options="baseOptions"
            :option-label="u => `${u.name} (${u.abbreviation})`"
            option-value="id"
            emit-value map-options clearable
            :loading="loadingUnits"
          >
            <template #prepend><q-icon name="las la-link" color="grey-5" size="16px" /></template>
            <template #hint>
              <span v-if="!form.baseUnitId" class="text-grey-5">
                Deixe em branco se esta unidade for a referência da categoria
              </span>
            </template>
          </q-select>
        </div>
        <div class="col-12 col-sm-5">
          <q-input
            v-model.number="form.factor"
            class="fi" borderless
            label="Factor de conversão"
            type="number" min="0" step="any"
            :disable="!form.baseUnitId"
          >
            <template #prepend><q-icon name="las la-times" color="grey-5" size="16px" /></template>
            <template #hint>
              <span v-if="form.baseUnitId && baseUnit">
                1 {{ form.abbreviation || '?' }} = {{ form.factor }}
                {{ baseUnit.abbreviation }}
              </span>
            </template>
          </q-input>
        </div>
      </div>
    </div>

    <div class="form-actions" style="max-width: 640px">
      <ResetButton type="reset" />
      <SubmitButton :loading type="submit" />
    </div>

  </q-form>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { api } from "src/boot/axios";
import { required } from "src/utils/validation";
import ResetButton from "src/components/common/buttons/ResetButton.vue";
import SubmitButton from "src/components/common/buttons/SubmitButton.vue";

const KINDS = [
  { label: "Medida física (g, mL, m…)", value: "measure" },
  { label: "Contagem / embalagem",       value: "count"   },
];

const CATEGORIES_BY_KIND = {
  measure: [
    { label: "Peso",        value: "peso"        },
    { label: "Volume",      value: "volume"      },
    { label: "Comprimento", value: "comprimento" },
    { label: "Área",        value: "área"        },
  ],
  count: [
    { label: "Quantidade",         value: "quantidade"         },
    { label: "Forma farmacêutica", value: "forma farmacêutica" },
  ],
};

const route = useRoute();
const emit  = defineEmits(["create", "get-name"]);
defineProps({ loading: { type: Boolean, default: false } });

const allUnits     = ref([]);
const loadingUnits = ref(false);

const form = reactive({
  name: "", abbreviation: "", kind: "measure", category: null, factor: 1, baseUnitId: null,
});

const categoriesForKind = computed(() => CATEGORIES_BY_KIND[form.kind] ?? []);

const baseOptions = computed(() =>
  allUnits.value.filter((u) => u.id !== route.params.id && u.kind === form.kind)
);

const baseUnit = computed(() =>
  allUnits.value.find((u) => u.id === form.baseUnitId) ?? null
);

onMounted(async () => {
  loadingUnits.value = true;
  const { data } = await api.get("units-of-measure");
  allUnits.value = data.data ?? [];
  loadingUnits.value = false;

  if (route.params.id) {
    const res = await api.get(`units-of-measure/${route.params.id}`);
    const d = res.data?.data;
    if (d) {
      Object.assign(form, {
        name: d.name, abbreviation: d.abbreviation, kind: d.kind ?? "measure",
        category: d.category, factor: d.factor, baseUnitId: d.baseUnitId,
      });
      emit("get-name", { name: d.name });
    }
  }
});

const onSubmit = () => emit("create", { ...form });
const onReset  = () => Object.assign(form, { name: "", abbreviation: "", kind: "measure", category: null, factor: 1, baseUnitId: null });
</script>

<style scoped lang="scss">

.form-section-label {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text-faint);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 12px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--border-soft);
}
</style>
