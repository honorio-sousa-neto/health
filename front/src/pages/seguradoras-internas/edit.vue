<template>
  <div class="q-pa-md">
    <div class="row">
      <q-btn
        color="grey-4"
        text-color="grey-9"
        outline
        icon="las la-edit"
        label="Editar"
        @click="isEditing = !isEditing"
      />
    </div>

    <div v-if="!store.loadings.loadingOne">
      <q-slide-transition>
        <div v-if="isEditing" class="q-pt-md">
          <Form />
        </div>
      </q-slide-transition>
      <q-slide-transition>
        <div v-if="!isEditing">
          <View />
        </div>
      </q-slide-transition>
    </div>
    <q-inner-loading :showing="store.loadings.loadingOne">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>
<script setup>
import Form from "src/components/seguradoras-internas/Form.vue";
import View from "./view.vue";

import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useInsuranceStore } from "src/stores/insurance";

const isEditing = ref(false);

const store = useInsuranceStore();
const route = useRoute();

const fetchData = async () => {
  try {
    await store.show(route.params.id);
  } catch (error) {
    console.log(error.message);
  }
};

onMounted(() => {
  fetchData();
});
</script>
