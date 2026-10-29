<template>
  <div>
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
      <SelectService v-model:service="form.serviceId" :servico="form.service" />
      <q-select
        standout="bg-teal-8 text-white"
        v-model="form.area"
        type="text"
        label="Categoria"
        :options="[
          { label: 'Enfermaria', value: 'ENF' },
          { label: 'Farmácia', value: 'FAR' },
          { label: 'Laboratório', value: 'LAB' },
          { label: 'Estomatologia', value: 'EST' },
          { label: 'Ecografia', value: 'ECO' },
          { label: 'Raio-X', value: 'RX' },
          { label: 'Especialidade', value: 'ESP' },
        ]"
        :rules="[(val) => !!val || 'Campo obrigatório']"
        lazy-rules
        map-options
        emit-value
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
  </div>
</template>
<script setup>
import { onMounted, reactive } from "vue";
import { useCreateUpdate } from "src/composables/create-update";
import { useRoute } from "vue-router";
import SelectService from "src/components/common/forms/SelectService.vue";
import { required } from "src/utils/validation";
const { fetchOne } = useCreateUpdate("consultations");
const route = useRoute();

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
  area: null,
  service: null,
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
