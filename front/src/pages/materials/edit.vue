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
          <Form :form="form" />
        </div>
      </q-slide-transition>
      <q-slide-transition>
        <div v-if="!isEditing">
          <View :form="form" />
        </div>
      </q-slide-transition>
    </div>
    <q-inner-loading :showing="store.loadings.loadingOne">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>
<script setup>
import Form from "src/components/materials/Form.vue";
import View from "./view.vue";

import { onMounted, ref, reactive } from "vue";
import { useRoute } from "vue-router";
import { useMaterialStore } from "src/stores/material";

const isEditing = ref(false);

const store = useMaterialStore();
const route = useRoute();
const form = reactive({
  name: null,
  description: null,
  unit_price: null,
  sale_price: null,
  discount: null,
  materials: [],
});

const fetchData = async () => {
  try {
    const { data } = await store.show(route.params.id);
    Object.assign(form, data.data);
    form.materials = data.data.serviceExpendableMaterial || [];
  } catch (error) {
    console.log(error.message);
  }
};

onMounted(() => {
  fetchData();
});
</script>
