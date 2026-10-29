<template>
  <div class="q-mx-md">
    <div class="text-h6 text-weight-regular">Novo registro</div>
    <Form @create="onCreate" />
  </div>
</template>
<script setup>
import { useRoute, useRouter } from "vue-router";
import Form from "./components/Form.vue";
import { useInternStore } from "src/stores/intern";
import { nextTick, onBeforeMount, onMounted } from "vue";
const store = useInternStore();
const route = useRoute();
const router = useRouter();

const onCreate = async () => {
  const { success } = await store.update(store.form, route.params.id);
  router.go(-1);
};
onBeforeMount(async () => {
  await store.show(route.params.id);
  await nextTick();
});
</script>
