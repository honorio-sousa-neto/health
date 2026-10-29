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
          hint="Designação como aparece na factura."
          :rules="[required]" lazy-rules
        />

        <q-select
          v-model="form.type"
          class="fi"
          borderless
          label="Tipo *"
          :options="TIPOS"
          map-options emit-value
          popup-content-class="fi-popup"
          :rules="[required]" lazy-rules
        />

        <CategoriaSelect v-model:categoria="form.categoryId" obrigatorio />

        <q-input
          v-model="form.description"
          class="fi form-grelha__larga"
          borderless
          label="Descrição"
          hint="Opcional. O que este serviço inclui."
        />
      </div>
    </section>

    <section class="form-seccao">
      <h2 class="form-seccao__titulo">Preço e unidade</h2>

      <div class="form-grelha">
        <q-input
          v-model.number="form.unit_price"
          class="fi"
          borderless
          type="number" step="0.001" min="0" inputmode="decimal"
          label="Preço *"
          :hint="custoReal"
          :rules="[required]" lazy-rules
        >
          <template #append><span class="fi-sufixo">AOA</span></template>
        </q-input>

        <UnitSelect
          v-model="form.unitId"
          class="fi"
          borderless
          label="Unidade"
          hint="Como este serviço é contado ou medido."
        />
      </div>
    </section>

    <section class="form-seccao">
      <h2 class="form-seccao__titulo">Impostos e desconto</h2>

      <div class="form-grelha">
        <q-input
          v-if="user?.role === 'admin'"
          v-model.number="form.discount"
          class="fi"
          borderless
          type="number" step="0.001" min="0" inputmode="decimal"
          label="Desconto"
          hint="Valor abatido ao preço, em AOA."
        />

        <div class="form-grelha__larga">
          <q-checkbox v-model="form.hasIva" label="Aplicar IVA" />

          <q-slide-transition>
            <div v-show="form.hasIva" class="form-opcoes">
              <q-radio v-model="form.ivaTax" :val="14" label="Geral · 14%" />
              <q-radio v-model="form.ivaTax" :val="7" label="Simplificada · 7%" />
              <q-radio v-model="form.ivaTax" :val="2" label="Transitório · 2%" />
            </div>
          </q-slide-transition>

          <q-slide-transition>
            <div v-show="!form.hasIva" class="form-opcoes">
              <Exemption v-model:exemption="form.exemptionId" />
            </div>
          </q-slide-transition>
        </div>
      </div>
    </section>

    <div class="form-actions">
      <ResetButton type="reset" />
      <SubmitButton :loading type="submit" rotulo="Guardar serviço" />
    </div>
  </q-form>
</template>

<script setup>
/**
 * A ficha do serviço, com a mesma estrutura da ficha do produto — são o mesmo
 * registo com outro `type`, e a página de produto aceita o id de um serviço.
 *
 * A categoria é a de topo — Farmácia, Laboratório —, não a subcategoria.
 * O campo que aqui estava escolhia a subcategoria e mostrava a categoria como
 * texto de apoio, o que é a troca que faltava fazer e não o campo a remover.
 *
 * As secções de impostos e desconto não existem na ficha do produto: um
 * serviço declara IVA ou motivo de isenção, e apagá-las mudaria o que é
 * enviado à API, não só o que aparece no ecrã.
 */
import { SessionStorage } from "quasar";
import { computed, onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
import { useCreateUpdate } from "src/composables/create-update";
import { required } from "src/utils/validation";
import ResetButton from "src/components/common/buttons/ResetButton.vue";
import SubmitButton from "src/components/common/buttons/SubmitButton.vue";
import UnitSelect from "src/components/common/selects/UnitSelect.vue";
import CategoriaSelect from "src/components/common/selects/CategoriaSelect.vue";
import Exemption from "./Exemption.vue";

const user = SessionStorage.getItem("alfavida_user");
const { fetchOne } = useCreateUpdate("services");
const route = useRoute();

const emits = defineEmits(["create", "getName", "cancel"]);
defineProps({ loading: { type: Boolean, default: false } });

const TIPOS = [
  { label: "Produto", value: "PRODUCT" },
  { label: "Serviço", value: "SERVICE" },
  { label: "Consumível", value: "CONSUMABLE" },
];

const emptyForm = () => ({
  name: "", description: "", categoryId: null, unit_price: "", discount: 0,
  type: "SERVICE", hasIva: false, ivaTax: 14,
  exemptionId: null, unitId: null, real_price: 0,
});

const form = reactive(emptyForm());

const moeda = (v) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "AOA" }).format(Number(v ?? 0));

// O custo real vinha numa linha solta a meio do formulário, sem dizer de onde
// saía. É contexto do preço, por isso vive na linha de apoio do preço.
const custoReal = computed(() =>
  form.real_price ? `Custo real: ${moeda(form.real_price)}` : "Valor unitário, em AOA.",
);

const onSubmit = () => {
  const { hasIva, real_price, ...rest } = form;
  emits("create", { ...rest, tax: hasIva ? form.ivaTax : null });
};
const onReset = () => emits("cancel");

onMounted(async () => {
  if (route.params.id) {
    const data = await fetchOne(route.params.id);
    Object.assign(form, data);
    // O registo guarda `tax`, não `hasIva`. Sem esta derivação a caixa ficava
    // em estado indeterminado — nem ligada nem desligada — e o formulário
    // abria a dizer que não sabia se o serviço leva IVA.
    form.hasIva = Boolean(data?.tax);
    if (data?.tax) form.ivaTax = Number(data.tax);
    emits("getName", { id: form.id, name: form.name, exam: data?.exam ?? null });
  }
});
</script>
