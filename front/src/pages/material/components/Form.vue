<template>
  <q-form @submit.prevent="onSubmit" @reset="onReset">

    <section class="form-seccao">
      <h2 class="form-seccao__titulo">Identificação</h2>

      <div class="form-grelha">
        <q-input
          v-model="form.name"
          class="fi fi--principal form-grelha__larga"
          borderless
          label="Nome *"
          hint="Designação como aparece na guia de entrada."
          :rules="[required]" lazy-rules
        />

        <CategoriaSelect v-model:categoria="form.categoryId" obrigatorio />

        <!-- Chamava-se "Categoria", ao lado de outro campo também chamado
             "Categoria". É `materialCategory` no registo: o que o material é,
             não onde está arrumado. -->
        <q-select
          v-model="form.type"
          class="fi"
          borderless
          label="Classe do material"
          hint="Para que serve, não onde está arrumado."
          :options="CLASSES"
          option-value="value" option-label="label"
          map-options emit-value
          popup-content-class="fi-popup"
        />

        <q-input
          v-model="form.description"
          class="fi form-grelha__larga"
          borderless
          label="Descrição"
          hint="Opcional. Referência do fabricante, apresentação, notas."
        />
      </div>
    </section>

    <section class="form-seccao">
      <h2 class="form-seccao__titulo">Preço e unidade</h2>

      <div class="form-grelha">
        <q-input
          v-model.number="form.price"
          class="fi"
          borderless
          type="number" step="0.001" min="0" inputmode="decimal"
          label="Preço unitário *"
          hint="Custo de uma unidade, em AOA."
          :rules="[required]" lazy-rules
        >
          <template #append><span class="fi-sufixo">AOA</span></template>
        </q-input>

        <UnitSelect
          v-model="form.unitId"
          class="fi"
          borderless
          label="Unidade"
          hint="Como este material é contado ou medido."
        />
      </div>
    </section>

    <section class="form-seccao">
      <h2 class="form-seccao__titulo">Stock</h2>

      <div class="form-grelha">
        <q-input
          v-model.number="form.minimumQuantity"
          class="fi"
          borderless
          type="number" step="0.001" min="0" inputmode="decimal"
          label="Stock mínimo"
          hint="Abaixo deste valor o material é assinalado como em falta."
        >
          <template v-if="unidade" #append><span class="fi-sufixo">{{ unidade }}</span></template>
        </q-input>

        <q-input
          v-if="!edicao"
          v-model.number="form.quantity"
          class="fi"
          borderless
          type="number" step="0.001" min="0" inputmode="decimal"
          label="Quantidade inicial"
          hint="Entrada registada ao criar. Depois, use Inventário › Entradas."
        >
          <template v-if="unidade" #append><span class="fi-sufixo">{{ unidade }}</span></template>
        </q-input>
      </div>
    </section>

    <div class="form-actions">
      <ResetButton type="reset" />
      <SubmitButton :loading type="submit" rotulo="Guardar consumível" />
    </div>
  </q-form>
</template>

<script setup>
/**
 * A ficha de um consumível, na mesma estrutura das de produto e serviço —
 * são o mesmo registo com outro `type`.
 *
 * A quantidade inicial só aparece na criação: numa ficha já existente seria
 * um campo que parece ajustar o stock e não ajusta. O stock de um material
 * que já existe move-se por entradas e saídas, que ficam com data, motivo e
 * responsável.
 */
import { computed, onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
import { useCreateUpdate } from "src/composables/create-update";
import { required } from "src/utils/validation";
import ResetButton from "src/components/common/buttons/ResetButton.vue";
import SubmitButton from "src/components/common/buttons/SubmitButton.vue";
import CategoriaSelect from "src/components/common/selects/CategoriaSelect.vue";
import UnitSelect from "src/components/common/selects/UnitSelect.vue";
import { useUnitOfMeasureStore } from "src/stores/unit-of-measure";

const { fetchOne } = useCreateUpdate("materials");
const route = useRoute();
const edicao = computed(() => !!route.params.id);

const emits = defineEmits(["create", "getName", "cancel"]);
defineProps({ loading: { type: Boolean, default: false } });

const CLASSES = [
  { label: "Reagentes", value: "reagent" },
  { label: "Consumíveis", value: "consumable" },
  { label: "Equipamentos", value: "equipment" },
  { label: "Vidros", value: "glassware" },
  { label: "Solução padrão", value: "standardSolution" },
  { label: "Equipamento de protecção individual", value: "epi" },
];

const vazio = () => ({
  name: "", price: null, description: "",
  unitId: null, categoryId: null, type: null,
  minimumQuantity: null, quantity: null,
});

const form = reactive(vazio());

// A unidade escolhida acompanha os campos de stock, para as quantidades não
// ficarem sem unidade num ecrã que só fala de quantidades.
const unidades = useUnitOfMeasureStore();
const unidade = computed(
  () => unidades.units.find((u) => u.id === form.unitId)?.abbreviation ?? "",
);

onMounted(async () => {
  if (!route.params.id) return;
  const data = await fetchOne(route.params.id);
  Object.assign(form, {
    name: data.name,
    price: data.unit_price,
    description: data.description,
    unitId: data.unitId ?? null,
    categoryId: data.categoryId,
    type: data.materialCategory,
    minimumQuantity: data.minimumStock,
  });
  emits("getName", { id: data.id, name: data.name });
});

const onSubmit = () => emits("create", { ...form });
const onReset = () => emits("cancel");
</script>
