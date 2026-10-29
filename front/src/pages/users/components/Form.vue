<template>
  <div>
    <q-form @submit.prevent="onSubmit" @reset="onReset">

      <!-- Identificação -->
      <div class="form-section-label">Identificação</div>
      <div class="row q-col-gutter-sm q-mb-sm">
        <div class="col-12">
          <q-input v-model="form.name" class="fi fi--principal" borderless label="Nome *"
            :rules="[required]" lazy-rules />
        </div>
      </div>
      <div class="row q-col-gutter-sm q-mb-lg">
        <div class="col-12 col-sm-6">
          <q-input v-if="$route.params.id" v-model="form.username" class="fi" borderless
            label="Nome de utilizador" readonly />
        </div>
        <div class="col-12 col-sm-6">
          <q-select v-model="form.role" class="fi" borderless label="Função *"
            :rules="[required]" lazy-rules emit-value map-options
            :options="[
              { label: 'Administrador', value: 'admin' },
              { label: 'Atendente / Recepcionista', value: 'attendant' },
              { label: 'Médico', value: 'doctor' },
              { label: 'Enfermeiro (a)', value: 'nurse' },
              { label: 'Analista', value: 'analyst' },
              { label: 'Técnico de laboratório', value: 'techLab' },
              { label: 'Chefe de laboratório', value: 'chiefLab' },
              { label: 'Técnico de enfermagem', value: 'techNursian' },
              { label: 'Responsável de inventário', value: 'inventory' },
            ]"
          />
        </div>
      </div>

      <!-- Contacto -->
      <div class="form-section-label">Contacto</div>
      <div class="row q-col-gutter-sm q-mb-lg">
        <div class="col-12 col-sm-6">
          <q-input v-model="form.phone" class="fi" borderless label="Telefone *"
            mask="###-###-###" :rules="[required]" lazy-rules />
        </div>
        <div class="col-12 col-sm-6">
          <q-input v-model="form.email" class="fi" borderless label="E-mail" />
        </div>
      </div>

      <!-- Acesso -->
      <div v-if="!$route.params.id">
        <div class="form-section-label">Acesso</div>
        <div class="row q-col-gutter-sm q-mb-lg">
          <div class="col-12 col-sm-6">
            <q-input v-model="form.password" class="fi" borderless label="Palavra-passe" type="password" />
          </div>
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

const { fetchOne } = useCreateUpdate("users");
const emits = defineEmits(["create", "getName", "cancel"]);
defineProps({ loading: { type: Boolean, default: false } });

const form = reactive({
  name: "", username: "", role: null, email: "", phone: "", password: "",
});

const onSubmit = () => emits("create", form);
const onReset = () => emits("cancel");

const route = useRoute();
onMounted(async () => {
  if (route.params.id) {
    const data = await fetchOne(route.params.id);
    emits("getName", { name: data.name, id: data.id });
    Object.assign(form, data);
  }
});
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
