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
        :label="service.name"
        active-class="text-h6 text-weight-regular text-teal-8"
        class="text-grey"
        :to="{ name: 'list-grupos' }"
      />
      <q-breadcrumbs-el
        label="Adicionar subgrupo"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{ name: 'subgrupos', params: { id: $route.params.id } }"
      />
    </template>
  </Breadcrumbs>
  <div class="q-pa-md">
    <Form @create="onCreate" :loading @get-name="setName" />
  </div>
</template>
<script setup>
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import { useCreateUpdate } from "src/composables/create-update";
import { ref } from "vue";
import { useRouter } from "vue-router";
import Form from "./components/Form.vue";
const { create } = useCreateUpdate("groups");
const router = useRouter();

const onCreate = async (payload) => {
  const data = await create(payload);
  if (data) router.go(-1);
};
const service = ref({ name: null, id: null });
const setName = (payload) => {
  service.value = payload;
};
</script>
