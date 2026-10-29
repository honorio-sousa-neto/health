<template>
  <q-select
    v-model="materialId"
    type="text"
    label="Pesquisa"
    standout="bg-teal-8 text-white"
    use-input
    dense
    :option-label="
      (item) =>
        item === null
          ? ''
          : item.name +
            `${item.description ? ' [' + item.description + ']' : ''}`
    "
    option-value="id"
    input-debounce="500"
    @filter="filterFunction"
    :options="options"
    class="q-pr-sm"
    v-on:update:model-value="addToList"
  >
    <!-- <template v-slot:prepend>
      <q-btn
        color="teal-8 text-white"
        flat
        round
        dense
        icon="las la-plus"
        @click="isCreating = !isCreating"
      />
    </template> -->
  </q-select>
</template>
<script setup>
import { useSearch } from "src/composables/search";
import { ref } from "vue";
const { filter } = useSearch("materials");
const materialId = ref(null);
const emits = defineEmits(["addToList"]);
const options = ref([]);
const filterFunction = async (val, update, abort) => {
  try {
    if (!val) return;
    update(async () => {
      const data = await filter(val);
      val = null;
      options.value = data;
    });
  } catch (error) {}
};

const addToList = (payload) => {
  emits("addToList", payload);
  materialId.value = null;
};
</script>
