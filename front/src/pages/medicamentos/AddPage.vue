<template>
  <Breadcrumbs>
    <template #children>
      <q-breadcrumbs-el
        label="Fármacos"
        active-class="text-h6 text-weight-regular text-teal-8"
        class="text-grey"
        :to="{ name: 'list-medicamentos' }"
      />
      <q-breadcrumbs-el
        label="Adicionar"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{ name: 'adicionar-medicamento' }"
      />
    </template>
  </Breadcrumbs>
  <div class="q-pa-md">
    <Form @create="onCreate" :loading="store.loadings.loadingCreate" />
  </div>
</template>
<script setup>
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import Form from "./components/Form.vue";
import { useRouter } from "vue-router";
import { useDrugStore } from "src/stores/drug";
const store = useDrugStore();
const router = useRouter();
const onCreate = async (payload) => {
  const data = await store.create(payload);
  if (data) router.go(-1);
};
</script>
