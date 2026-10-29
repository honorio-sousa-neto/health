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
        :label="imagiologyCurrent.name"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{ name: 'editar-imagiologia' }"
      />
    </template>
  </Breadcrumbs>
  <div class="q-pa-md">
    <Form @create="onSubmit" @get-name="setName" />
  </div>
</template>
<script setup>
import { useRoute } from "vue-router";
import Form from "./components/Form.vue";
import { useImagiologyStore } from "src/stores/imagiology";
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import { onMounted, reactive } from "vue";
const store = useImagiologyStore();
const route = useRoute();

const onSubmit = async () => {
  await store.update(store.form, route.params.id);
};
const imagiologyCurrent = reactive({
  name: null,
  id: null,
});
const setName = (imagiology) => {
  Object.assign(imagiologyCurrent, imagiology);
};
</script>
