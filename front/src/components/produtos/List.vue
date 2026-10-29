<template>
  <div class="q-my-md">
    <q-table
      v-if="isAttending"
      :rows="rows"
      :columns="columns"
      row-key="id"
      flat
      bordered
      square
      :loading="loading"
      :pagination="{ rowsPerPage: 10 }"
      selection="multiple"
      v-model:selected="selected"
    >
      <template v-slot:top>
        <div class="row full-width justify-between q-mx-md">
          <div>
            <q-input
              outlined
              dense
              v-model="text"
              type="text"
              label="Pesquisar"
            />
          </div>
          <div>
            <q-btn
              color="primary"
              icon="add"
              label="Adicionar serviço"
              @click="router.push({ name: 'editing-product' })"
            />
          </div>
        </div>
      </template>
    </q-table>
    <q-table
      v-else
      :rows="rows"
      :columns="columns"
      row-key="id"
      flat
      bordered
      square
      :loading="loading"
      :pagination="{ rowsPerPage: 10 }"
      selection="multiple"
      v-model:selected="selected"
      @row-click="openEditPage"
    >
      <template v-slot:top>
        <div class="row full-width justify-between q-mx-md">
          <div>
            <q-select
              outlined
              dense
              v-model="category"
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
              style="width: 200px"
            />
          </div>
          <div>
            <q-btn
              color="primary"
              icon="add"
              label="Adicionar produto"
              @click="router.push({ name: 'editing-product' })"
            />
          </div>
        </div>
      </template>
    </q-table>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import { useFetch } from "src/composables/fetch";
import { useRouter } from "vue-router";

const props = defineProps({
  isAttending: {
    type: Boolean,
  },
});
const router = useRouter();
const { index } = useFetch();
const loading = ref(false);
const rows = ref([]);
const selected = ref([]);
const category = ref("ENF");
const columns = [
  { name: "title", field: "title", align: "left", label: "Serviço" },
  {
    name: "description",
    field: "description",
    align: "left",
    label: "Descrição",
  },
  {
    name: "category",
    field: "category",
    align: "left",
    label: "Categoria",
  },
  {
    name: "net_price",
    field: "net_price",
    align: "left",
    label: "Preço",
    format: (val) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(val),
  },
];

function openEditPage(e, row, index) {
  router.push({ name: "editing-product", params: { id: row.id } });
}
async function fetchData() {
  try {
    loading.value = true;
    const { data } = await index(`products/index/${category.value}`);
    rows.value = data;
    loading.value = false;
  } catch (error) {}
}

watch(category, () => {
  fetchData();
});

onMounted(() => {
  fetchData();
});
</script>
