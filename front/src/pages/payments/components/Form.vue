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
          <q-input v-model="form.code" class="fi" borderless label="Código" />
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

const { fetchOne } = useCreateUpdate("payments");
const emits = defineEmits(["create", "getName", "cancel"]);
defineProps({ loading: { type: Boolean, default: false } });

const form = reactive({ name: "", code: "" });

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
