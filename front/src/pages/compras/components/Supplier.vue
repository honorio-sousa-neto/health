<template>
  <q-select
    class="fi"
    borderless
    v-model="supplier"
    :label="label"
    :options="options"
    option-label="name"
    option-value="id"
    map-options
    emit-value
    use-input
    input-debounce="350"
    clearable
    :loading
    :hint="supplierHint"
    :rules="rules"
    lazy-rules
    popup-content-class="fi-popup"
    @filter="onFilter"
  >
    <template #option="scope">
      <q-item v-bind="scope.itemProps" dense>
        <q-item-section>
          <q-item-label lines="1" style="font-size: var(--fs-body); font-weight: 500; color: var(--text)">
            {{ scope.opt.name }}
          </q-item-label>
          <q-item-label v-if="scope.opt.nif || scope.opt.phone" caption class="row items-center" style="gap: 6px">
            <span v-if="scope.opt.nif" class="row items-center" style="gap: 2px">
              <q-icon name="las la-id-card" size="11px" />{{ scope.opt.nif }}
            </span>
            <span v-if="scope.opt.nif && scope.opt.phone" class="text-grey-4">·</span>
            <span v-if="scope.opt.phone" class="row items-center" style="gap: 2px">
              <q-icon name="las la-phone" size="11px" />{{ scope.opt.phone }}
            </span>
          </q-item-label>
        </q-item-section>
        <q-item-section v-if="scope.opt.email" side>
          <q-item-label caption style="font-size: var(--fs-label); color: var(--text-faint)">{{ scope.opt.email }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>

    <template #no-option="{ inputValue }">
      <q-item dense>
        <q-item-section class="forn-nada">
          {{ inputValue ? `Sem resultados para "${inputValue}"` : 'Sem fornecedores cadastrados' }}
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup>
/**
 * O fornecedor de uma compra. Passou a ser obrigatório: uma entrada de stock
 * sem origem não é imputável a ninguém nem conferível contra papel nenhum.
 */
import { computed, onMounted, ref } from "vue";
import { api } from "src/boot/axios";

defineProps({
  rules: { type: Array, default: () => [] },
  label: { type: String, default: "Fornecedor" },
});

const supplier  = defineModel("supplier");
const options   = ref([]);
const loading   = ref(false);
const allOptions = ref([]);

const load = async () => {
  loading.value = true;
  const { data } = await api.get("suppliers", { params: { perPage: 200, page: 1 } });
  allOptions.value = data.data ?? [];
  options.value = allOptions.value;
  loading.value = false;
};

onMounted(load);

const onFilter = (val, update) => {
  update(() => {
    const q = val.toLowerCase();
    options.value = q
      ? allOptions.value.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            (s.nif && s.nif.toLowerCase().includes(q)) ||
            (s.phone && s.phone.includes(q))
        )
      : allOptions.value;
  });
};

const supplierHint = computed(() => {
  if (!supplier.value) return '';
  const s = allOptions.value.find((o) => o.id === supplier.value);
  if (!s) return '';
  return [s.nif ? `NIF: ${s.nif}` : '', s.phone].filter(Boolean).join('  ·  ');
});
</script>

<style scoped lang="scss">
.forn-nada {
  font-size: var(--fs-label);
  color: var(--text-muted);
}
</style>

