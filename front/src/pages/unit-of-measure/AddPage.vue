<template>
  <div>
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="las la-arrow-left" color="grey-6" class="q-mr-sm"
        @click="$router.go(-1)" />
      <div>
        <div class="text-h6 text-weight-semibold">Nova unidade de medida</div>
        <div class="text-caption text-grey-5">Criar uma nova unidade com conversão opcional</div>
      </div>
    </div>

    <Form @create="onCreate" :loading />
  </div>
</template>

<script setup>
import { useCreateUpdate } from "src/composables/create-update";
import { useRouter } from "vue-router";
import Form from "./components/Form.vue";

const { create, loading } = useCreateUpdate("units-of-measure");
const router = useRouter();

const onCreate = async (data) => {
  const response = await create(data);
  if (response) router.push({ name: "unidades-de-medida" });
};
</script>
