<template>
  <div>
    <q-form @submit.prevent="onSubmit" @reset="onReset">
      <div>
        <div>
          <SelectBank
            :rules="[required]"
            lazy-rules
            v-model:bank="form.bankAccountId"
          />
          <q-input
            outlined
            v-model.number="form.amount"
            type="number"
            label="Montante"
            :rules="[required]"
          />
        </div>
      </div>
      <div class="q-mt-sm q-gutter-sm">
        <q-btn
          rounded
          icon="las la-save"
          label="Salvar"
          type="submit"
          color="primary"
          :loading="loading"
        />
        <q-btn
          label="Limpar"
          rounded
          icon="las la-eraser"
          type="reset"
          color="primary"
          outline
        />
      </div>
    </q-form>
  </div>
</template>
<script setup>
import { onMounted, reactive } from "vue";
import { useCreateUpdate } from "src/composables/create-update";
import { useRoute } from "vue-router";
import SelectBank from "./SelectBank.vue";
import { required } from "src/utils/validation";
const { fetchOne } = useCreateUpdate("suppliers");
const route = useRoute();

const emits = defineEmits(["create", "getName"]);

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});
let form = reactive({
  bankAccountId: "",
  amount: "",
});

onMounted(async () => {
  if (route.params.id) {
    const data = await fetchOne(route.params.id);
    Object.assign(form, data);
    emits("getName", { id: form.id, name: form.name });
  }
});

const onSubmit = async () => {
  emits("create", form);
};
</script>

<style scoped lang="scss">
.custom-btn {
  font-size: smaller;
  color: $primary;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
