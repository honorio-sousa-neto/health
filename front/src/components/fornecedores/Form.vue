<template>
  <div>
    <q-form @submit.prevent="onSubmit" @reset="onReset">
      <div>
        <div>
          <q-input
            outlined
            v-model="store.form.name"
            type="text"
            label="Nome"
            :rules="[required]"
            lazy-rules
          />
          <q-input
            outlined
            v-model="store.form.nif"
            type="text"
            label="NIF"
            mask="#########AA###"
            class="q-mb-md"
          />
          <q-input
            outlined
            v-model="store.form.email"
            type="text"
            label="Email"
            class="q-mb-md"
          />
          <q-input
            outlined
            v-model="store.form.phone"
            type="text"
            label="Contacto telefónico"
            mask="###-###-###"
            class="q-mb-md"
            unmasked-value
          />
          <q-input
            outlined
            v-model="store.form.address"
            type="text"
            label="Endereço"
            class="q-mb-md"
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
import { onUnmounted } from "vue";
import { required } from "src/utils/validation";
import { useRoute } from "vue-router";
import { useSupplierStore } from "src/stores/supplier";

const store = useSupplierStore();
const route = useRoute();

const onSubmit = async () => {
  let payload = {};
  Object.assign(payload, store.form);
  if (route.params.id) {
    await store.update(payload, route.params.id);
  } else {
    await store.create(payload);
  }
};
const onReset = () => {
  store.onReset();
};

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
