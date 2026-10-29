<template>
  <Breadcrumbs>
    <template #children>
      <q-breadcrumbs-el
        label="Serviços e produtos"
        active-class="text-h6 text-weight-regular text-teal-8"
        class="text-grey"
        :to="{ name: 'list-services' }"
      />
      <q-breadcrumbs-el
        :label="service.name"
        active-class="text-h6 text-weight-regular text-teal-8"
        class="text-grey"
        :to="{ name: 'editar-servico', params: { id: service.id } }"
      />
      <q-breadcrumbs-el
        :label="'Mapear insumos'"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{ name: 'mapear-insumo', params: { id: service.id } }"
      />
    </template>
  </Breadcrumbs>
  <div class="q-pa-md">
    <AttachForm @get-name="setName" @create="onCreate" :loading />
  </div>
</template>
<script setup>
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import AttachForm from "./components/AttachForm.vue";
import { ref } from "vue";
import { useCreateUpdate } from "src/composables/create-update";
const { loading, create } = useCreateUpdate("services/materials/attach");
const service = ref({ name: null, id: null });
const setName = (payload) => {
  service.value = payload;
};

const onCreate = async (payload) => {
  await create(payload);
};
</script>
