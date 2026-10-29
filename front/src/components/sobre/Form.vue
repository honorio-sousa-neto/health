<template>
  <q-form @submit.prevent="onSubmit">
    <div class="row q-col-gutter-sm q-mb-sm">
      <div class="col-12 col-sm-6">
        <q-input v-model="store.form.name" class="fi fi--principal" borderless label="Nome *"
          :rules="[required]" lazy-rules />
      </div>
      <div class="col-12 col-sm-6">
        <q-input v-model="store.form.nif" class="fi" borderless label="NIF *"
          :rules="[required]" lazy-rules />
      </div>
    </div>
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-4">
        <q-input v-model="store.form.phone" class="fi" borderless label="Telefone" />
      </div>
      <div class="col-12 col-sm-4">
        <q-input v-model="store.form.email" class="fi" borderless label="Email" />
      </div>
      <div class="col-12 col-sm-4">
        <q-input v-model="store.form.address" class="fi" borderless label="Endereço" />
      </div>
    </div>
    <div class="row justify-end">
      <q-btn unelevated no-caps color="primary" label="Guardar" type="submit"
        style="border-radius:var(--r-sm); font-size:var(--fs-label)" :loading="store.loadings.loadingCreate" />
    </div>
  </q-form>
</template>

<script setup>
import { useCompanyStore } from "src/stores/company";
import { required } from "src/utils/validation";

const emits = defineEmits(["saved"]);
const store = useCompanyStore();

const onSubmit = async () => {
  const { name, nif, phone, address, email } = store.form;
  const res = await store.create({ name, nif, phone, address, email });
  if (res?.success) emits("saved");
};
</script>

