<template>
  <div>
    <q-form @submit.prevent="onSubmit" @reset="onReset">
      <div>
        <q-input
          v-model="form.name"
          standout="bg-teal text-white"
          type="text"
          label="Nome"
        />
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
import { useCreateUpdate } from "src/composables/create-update";
import { useGroupStore } from "src/stores/group";
import { onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
const groupStore = useGroupStore();
const { fetchOne } = useCreateUpdate("groups");
const emit = defineEmits(["create", "get-name"]);
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});
const route = useRoute();
let form = reactive({
  name: null,
  parentId: null,
});
const onSubmit = async () => {
  const { parentId, name } = form;
  emit("create", { name, parentId });
};

const getName = async () => {
  const response = await fetchOne(route.params.id);
  if (route.name == "subgrupos") {
    form.parentId = route.params.id;
  } else {
    Object.assign(form, response);
  }
  emit("get-name", response);
};

onMounted(() => {
  if (route.params.id) getName();
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
