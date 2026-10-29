<template>
  <div>
    <div>
      <div
        class="text-h6 text-weight-light q-mb-md row justify-between items-center"
      >
        <div>
          {{ $route.params.id ? "Editar Produto" : "Adicionar Produto" }}
        </div>
        <div v-if="$route.params.id">
          <q-btn
            color="red"
            rounded
            no-caps
            icon="las la-trash"
            label="Remover item"
            @click="openDialogToDelete = true"
          />
        </div>
      </div>
      <q-linear-progress indeterminate v-if="load" />
    </div>
    <q-form @submit.prevent="onSubmit" @reset="onReset">
      <div>
        <div class="q-gutter-sm">
          <q-input
            outlined
            dense
            v-model="form.title"
            type="text"
            label="Nome"
          />
          <q-input
            outlined
            dense
            v-model="form.description"
            type="text"
            label="Descrição"
          />
          <q-select
            outlined
            dense
            v-model="form.category"
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
            emit-value
            map-options
          />
          <q-input
            outlined
            dense
            v-model="form.net_price"
            type="number"
            step="0.001"
            min="1"
            label="Preço"
          />
          <q-input
            v-if="user.role == 'admin'"
            outlined
            v-model="form.discount"
            type="number"
            step="0.001"
            min="0"
            label="Desconto"
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
import { reactive, ref, onMounted } from "vue";
import { useFetch } from "src/composables/fetch";
import { useNotify } from "src/composables/notify";
import { useRoute, useRouter } from "vue-router";
import { SessionStorage } from "quasar";
const route = useRoute();
const router = useRouter();
const { store, show, update: updateForm, destroy } = useFetch();
const { notify } = useNotify();
const user = SessionStorage.getItem("alfavida_user");
let form = reactive({
  title: null,
  description: null,
  net_price: null,
  category: null,
  discount: 0,
});

const openDialogToDelete = ref(false);

const onReset = () => {
  form.nome = null;
  form.nivel = null;
};

const loading = ref(false);
const onSubmit = async () => {
  try {
    loading.value = true;
    const { status, message } = route.params.id
      ? await updateForm(`products/${route.params.id}`, form)
      : await store("products", form);
    loading.value = false;
    notify(status, message, "bottom");
    if (status) {
      router.back();
    }
  } catch (error) {
    console.log(error.message);
  }
};

const load = ref(false);
async function update(id) {
  try {
    load.value = true;
    const { data } = await show("products", id);
    const aux = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, data[key]])
    );
    Object.assign(form, aux);
    load.value = false;
  } catch (error) {}
}

const deleteLoading = ref(false);
const deleteItem = async () => {
  try {
    deleteLoading.value = true;
    const { status, message } = await destroy("products", route.params.id);
    deleteLoading.value = false;
    notify(status, message, "bottom");
    if (status) {
      openDialogToDelete.value = false;
      router.push({ name: "list-products" });
    }
  } catch (error) {}
};

onMounted(() => {
  if (route.params.id) {
    update(route.params.id);
  }
});
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
