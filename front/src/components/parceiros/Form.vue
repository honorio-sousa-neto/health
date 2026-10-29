<template>
  <q-form @submit.prevent="onSubmit" @reset="onReset">
    <div>
      <div class="q-gutter-sm">
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
          v-model="store.form.address"
          type="text"
          label="Endereço"
          hint=""
        />
        <q-input
          outlined
          v-model="store.form.phone"
          type="text"
          label="Contacto telefónico"
          hint=""
          mask="###-###-###"
          unmasked-value
        />
        <q-input
          outlined
          v-model="store.form.email"
          type="text"
          label="Email"
          hint=""
        />
        <q-input
          outlined
          v-model="store.form.nif"
          type="text"
          label="NIF"
          :rules="[required]"
          lazy-rules
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
import { usePartnerStore } from "src/stores/partner";
import { useRoute } from "vue-router";
import { required } from "src/utils/validation";
const store = usePartnerStore();
const route = useRoute();

const onSubmit = async () => {
  try {
    if (route.params.id) {
      await store.update(store.form, route.params.id);
    } else {
      await store.create(store.form);
    }
  } catch (error) {}
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
