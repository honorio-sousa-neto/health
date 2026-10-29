<template>
  <div>
    <q-form @submit.prevent="onSubmit" @reset="onReset">
      <div>
        <div class="q-gutter-sm">
          <q-input
            standout="bg-teal-8 text-white"
            v-model="form.name"
            type="text"
            label="Nome"
          />
          <q-input
            standout="bg-teal-8 text-white"
            v-model.number="form.amount"
            type="number"
            label="Custo"
          />
          <q-input
            standout="bg-teal-8 text-white"
            v-model.number="form.tax"
            type="number"
            label="Taxa"
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
          :loading
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
const { fetchOne } = useCreateUpdate("drugs");
const route = useRoute();

const emits = defineEmits(["create", "getName"]);
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});

let form = reactive({
  name: "",
  amount: 0,
  tax: 0,
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
