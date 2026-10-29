<template>
  <q-select
    v-model="customer"
    type="text"
    label="Cliente"
    standout="bg-teal-8 text-white"
    use-input
    option-label="name"
    option-value="id"
    input-debounce="500"
    @filter="filterFunction"
    :options="options"
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
import { ref } from "vue";
import { api } from "src/boot/axios";

const customer = defineModel();

const options = ref([]);
const filterFunction = async (val, update, abort) => {
  try {
    if (!val) return;
    update(async () => {
      const { data } = await api.get("customers/filter/search", {
        params: { search: val },
      });
      val = null;
      options.value = data.data;
    });
  } catch (error) {}
};
</script>
