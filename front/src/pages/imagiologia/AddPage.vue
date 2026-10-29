<template>
  <Breadcrumbs>
    <template #children>
      <q-breadcrumbs-el
        label="Imagiologia"
        active-class="text-h6 text-weight-regular text-teal-8"
        class="text-grey"
        :to="{ name: 'lista-imagiologia' }"
      />
      <q-breadcrumbs-el
        label="Adicionar"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{ name: 'adicionar-imagiologia' }"
      />
    </template>
  </Breadcrumbs>
  <div class="q-pa-md">
    <Form @create="onCreate" :loading />
  </div>
</template>
<script setup>
import Form from "./components/Form.vue";
import { useImagiologyStore } from "src/stores/imagiology";
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import { useCreateUpdate } from "src/composables/create-update";
const store = useImagiologyStore();
const { create, loading } = useCreateUpdate("imagiologies");
const onCreate = async (form) => {
  await store.create(form);
};
</script>
