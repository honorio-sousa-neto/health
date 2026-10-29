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
      selection="single"
      v-model:selected="clientSelected"
    >
      <template v-slot:top>
        <div class="row full-width justify-between q-mx-md">
          <div>
            <q-input
              outlined
              dense
              v-model="filter"
              type="text"
              label="Pesquisar"
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
      :filter="filter"
    >
      <template v-slot:top>
        <div class="row full-width justify-between q-mx-md">
          <div>
            <q-btn-group rounded>
              <q-btn label="PDF" @click="clickHandler1" />
              <q-btn label="Excel" @click="clickHandler2" />
            </q-btn-group>
          </div>
          <div>
            <q-btn
              color="primary"
              icon="add"
              label="Adicionar cliente"
              @click="router.push({ name: 'editing-client' })"
            />
          </div>
        </div>
        <div class="q-mt-md">
          <q-input
            v-model="filter"
            outlined
            type="text"
            label="Pesquisar..."
            dense
          />
        </div>
      </template>
    </q-table>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useFetch } from "src/composables/fetch";
import { useRouter } from "vue-router";

const [clientSelected] = defineModel("client", { default: [] });

const filter = ref(null);
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
const columns = [
  { name: "name", field: "name", align: "left", label: "Cliente" },
  {
    name: "protocol",
    field: (row) => row?.protocol_data?.name,
    align: "left",
    label: "Protocolo",
  },
  {
    name: "email",
    field: "email",
    align: "left",
    label: "Email",
  },
  {
    name: "nif",
    field: "nif",
    align: "left",
    label: "NIF",
  },
  {
    name: "phone_number",
    field: "phone_number",
    align: "left",
    label: "Contacto telefónico",
  },
  {
    name: "source",
    field: "source",
    align: "left",
    label: "Origem",
  },
  {
    name: "insurance_company",
    field: (row) => row?.insurance_company?.name,
    align: "left",
    label: "Seguradora",
  },
];
function openEditPage(e, row, index) {
  router.push({ name: "editing-client", params: { id: row.id } });
}
async function fetchData() {
  try {
    loading.value = true;
    const { data } = await index("clients");
    rows.value = data;
    loading.value = false;
  } catch (error) {}
}
onMounted(() => {
  fetchData();
});
</script>
