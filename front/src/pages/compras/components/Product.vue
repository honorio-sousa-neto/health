<template>
  <q-select
    class="fi"
    borderless
    v-model="product"
    :label="label"
    :options="options"
    :option-label="(item) => item?.name ?? ''"
    option-value="id"
    map-options
    emit-value
    use-input
    input-debounce="350"
    clearable
    :loading="loading"
    :rules="rules"
    lazy-rules
    popup-content-class="fi-popup"
    @filter="onFilter"
    @update:model-value="onSelect"
  >
    <template #option="scope">
      <q-item v-bind="scope.itemProps" dense>
        <q-item-section>
          <q-item-label class="artigo-nome">{{ scope.opt.name }}</q-item-label>
          <q-item-label caption>
            {{ TIPO[scope.opt.type] ?? "Artigo" }} · saldo
            <span class="num">{{ numero(scope.opt.balance) }}</span>
            {{ scope.opt.unitLabel ?? "un" }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>

    <template #no-option>
      <q-item dense>
        <q-item-section class="artigo-nada">
          {{ escreveu ? 'Sem resultados' : 'Escreva para pesquisar…' }}
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup>
/**
 * O artigo de uma linha de factura.
 *
 * Pesquisava em `products`, que filtra `type: PRODUCT` no servidor — e por
 * isso não se podia comprar uma seringa nem um reagente, que são
 * `CONSUMABLE`. Passa a ler `stock/items`, a mesma fonte do registo de
 * entradas e do consumo padrão, que devolve os dois tipos.
 *
 * Traz também o saldo e a unidade em que o stock conta o artigo. A unidade
 * não é decoração: é nela que se declara o conteúdo da embalagem comprada,
 * e sem ela o número ao lado não diz em quê.
 */
import { ref, watch } from "vue";
import { api } from "src/boot/axios";
import { quantidade } from "src/utils/format";

const props = defineProps({
  initialProduct: { type: Object, default: null },
  label: { type: String, default: "Artigo" },
  rules: { type: Array, default: () => [] },
});

const product = defineModel("product");
const emit = defineEmits(["select"]);
const options = ref([]);
const loading = ref(false);
const escreveu = ref(false);

const TIPO = { PRODUCT: "Produto", SERVICE: "Serviço", CONSUMABLE: "Consumível" };

const numero = quantidade;

// Em modo de cópia ou de leitura o artigo já vem resolvido: semeia as opções
// para o campo mostrar o nome em vez do identificador.
watch(
  () => props.initialProduct,
  (p) => {
    if (p?.id && !options.value.some((o) => o.id === p.id)) {
      options.value = [p];
    }
  },
  { immediate: true },
);

const onFilter = async (val, update, abort) => {
  escreveu.value = val.length > 0;
  loading.value = true;
  try {
    const { data } = await api.get("stock/items", {
      params: { search: val || undefined },
    });
    update(() => { options.value = data.data ?? []; });
  } catch {
    abort();
  } finally {
    loading.value = false;
  }
};

const onSelect = (id) => {
  const escolhido = options.value.find((o) => o.id === id) ?? null;
  emit("select", escolhido);
};
</script>

<style scoped lang="scss">
.artigo-nome {
  font-size: var(--fs-body);
  color: var(--text);
}

.artigo-nada {
  font-size: var(--fs-label);
  color: var(--text-muted);
}
</style>
