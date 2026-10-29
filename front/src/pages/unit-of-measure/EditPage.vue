<template>
  <div>
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="las la-arrow-left" color="grey-6" class="q-mr-sm"
        @click="$router.go(-1)" />
      <div>
        <div class="text-h6 text-weight-semibold">{{ name || 'Editar unidade' }}</div>
        <div class="text-caption text-grey-5">Actualizar dados da unidade de medida</div>
      </div>
    </div>

    <Form @create="onSave" @get-name="(p) => (name = p.name)" :loading />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useCreateUpdate } from "src/composables/create-update";
import { useRoute, useRouter } from "vue-router";
import Form from "./components/Form.vue";

const { update, loading } = useCreateUpdate("units-of-measure");
const router = useRouter();
const route  = useRoute();
const name   = ref("");

const onSave = async (payload) => {
  const data = await update(payload, route.params.id);
  if (data) router.push({ name: "unidades-de-medida" });
};
</script>
