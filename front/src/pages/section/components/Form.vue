<template>
  <q-form @submit="onSubmit" @reset="onReset">
    <q-input
      standout="bg-teal-8 text-white"
      v-model="form.name"
      type="text"
      label="Nome"
      :rules="[required]"
      lazy-rules
    />
    <div class="row q-gutter-md">
      <q-btn
        rounded
        label="Submit"
        type="submit"
        color="primary"
        icon-right="las la-save"
      />
      <q-btn
        rounded
        label="Cancelar"
        outline
        type="reset"
        color="red-8"
        icon="las la-ban"
      />
    </div>
  </q-form>
</template>
<script setup>
import { useCreateUpdate } from "src/composables/create-update";
import { required } from "src/utils/validation";
import { onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
const { fetchOne } = useCreateUpdate("sections");
const route = useRoute();
let form = reactive({
  name: null,
});

const emit = defineEmits(["create", "setName"]);

const onSubmit = async () => {
  emit("create", form);
};

const fetchData = async (id) => {
  const data = await fetchOne(id);
  Object.assign(form, data);
  return data;
};
onMounted(async () => {
  if (route.params.id) {
    const data = await fetchData(route.params.id);
    emit("setName", { name: data.name, id: data.id });
  }
});

const onReset = () => {
  store.onReset();
};
</script>
