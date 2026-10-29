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
          hint="Valor unitário, em AOA."
          :rules="[required]" lazy-rules
        >
          <template #append><span class="fi-sufixo">AOA</span></template>
        </q-input>

        <UnitSelect
          v-model="form.unitId"
          class="fi"
          borderless
          :label="form.type === 'PRODUCT' ? 'Unidade *' : 'Unidade'"
          hint="Como este artigo é contado ou medido."
          :rules="form.type === 'PRODUCT' ? [required] : []"
        />
      </div>
    </section>

    <div class="form-actions">
      <ResetButton type="reset" />
      <SubmitButton :loading type="submit" rotulo="Guardar produto" />
    </div>
  </q-form>
</template>

<script setup>
import ResetButton from "src/components/common/buttons/ResetButton.vue";
import SubmitButton from "src/components/common/buttons/SubmitButton.vue";
import { required } from "src/utils/validation";
import { useCreateUpdate } from "src/composables/create-update";
import { onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
import UnitSelect from "src/components/common/selects/UnitSelect.vue";
import CategoriaSelect from "src/components/common/selects/CategoriaSelect.vue";

const { fetchOne } = useCreateUpdate("products");
const emits = defineEmits(["create", "getName", "cancel"]);
defineProps({ loading: { type: Boolean, default: false } });

const TIPOS = [
  { label: "Produto", value: "PRODUCT" },
  { label: "Serviço", value: "SERVICE" },
  { label: "Consumível", value: "CONSUMABLE" },
];

const route = useRoute();

const emptyForm = () => ({
  name: "", isInput: false, typeInput: "",
  categoryId: null, unit_price: "",
  type: "PRODUCT", hasIva: false, ivaTax: 14, unitId: null,
});

const form = reactive(emptyForm());

const onSubmit = () => {
  const { hasIva, ivaTax, ...rest } = form;
  emits("create", { ...rest, tax: hasIva ? ivaTax : null });
};
const onReset = () => emits("cancel");

onMounted(async () => {
  if (route.params.id) {
    const data = await fetchOne(route.params.id);
    Object.assign(form, data);
    emits("getName", { id: form.id, name: form.name, exam: data.exam ?? null });
  }
});
</script>
