<template>
  <div class="row justify-between q-mt-xs q-gutter-sm">
    <q-select
      class="col"
      v-model="group"
      :options="groupStore.state.groups"
      option-value="id"
      option-label="name"
      map-options
      emit-value
      standout="bg-teal-8 text-white"
      :rules="[(val) => !!val || 'Campo obrigatório']"
      lazy-rules
      label="Categoria"
      @update:model-value="getSubgroups"
    />
    <q-select
      class="col"
      v-model="category"
      :options="subgroups"
      label="Sub-categoria"
      map-options
      emit-value
      standout="bg-teal-8 text-white"
      :rules="[(val) => !!val || 'Campo obrigatório']"
      lazy-rules
      option-value="id"
      option-label="name"
    />
  </div>
</template>
<script setup>
import { useCreateUpdate } from "src/composables/create-update";
import { useGroupStore } from "src/stores/group";
import { onMounted, ref } from "vue";

const { fetchOne } = useCreateUpdate("groups");
const groupStore = useGroupStore();
const group = ref(null);
const category = defineModel("category");
onMounted(() => {
  groupStore.index();
});

const subgroups = ref([]);
const getSubgroups = async (val) => {
  if (!val) return;
  category.value = null;
  const response = await fetchOne(val);
  subgroups.value = response.subgroups;
};
</script>
