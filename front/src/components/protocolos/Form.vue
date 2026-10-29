<template>
  <q-form @submit.prevent="onSubmit" @reset="onReset">
    <div>
      <div class="q-gutter-sm">
        <q-input
          outlined
          dense
          v-model="store.form.name"
          type="text"
          label="Nome"
        />
        <q-input
          outlined
          dense
          v-model.number="store.form.value"
          type="number"
          label="Valor"
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
</template>
<script setup>
const route = useRoute();

import { ref } from "vue";
import { useRoute } from "vue-router";
import { useProtocolStore } from "src/stores/protocol";

const store = useProtocolStore();

const onSubmit = async () => {
  try {
    const payload = store.form;
    route.params.id
      ? await store.update(payload, route.params.id)
      : await store.create(payload);
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
