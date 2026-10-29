<template>
  <div>
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="las la-arrow-left" color="grey-6" class="q-mr-sm"
        @click="$router.go(-1)" />
      <div>
        <div class="text-h6 text-weight-semibold">{{ name || 'Editar fornecedor' }}</div>
        <div class="text-caption text-grey-5">Actualizar dados do fornecedor</div>
      </div>
    </div>

    <div class="form-card">
      <Form @create="onCreate" :loading @get-name="(p) => (name = p.name)" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useCreateUpdate } from "src/composables/create-update";
import { useRoute, useRouter } from "vue-router";
import Form from "./components/Form.vue";

const { loading, update } = useCreateUpdate("suppliers");
const router = useRouter();
const route = useRoute();
const name = ref("");

const onCreate = async (payload) => {
  const data = await update(payload, route.params.id);
  if (data) router.push({ name: "lista-fornecedores" });
};
</script>
