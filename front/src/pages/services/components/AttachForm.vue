<template>
  <div class="cp">

    <div class="cp-topo">
      <div class="cp-intro">
        <h3 class="cp-titulo">Consumo padrão</h3>
        <p class="cp-sub">
          Defina o que {{ oArtigo }} consome normalmente. Ao registá-lo, estes
          valores aparecem já preenchidos — só há que ajustar se se usar mais.
        </p>
      </div>

      <q-select
        v-model="escolhido"
        :options="opcoes"
        option-label="name"
        use-input input-debounce="300"
        borderless
        class="fi cp-procura"
        label="Acrescentar item"
        @filter="filtrar"
        @update:model-value="acrescentar"
      >
        <template #prepend><q-icon name="las la-search" size="16px" /></template>
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.name }}</q-item-label>
              <q-item-label caption>
                {{ TIPO[scope.opt.type] ?? "" }} · saldo
                <span class="num">{{ numero(scope.opt.balance) }}</span>
                {{ scope.opt.unitLabel ?? "" }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template #no-option>
          <q-item><q-item-section class="cp-nada">Nenhum item encontrado</q-item-section></q-item>
        </template>
      </q-select>
    </div>

    <div v-if="linhas.length" class="cp-tabela-wrap">
      <table class="cp-tabela">
        <thead>
          <tr>
            <th class="cp-c" scope="col">Item</th>
            <th class="cp-c cp-c--tipo" scope="col">Tipo</th>
            <th class="cp-c cp-c--qtd" scope="col">Quantidade</th>
            <th class="cp-c cp-c--un" scope="col">Unidade</th>
            <th class="cp-c cp-c--eq" scope="col">Dá baixa de</th>
            <th class="cp-c cp-c--rm" scope="col"><span class="sr-only">Remover</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(l, i) in linhas" :key="l.id" class="cp-linha">
            <td class="cp-c cp-c--nome">{{ l.name }}</td>
            <td class="cp-c cp-c--tipo">{{ TIPO[l.type] ?? "—" }}</td>

            <td class="cp-c cp-c--qtd">
              <input
                v-model.number="l.quantidade"
                type="number" min="0" step="0.001" inputmode="decimal"
                class="cp-num"
                :aria-label="`Quantidade de ${l.name}`"
              />
            </td>

            <td class="cp-c cp-c--un">
              <select
                v-model="l.unidadeId"
                class="cp-un"
                :disabled="l.familia.length < 2"
                :aria-label="`Unidade de ${l.name}`"
              >
                <option v-for="u in l.familia" :key="u.id" :value="u.id">
                  {{ u.abbreviation }}
                </option>
              </select>
            </td>

            <!-- O que fica guardado, na unidade em que o stock é contado.
                 Sem esta coluna, escrever "20 un" num item guardado em caixas
                 de 10 seria um engano silencioso de uma ordem de grandeza. -->
            <td class="cp-c cp-c--eq">
              <span v-if="l.unidadeId !== l.unidadeItemId" class="cp-eq">
                <span class="num">{{ numero(emUnidadeDoItem(l)) }}</span>
                {{ l.unidadeItemLabel }}
              </span>
              <span v-else class="cp-eq cp-eq--igual">—</span>
            </td>

            <td class="cp-c cp-c--rm">
              <button class="cp-rm" :aria-label="`Remover ${l.name}`" @click="remover(i)">
                <q-icon name="las la-times" size="14px" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="cp-vazio">Nenhum consumo padrão definido para {{ oArtigo }}.</p>

    <div class="cp-accoes">
      <span v-if="linhas.length" class="cp-contagem">
        {{ linhas.length }} {{ linhas.length === 1 ? "item" : "itens" }}
      </span>
      <q-space />
      <q-btn v-if="linhas.length" flat no-caps dense label="Limpar" class="btn-icone" @click="linhas = []" />
      <q-btn
        unelevated no-caps
        icon="las la-save"
        label="Guardar consumo padrão"
        class="btn-primaria"
        :loading="loading"
        @click="onSubmit"
      />
    </div>

  </div>
</template>

<script setup>
/**
 * O consumo padrão de um artigo: o que ele gasta de cada vez que é realizado.
 *
 * ── A unidade ────────────────────────────────────────────────────────────
 *
 * Pode escolher-se, mas não qualquer uma: só as da família de conversão da
 * unidade do próprio item. Um item guardado em "C10" aceita "un", porque há
 * factor entre as duas; não aceita "ml", porque não há.
 *
 * E o que se guarda é sempre convertido para a unidade do item. Isso não é
 * detalhe de implementação — é o que impede um erro de stock: o
 * `suggestConsumables` do backend devolve estas quantidades com o rótulo da
 * unidade do item, e o `declareConsumption` dá baixa por FEFO nessa unidade.
 * Guardar "20" com a intenção de "20 comprimidos" num item contado em caixas
 * de 10 daria baixa de 20 caixas.
 *
 * Por isso também não foi preciso mexer no modelo: `MaterialOfService` não
 * ganha coluna de unidade, e nada a jusante muda de comportamento.
 */
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useCreateUpdate } from "src/composables/create-update";
import { api } from "src/boot/axios";

