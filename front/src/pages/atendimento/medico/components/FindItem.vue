<template>
  <q-select
    filled
    v-model="filter"
    use-input
    hide-selected
    fill-input
    input-debounce="300"
    :options="options"
    @filter="search"
    @update:model-value="$emit('selected', filter)"
    dense
    option-label="name"
    option-value="id"
    hint="Digite o nome do medicamento"
    label="Medicamento"
    class="q-my-md full-width"
    standout="bg-teal text-white"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey"> No results </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
<script setup>
import { api } from "src/boot/axios";
import { ref } from "vue";
const filter = ref("");
const options = ref([]);
defineEmits(["selected"]);
const search = async (val, update, abort) => {
  update(async () => {
    const { data } = await api.get("services/filter/find", {
      params: {
        search: val,
        perPage: 30,
        page: 1,
      },
    });
    options.value = data.data;
  });
};
</script>
