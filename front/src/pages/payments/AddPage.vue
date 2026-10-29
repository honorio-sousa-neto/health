<template>
  <div>
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="las la-arrow-left" color="grey-6" class="q-mr-sm"
        @click="$router.go(-1)" />
      <div>
        <div class="text-h6 text-weight-semibold">Novo método de pagamento</div>
        <div class="text-caption text-grey-5">Preencha os dados do método de pagamento</div>
      </div>
    </div>

    <div class="form-card">
      <Form @create="onCreate" :loading />
    </div>
  </div>
</template>

<script setup>
import { useCreateUpdate } from "src/composables/create-update";
import Form from "./components/Form.vue";
import { useRouter } from "vue-router";

const { create, loading } = useCreateUpdate("payments");
const router = useRouter();

const onCreate = async (data) => {
  const response = await create(data);
  if (response) router.push({ name: "lista-pagamentos" });
};
</script>
