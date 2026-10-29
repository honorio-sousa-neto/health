<template>
  <div>
    <q-form @submit.prevent="onSubmit" @reset="onReset">
      <div>
        <div>
          <q-input
            outlined
            v-model="form.name"
            type="text"
            label="Nome"
            :rules="[required]"
            lazy-rules
          />
          <q-input
            outlined
            v-model="form.nif"
            type="text"
            label="NIF"
            mask="#########AA###"
            class="q-mb-md"
          />
          <q-input
            outlined
            v-model="form.email"
            type="text"
            label="Email"
            class="q-mb-md"
          />
          <q-input
            outlined
            v-model="form.phone"
            type="text"
            label="Contacto telefónico"
            mask="###-###-###"
            class="q-mb-md"
            unmasked-value
          />
          <q-input
            outlined
            v-model="form.address"
            type="text"
            label="Endereço"
            class="q-mb-md"
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
  name: "",
  nif: "",
  address: "",
  phone: "",
  email: "",
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
