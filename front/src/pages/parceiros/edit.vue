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
        <div v-if="isEditing">
          <div class="q-my-md">
            <Form />
          </div>
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
import Form from "src/components/parceiros/Form.vue";
import View from "./view.vue";

import { onMounted, ref, reactive } from "vue";
import { useRoute } from "vue-router";
import { usePartnerStore } from "src/stores/partner";

const isEditing = ref(false);

const store = usePartnerStore();
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
