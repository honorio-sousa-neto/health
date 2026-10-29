<template>
  <div>
    <q-form @submit.prevent="onSubmit" @reset="onReset">
      <div class="q-mt-md">
        <div class="q-gutter-y-sm">
          <q-input
            standout="bg-teal-8 text-white"
            v-model="form.name"
            type="text"
            label="Nome"
            :rules="[(val) => !!val || 'Campo obrigatório']"
            lazy-rules
          />

          <q-input
            standout="bg-teal-8 text-white"
            v-model="form.description"
            type="text"
            label="Descrição"
            hint="Descrição"
          />
          <div>
            <q-checkbox v-model="form.isInput" label="É material gastável?" />
          </div>
          <Category
            v-model:category="form.categoryId"
            :current-category="form.category.categoryId"
            v-model:isPharma="isPharma"
          />
          <q-select
            class="q-mb-md"
            v-if="isPharma"
            v-model="form.typeInput"
            :options="['Material Alfa', 'Material Beta', 'Material Delta']"
            label="Tipo de material"
            standout="bg-teal text-white"
          />
          <q-input
            standout="bg-teal-8 text-white"
            v-model.number="form.unit_price"
            type="number"
            step="0.001"
            min="0"
            label="Preço"
            :rules="[(val) => !!val || 'Campo obrigatório']"
            lazy-rules
          />
          <q-input
            v-if="user.role == 'admin'"
            standout="bg-teal-8 text-white"
            v-model.number="form.discount"
            type="number"
            step="0.001"
            min="0"
            label="Desconto"
          />

          <q-checkbox left-label v-model="form.hasIva" label="Aplicar IVA" />
          <q-slide-transition>
            <div v-show="form.hasIva">
              <div>
                <q-radio v-model="form.ivaTax" :val="14" label="Geral - 14%" />
              </div>
              <div>
                <q-radio
                  v-model="form.ivaTax"
                  :val="7"
                  label="Simplificada - 7%"
                />
              </div>
              <div>
                <q-radio
                  v-model="form.ivaTax"
                  :val="2"
                  label="Transitório - 2%"
                />
              </div>
            </div>
          </q-slide-transition>
          <q-slide-transition>
            <div v-show="!form.hasIva">
              <div>
                <Exemption v-model:exemption="form.exemptionId" />
              </div>
            </div>
          </q-slide-transition>
        </div>
      </div>

      <div class="q-mt-sm q-gutter-sm">
        <q-btn
          rounded
          icon="las la-save"
          label="Salvar"
          type="submit"
          color="primary"
          :loading
        />
        <q-btn
          label="Limpar"
          rounded
          icon="las la-eraser"
          type="reset"
          color="primary"
          outline
        />
      </div>
    </q-form>
  </div>
</template>
<script setup>
import { SessionStorage } from "quasar";
import { useCreateUpdate } from "src/composables/create-update";
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import Category from "./Category.vue";
const user = SessionStorage.getItem("alfavida_user");
const { fetchOne } = useCreateUpdate("services");
const route = useRoute();

const emits = defineEmits(["create", "getName"]);
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});
const isPharma = ref(false);
let form = reactive({
  name: "",
  isInput: false,
  typeInput: "",
  description: "",
  categoryId: "",
  unit_price: "",
  discount: 0,
  type: "PRODUCT",
  hasIva: false,
  exemptionId: null,
  categoryId: null,
  category: {
    categoryId: null,
  },
});

onMounted(async () => {
  if (route.params.id) {
    const data = await fetchOne(route.params.id);
    Object.assign(form, data);
    emits("getName", { id: form.id, name: form.name });
  }
});

const onSubmit = async () => {
  const { hasIva, quantity, ...rest } = form;
  emits("create", rest);
  Object.assign(form, {
    name: "",
    isInput: false,
    typeInput: "",
    description: "",
    categoryId: "",
    unit_price: "",
    discount: 0,
    type: "PRODUCT",
    hasIva: false,
    exemptionId: null,
    categoryId: null,
    category: {
      categoryId: null,
    },
  });
};
</script>
