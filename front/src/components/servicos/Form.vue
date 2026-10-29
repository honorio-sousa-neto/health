<template>
  <div>
    <q-form @submit.prevent="onSubmit" @reset="onReset">
      <div class="q-mt-md">
        <div class="q-gutter-y-sm">
          <div class="row">
            <q-radio v-model="store.form.type" val="SERVICE" label="Serviço" />
            <q-radio v-model="store.form.type" val="PRODUCT" label="Produto" />
          </div>
          <q-input
            standout="bg-teal-8 text-white"
            v-model="store.form.name"
            type="text"
            label="Nome"
            :rules="[(val) => !!val || 'Campo obrigatório']"
            lazy-rules
          />
          <q-input
            standout="bg-teal-8 text-white"
            v-model="store.form.description"
            type="text"
            label="Descrição"
            hint="Descrição"
          />
          <q-select
            standout="bg-teal-8 text-white"
            v-model="store.form.category"
            type="text"
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
            :rules="[(val) => !!val || 'Campo obrigatório']"
            lazy-rules
            map-options
            emit-value
          />
          <q-input
            standout="bg-teal-8 text-white"
            v-model.number="store.form.unit_price"
            type="number"
            step="0.001"
            min="1"
            label="Preço"
            :rules="[(val) => !!val || 'Campo obrigatório']"
            lazy-rules
          />
          <q-select
            standout="bg-teal-8 text-white"
            v-model="store.form.classificacao"
            label="Classificação"
            clearable
            :options="['Alfa', 'Beta', 'Gama']"
          />
          <q-input
            v-if="user.role == 'admin'"
            standout="bg-teal-8 text-white"
            v-model.number="store.form.discount"
            type="number"
            step="0.001"
            min="0"
            label="Desconto"
          />
          <q-checkbox
            left-label
            v-model="store.form.hasIva"
            label="Aplicar IVA"
          />
          <q-slide-transition>
            <div v-show="store.form.hasIva">
              <div>
                <q-radio
                  v-model="store.form.ivaTax"
                  :val="14"
                  label="Geral - 14%"
                />
              </div>
              <div>
                <q-radio
                  v-model="store.form.ivaTax"
                  :val="7"
                  label="Simplificada - 7%"
                />
              </div>
              <div>
                <q-radio
                  v-model="store.form.ivaTax"
                  :val="2"
                  label="Transitório - 2%"
                />
              </div>
            </div>
          </q-slide-transition>
          <q-slide-transition>
            <div v-show="!store.form.hasIva">
              <div>
                <q-select
                  v-model="store.form.exemptionId"
                  label="Motivo de isenção"
                  standout="bg-teal-8 text-white"
                  :options="store.exemptions.data"
                  option-value="id"
                  :option-label="(val) => `${val.code} - ${val.description}`"
                  map-options
                  emit-value
                />
              </div>
            </div>
          </q-slide-transition>
        </div>
        <div v-if="store.form.type == 'SERVICE'">
          <q-toggle
            v-model="isConnecting"
            color="green"
            label="Conectar materiais a este serviço"
          />
          <q-slide-transition>
            <div v-if="isConnecting">
              <Materials v-model:materials="form.materials" />
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
const store = useServiceStore();
const route = useRoute();

import { onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import Materials from "./Materials.vue";
import { SessionStorage } from "quasar";
const user = SessionStorage.getItem("alfavida_user");
import { useServiceStore } from "src/stores/service";
const isConnecting = ref(false);

const onSubmit = async () => {
  try {
    const {
      category,
      description,
      discount,
      name,
      unit_price,
      classificacao,
      type,
      exemptionId,
    } = store.form;
    const payload = { category, description, discount, name, unit_price, classificacao, type, exemptionId };
    route.params.id
      ? await store.update(payload, route.params.id)
      : await store.create(payload);
  } catch (error) {
    console.log(error.message);
  }
};

onMounted(async () => {
  await store.indexExemptions();
});

onUnmounted(() => {
  store.onReset();
});
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
