<template>
  <div class="q-my-md">
    <q-form @submit.prevent="onSubmit" @reset="onReset">
      <div>
        <div class="">
          <q-input
            outlined
            :rules="[required]"
            lazy-rules
            dense
            v-model="form.name"
            type="text"
            label="Nome"
          />
          <q-select
            outlined
            dense
            v-model="form.category"
            type="text"
            :rules="[required]"
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
          />
          <q-input
            outlined
            dense
            v-model="form.description"
            type="text"
            label="Descrição"
            hint="Breve descrição do material"
          />
          <q-input
            outlined
            :rules="[required]"
            lazy-rules
            dense
            step="0.01"
            v-model.number="form.price"
            type="number"
            label="Preço"
          />

          <q-select
            outlined
            dense
            v-model="form.measure"
            type="text"
            :rules="[required]"
            label="Unidade"
            :options="['Litro', 'Mililitro', 'Par', 'Unidade']"
            emit-value
            map-options
          />
          <q-input
            outlined
            :rules="[required]"
            lazy-rules
            dense
            v-model.number="form.min_quantity"
            min="1"
            type="number"
            label="Quantidade mínima"
            hint="Quantidade mínima que servirá de alerta para o sistema"
          />
        </div>
      </div>
      <div class="q-mt-sm q-gutter-sm">
        <q-btn
          rounded
          icon="las la-save"
          label="Salvar"
          type="submit"
          color="primary"
          :loading="store.loadings.loadingCreate"
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
import { reactive, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { required } from "src/utils/validation";
import { useMaterialStore } from "src/stores/material";
const route = useRoute();
const router = useRouter();
const store = useMaterialStore();
const props = defineProps({
  form: {
    type: String,
    default: {
      name: null,
      description: null,
      category: null,
      unit_price: null,
      sale_price: null,
      materials: [],
    },
  },
});
const form = reactive({ ...props.form });

const onReset = () => {
  Object.assign(form, {
    name: null,
    description: null,
    price: null,
    quantity: null,
    min_quantity: null,
    category: null,
  });
};

const onSubmit = async () => {
  try {
    const { success } = route.params.id
      ? await store.update(form, route.params.id)
      : await store.create(form);
    if (success) {
      router.push({ name: "list-materials" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
</script>

<style scoped lang="scss">
.custom-btn {
  font-size: smaller;
  color: $primary;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
