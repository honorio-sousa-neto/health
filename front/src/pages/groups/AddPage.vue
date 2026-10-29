<template>
  <Breadcrumbs>
    <template #children>
      <q-breadcrumbs-el
        label="Grupos"
        active-class="text-h6 text-weight-regular text-teal-8"
        class="text-grey"
        :to="{ name: 'list-grupos' }"
      />
      <q-breadcrumbs-el
        label="Adicionar"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{ name: 'adicionar-grupo' }"
      />
    </template>
  </Breadcrumbs>
  <div class="q-pa-md">
    <Form @create="onCreate" :loading />
  </div>
</template>
<script setup>
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import { useCreateUpdate } from "src/composables/create-update";
import { useRouter } from "vue-router";
import Form from "./components/Form.vue";
const router = useRouter();
const { create } = useCreateUpdate("groups");

const onCreate = async (payload) => {
  const data = await create(payload);
  if (data) router.go(-1);
};
</script>
