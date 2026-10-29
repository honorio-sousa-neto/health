<template>
  <div>
    <q-form
      @submit.prevent="onSubmit"
      @reset="store.onResetForm"
      class="full-width"
    >
      <div>
        <div class="q-gutter-sm">
          <q-input
            outlined
            dense
            :rules="[required]"
            hint="Campo obrigatório *"
            v-model="store.form.name"
            type="text"
            label="Nome"
          />
          <q-input
            v-if="$route.params.id"
            readonly
            outlined
            dense
            :rules="[required]"
            hint="Campo obrigatório *"
            v-model="store.form.username"
            type="text"
            label="Nome de usuário"
          />
          <q-select
            outlined
            dense
            :rules="[required]"
            hint="Campo obrigatório *"
            v-model="store.form.role"
            type="text"
            label="Função"
            emit-value
            map-options
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
          <q-input
            outlined
            dense
            :rules="[required]"
            hint="Campo obrigatório *"
            v-model="store.form.phone"
            type="text"
            label="Contacto telefónico"
            mask="###-###-###"
          />
          <q-input
            outlined
            dense
            v-model="store.form.email"
            type="text"
            label="Email"
            class="q-mb-md"
          />
          <q-input
            outlined
            dense
            v-model="store.form.password"
            type="text"
            label="Palavra-passe"
            v-if="!$route.params.id"
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

    <q-dialog v-model="openDialogToDelete" persistent>
      <q-card square>
        <q-card-section class="">
          <div class="text-h6">Eliminar item</div>
          <div>Tem a certeza que quer eliminar este item?</div>
          <div class="row justify-end q-gutter-sm q-mt-xs">
            <q-btn
              no-caps
              rounded
              outline
              color="primary"
              icon="close"
              label="Cancelar"
              v-close-popup
            />
            <q-btn
              no-caps
              rounded
              color="red"
              icon="check"
              label="Sim"
              @click="deleteItem"
              :loading="deleteLoading"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup>
import { reactive, ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "src/stores/user";
import { required } from "src/utils/validation";
const store = useUserStore();
const route = useRoute();
const emits = defineEmits(["finished"]);
const loading = ref(false);
const onSubmit = async () => {
  try {
    const { success } = route.params.id
      ? await store.update(store.form, route.params.id)
      : await store.create(store.form);

    if (success) emits("finished");
  } catch (error) {
    console.log(error.message);
  }
};

onMounted(() => {
  if (route.params.id) store.show(route.params.id);
});

onUnmounted(() => store.onResetForm());
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
