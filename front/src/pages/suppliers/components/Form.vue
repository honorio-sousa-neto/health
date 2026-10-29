<template>
  <div>
    <q-form @submit.prevent="onSubmit" @reset="onReset">

      <!-- Identificação -->
      <div class="form-section-label">Identificação</div>
      <div class="row q-col-gutter-sm q-mb-lg">
        <div class="col-12 col-sm-8">
          <q-input
            v-model="form.name"
            class="fi fi--principal"
            borderless
            label="Nome do fornecedor *"
            :rules="[required]"
            lazy-rules
          />
        </div>
        <div class="col-12 col-sm-4">
          <q-input
            v-model="form.nif"
            class="fi"
            borderless
            label="NIF"
            mask="#########AA###"
            unmasked-value
          />
        </div>
      </div>

      <!-- Contacto -->
      <div class="form-section-label">Contacto</div>
      <div class="row q-col-gutter-sm q-mb-lg">
        <div class="col-12 col-sm-6">
          <q-input
            v-model="form.phone"
            class="fi"
            borderless
            label="Telefone"
            mask="###-###-###"
            unmasked-value
          />
        </div>
        <div class="col-12 col-sm-6">
          <q-input
            v-model="form.email"
            class="fi"
            borderless
            label="E-mail"
            type="email"
          />
        </div>
        <div class="col-12">
          <q-input
            v-model="form.address"
            class="fi"
            borderless
            label="Endereço"
          />
        </div>
      </div>

      <div class="form-actions">
        <ResetButton type="reset" />
        <SubmitButton :loading type="submit" />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import ResetButton from "src/components/common/buttons/ResetButton.vue";
import SubmitButton from "src/components/common/buttons/SubmitButton.vue";
import { required } from "src/utils/validation";
import { onMounted, reactive } from "vue";
import { useCreateUpdate } from "src/composables/create-update";
import { useRoute } from "vue-router";

const { fetchOne } = useCreateUpdate("suppliers");
const route = useRoute();
const emits = defineEmits(["create", "getName"]);
defineProps({ loading: { type: Boolean, default: false } });

const form = reactive({
  name: "",
  nif: "",
  address: "",
  phone: "",
  email: "",
});

onMounted(async () => {
  if (route.params.id) {
    const data = await fetchOne(route.params.id);
    Object.assign(form, data);
    emits("getName", { id: form.id, name: form.name });
  }
});

const onSubmit = () => emits("create", form);
const onReset = () => Object.assign(form, { name: "", nif: "", address: "", phone: "", email: "" });
</script>

<style scoped lang="scss">
.form-section-label {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text-faint);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--border-soft);
}
</style>
