<template>
  <div>
    <q-select
      :options="clients"
      use-input
      label="Cliente"
      outlined
      dense
      input-debounce="300"
      @filter="filterFn"
      emit-value
      map-options
      option-label="name"
      clearable
      option-value="id"
      v-model="client"
      :loading="loading"
      :readonly="document == 'RC'"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey"> No results </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>
<script setup>
import { ref, onMounted, defineModel, watch } from "vue";
import { useFetch } from "src/composables/fetch";
defineProps(["document"]);
const emit = defineEmits(["get-protocol"]);
const client = defineModel("client", { default: null });

const loading = ref(false);
const clients = ref([]);
let staticOptions = [];
async function fetchClients() {
  try {
    loading.value = true;
    const { data } = await useFetch().index("clients");
    clients.value = data;
    staticOptions = data;
    loading.value = false;
  } catch (error) {}
}

watch(client, (current) => {
  const protocol = clients.value.find(
    (item) => item.id == current
  )?.protocol_data;

  const insuranced = clients.value.find(
    (item) => item.id == current
  )?.insurance_company;

  if (protocol) {
    emit("get-protocol", {
      protocol: protocol?.value,
      insuranced: Boolean(insuranced),
    });
  } else {
    emit("get-protocol", {
      protocol: protocol?.value || 0,
      insuranced: Boolean(insuranced),
    });
  }
});

function filterFn(val, update) {
  if (val === "") {
    update(() => {
      clients.value = staticOptions;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    clients.value = staticOptions.filter(
      (v) => v.name.toLowerCase().indexOf(needle) > -1
    );
  });
}

onMounted(() => {
  fetchClients();
});
</script>
<style></style>
