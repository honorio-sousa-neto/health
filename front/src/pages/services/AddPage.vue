<template>
  <div>
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="las la-arrow-left" class="btn-icone q-mr-sm"
        @click="$router.go(-1)" />
      <div>
        <div class="ep-nome">Novo serviço</div>
        <div class="ep-sub">Preencha os dados do serviço</div>
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

const { create, loading } = useCreateUpdate("services");
const router = useRouter();

// Antes o `if (data)` estava vazio: gravava e ficava no formulário, sem dizer
// que tinha gravado nem deixar ver o registo criado.
const onCreate = async (data) => {
  const response = await create(data);
  if (response) router.push({ name: "list-services" });
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
