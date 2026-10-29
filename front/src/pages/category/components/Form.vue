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
        <div class="col-12">
          <q-select
            v-model="form.categoryId"
            class="fi"
            borderless
            label="Categoria pai (opcional)"
            clearable
            use-input
            input-debounce="300"
            option-label="name"
            option-value="id"
            map-options
            emit-value
            :options="filteredCategories"
            popup-content-class="fi-popup"
            @filter="filterCategories"
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
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useCreateUpdate } from "src/composables/create-update";
import { useCategoryStore } from "src/stores/category";

const { fetchOne } = useCreateUpdate("categories");
const categoryStore = useCategoryStore();
const emits = defineEmits(["create", "getName", "cancel"]);
defineProps({ loading: { type: Boolean, default: false } });

const route = useRoute();
const allCategories = ref([]);
const filteredCategories = ref([]);

const form = reactive({ name: null, categoryId: null });

const filterCategories = (val, update) => {
  update(() => {
    const needle = val.toLowerCase();
    filteredCategories.value = needle
      ? allCategories.value.filter((c) => c.name.toLowerCase().includes(needle))
      : allCategories.value;
  });
};

const onSubmit = () => emits("create", form);
const onReset = () => emits("cancel");

onMounted(async () => {
  await categoryStore.index();
  allCategories.value = categoryStore.data;
  filteredCategories.value = categoryStore.data;

  if (route.params.id) {
    const data = await fetchOne(route.params.id);
    Object.assign(form, { name: data.name, categoryId: data.categoryId ?? null });
    emits("getName", { name: data.name, id: data.id });
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
