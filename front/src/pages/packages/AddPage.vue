<template>
  <div class="q-mx-md">
    <div class="text-h6 text-weight-regular">Novo registro</div>
    <Form @create="onCreate" />
  </div>
</template>
<script setup>
import Form from "./components/Form.vue";
import { useInternStore } from "src/stores/intern";
const store = useInternStore();

const onCreate = async () => {
  await store.create(store.form);
};
</script>
