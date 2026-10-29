<template>
  <Breadcrumbs>
    <template #children>
      <q-breadcrumbs-el
        label="Observação"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{ name: 'lista-observacao' }"
        class="text-grey"
      />
      <q-breadcrumbs-el
        label="Adicionar observação"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{ name: 'adicionar-observacao' }"
      />
    </template>
  </Breadcrumbs>
  <div class="q-pa-md">
    <q-form @submit="onSubmit">
      <ObservationSelect v-model="form.serviceId" />
      <q-btn
        color="primary"
        icon="las la-paper-plane"
        label="Enviar a recepção"
        @click="onClick"
        :loading
        type="submit"
      />
    </q-form>
  </div>
</template>
<script setup>
import { SessionStorage } from "quasar";
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import { onMounted, reactive } from "vue";
import { useCommom } from "src/composables/commom";
import ObservationSelect from "./ObservationSelect.vue";
const { create, loading } = useCommom("observations");
const user = SessionStorage.getItem("alfavida_user");

let form = reactive({
  nurseId: user.id,
  serviceId: null,
});

const onSubmit = async () => {
  await create(form);
};

onMounted(async () => {
  //  const data = await fetchOne(route.params.consultationId);
  //Object.assign(medicalConsultation, data);
});
</script>