const emits = defineEmits(["create", "getName"]);
const props = defineProps({
  loading: { type: Boolean, default: false },
  basePath: { type: String, default: "services" },
  entityIdKey: { type: String, default: "serviceId" },
});

const TIPO = { PRODUCT: "Produto", SERVICE: "Serviço", CONSUMABLE: "Consumível" };

const oArtigo = computed(() => (props.basePath === "products" ? "este produto" : "este serviço"));

const { fetchOne } = useCreateUpdate(props.basePath);
const { params: { id: artigoId } } = useRoute();

const escolhido = ref(null);
const opcoes = ref([]);
const linhas = ref([]);
const unidades = ref([]);

const numero = (v) =>
  new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 3 }).format(Number(v ?? 0));

/** A família de conversão de uma unidade: ela e todas com a mesma base. */
const familiaDe = (unidade) => {
  if (!unidade) return [];
  const baseId = unidade.baseUnitId ?? unidade.id;
  return unidades.value.filter((u) => (u.baseUnitId ?? u.id) === baseId);
};

const porAbreviatura = (ab) =>
  ab ? unidades.value.find((u) => u.abbreviation === ab) ?? null : null;

/** Constrói a linha, já com a família e a unidade do item resolvidas. */
const montarLinha = ({ id, name, type, unitLabel, quantidade }) => {
  const doItem = porAbreviatura(unitLabel);
  const familia = familiaDe(doItem);
  return {
    id, name, type,
    quantidade: Number(quantidade ?? 1),
    unidadeItemId: doItem?.id ?? null,
    unidadeItemLabel: doItem?.abbreviation ?? unitLabel ?? "un",
    unidadeId: doItem?.id ?? null,
    familia: familia.length ? familia : doItem ? [doItem] : [],
  };
};

/** A quantidade na unidade em que o stock conta este item. */
const emUnidadeDoItem = (l) => {
  const escolhidaU = unidades.value.find((u) => u.id === l.unidadeId);
  const doItem = unidades.value.find((u) => u.id === l.unidadeItemId);
  if (!escolhidaU || !doItem || !doItem.factor) return Number(l.quantidade ?? 0);
  return (Number(l.quantidade ?? 0) * Number(escolhidaU.factor)) / Number(doItem.factor);
};

const filtrar = async (valor, update, abort) => {
  try {
    const { data } = await api.get("stock/items", { params: { search: valor || undefined } });
    update(() => { opcoes.value = data.data ?? []; });
  } catch {
    abort();
  }
};

const acrescentar = (opt) => {
  if (!opt) return;
  if (!linhas.value.some((l) => l.id === opt.id)) {
    linhas.value.push(montarLinha({
      id: opt.id, name: opt.name, type: opt.type,
      unitLabel: opt.unitLabel ?? opt.unit?.abbreviation, quantidade: 1,
    }));
  }
  escolhido.value = null;
};

const remover = (i) => linhas.value.splice(i, 1);

const onSubmit = () => {
  emits("create", {
    [props.entityIdKey]: artigoId,
    materials: linhas.value
      .map((l) => ({ consumableId: l.id, quantity: emUnidadeDoItem(l) }))
      .filter((m) => m.quantity > 0),
  });
};

onMounted(async () => {
  const { data: un } = await api.get("units-of-measure", { params: { search: "" } });
  unidades.value = un.data ?? un ?? [];

  if (!artigoId) return;
  const data = await fetchOne(artigoId);
  linhas.value = (data.consumables ?? []).map((item) =>
    montarLinha({
      id: item.consumableId,
      name: item.consumable?.name ?? "",
      type: item.consumable?.type ?? null,
      unitLabel: item.consumable?.unit?.abbreviation ?? null,
      quantidade: Number(item.quantity),
    }),
  );
  emits("getName", { name: data.name, id: data.id });
});
</script>
