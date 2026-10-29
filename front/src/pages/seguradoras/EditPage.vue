<template>
  <div>
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="las la-arrow-left" color="grey-6" class="q-mr-sm"
        @click="$router.go(-1)" />
      <div>
        <div class="text-h6 text-weight-semibold">{{ insurance.name || 'Seguradora' }}</div>
        <div class="text-caption text-grey-5">Ficha da seguradora</div>
      </div>
    </div>

    <div class="form-card">
      <Form @create="onCreate" :loading @get-name="setName" />
    </div>
  </div>
</template>

<script setup>
import { useCreateUpdate } from "src/composables/create-update";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Form from "./components/Form.vue";

const { update, loading } = useCreateUpdate("insurances");
const router = useRouter();
const route = useRoute();

const onCreate = async (data) => {
  const response = await update(data, route.params.id);
  if (response) router.push({ name: "lista-seguradoras" });
};

const insurance = ref({ name: null, id: null });
const setName = (payload) => Object.assign(insurance.value, payload);
</script>
