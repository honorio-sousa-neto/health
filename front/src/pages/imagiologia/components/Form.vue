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
    <q-input
      standout="bg-teal-8 text-white"
      v-model="form.description"
      type="text"
      label="Descrição"
      :rules="[required]"
      lazy-rules
    />
    <SelectService :servico="form.service" v-model:service="form.serviceId" />

    <div class="row q-gutter-md">
      <q-btn
        rounded
        label="Submit"
        type="submit"
        color="primary"
        icon-right="las la-save"
        :loading
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
import { required } from "src/utils/validation";
import { ref, onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
import SelectService from "src/components/common/forms/SelectService.vue";
import { useCreateUpdate } from "src/composables/create-update";

const { fetchOne } = useCreateUpdate("imagiologies");

const emits = defineEmits(["create", "getName"]);
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});

let form = reactive({
  name: null,
  description: null,
  serviceId: null,
  service: null,
});

const route = useRoute();

const onSubmit = async () => {
  emits("create", form);
};

onMounted(async () => {
  if (route.params.id) {
    const data = await fetchOne(route.params.id);
    Object.assign(form, data);
    emits("getName", { name: data.name, id: data.id });
  }
});
</script>
