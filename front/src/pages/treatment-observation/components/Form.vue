<template>
  <q-form @submit="onSubmit" @reset="onReset">
    <q-input
      standout="bg-teal-8 text-white"
      v-model="store.form.name"
      type="text"
      label="Nome"
      :rules="[required]"
      lazy-rules
      dense
    />
    <q-input
      standout="bg-teal-8 text-white"
      v-model="store.form.description"
      type="text"
      label="Descrição"
      :rules="[required]"
      lazy-rules
      dense
    />
    <q-select
      v-model="store.form.serviceId"
      type="text"
      label="Conectar exame ao serviço"
      standout="bg-teal-8 text-white"
      use-input
      class="col-md-12 col-xs-12"
      :option-label="
        (item) =>
          item === null
            ? ''
            : item.name +
              `${item.description ? ' [' + item.description + ']' : ''}`
      "
      option-value="id"
      input-debounce="500"
      emit-value
      map-options
      @filter="filterFunction"
      :options="options"
      dense
      :rules="[required]"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-select>

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
import { useServiceStore } from "src/stores/service";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useTreatmentObservationStore } from "src/stores/treatment-observation";

const emits = defineEmits(['create'])
defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const store = useTreatmentObservationStore()
const onSubmit = async () => {
  emits('create')
};

const onReset = () => {
  store.onReset();
};

const options = ref([]);
const storeService = useServiceStore();
const filterFunction = async (val, update, abort) => {
  try {
    if (!val) return;
    update(async () => {
      const data = await storeService.filter("ENF", val);
      val = null;
      options.value = data;
    });
  } catch (error) {}
};

onMounted(async () => {
  if (route.params.id) {
    await store.show(route.params.id)
    options.value.push(store.form.service)
  }
})
</script>
