<template>
  <div>
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="las la-arrow-left" class="btn-icone q-mr-sm"
        @click="$router.go(-1)" />
      <div>
        <div class="ep-nome">Novo consumível</div>
        <div class="ep-sub">Preencha os dados do consumível</div>
      </div>
    </div>

    <div class="form-card">
      <Form @create="onCreate" :loading @cancel="$router.go(-1)" />
    </div>
  </div>
</template>

<script setup>
import { useCreateUpdate } from "src/composables/create-update";
import Form from "./components/Form.vue";
import { useRouter } from "vue-router";

const { create, loading } = useCreateUpdate("materials");
const router = useRouter();

const onCreate = async (payload) => {
  const data = await create(payload);
  if (data) router.push({ name: "lista-materials" });
};
</script>

<style scoped lang="scss">
.ep-nome {
  font-size: var(--fs-heading);
  font-weight: var(--fw-semi);
  line-height: var(--lh-tight);
  color: var(--text);
}

.ep-sub {
  font-size: var(--fs-label);
  line-height: var(--lh-tight);
  color: var(--text-muted);
}
</style>
