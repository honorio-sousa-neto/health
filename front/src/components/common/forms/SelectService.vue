<template>
  <q-select
    v-model="serviceId"
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
    :rules="[required]"
  >
    <template v-slot:prepend>
      <q-icon name="search" />
    </template>
  </q-select>
</template>
<script setup>
import { useSearch } from "src/composables/search";
import { ref, watch } from "vue";
import { required } from "src/utils/validation";
const { filter } = useSearch("services");
const serviceId = defineModel("service");
const options = ref([]);

const props = defineProps({
  servico: {
    type: Object,
  },
});
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

watch(
  () => props.servico,
  (current) => {
    options.value.push(current);
  }
);
</script>
