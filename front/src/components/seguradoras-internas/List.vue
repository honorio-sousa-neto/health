<template>
  <div class="q-my-md">
    <q-table
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
            <q-btn-group rounded>
              <q-btn label="PDF" @click="clickHandler1" />
              <q-btn label="Excel" @click="clickHandler2" />
            </q-btn-group>
          </div>
          <div>
            <q-btn
              color="primary"
              icon="add"
              label="Adicionar seguradora"
              @click="router.push({ name: 'editing-insurance' })"
            />
          </div>
        </div>
      </template>
    </q-table>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useFetch } from "src/composables/fetch";
import { useRouter } from "vue-router";

const router = useRouter();
const { index } = useFetch();
const loading = ref(false);
const rows = ref([]);
const selected = ref([]);

const columns = [
  { name: "name", field: "name", align: "left", label: "Nome" },
  {
    name: "phone_number",
    field: "phone_number",
    align: "left",
    label: "Contacto telefónico",
  },
  {
    name: "email",
    field: "email",
    align: "left",
    label: "Email",
  },
  {
    name: "website",
    field: "website",
    align: "left",
    label: "Website",
  },
  {
    name: "address",
    field: "address",
    align: "left",
    label: "Endereço",
  },
];

function openEditPage(e, row, index) {
  router.push({ name: "editing-insurance", params: { id: row.id } });
}
async function fetchData() {
  try {
    loading.value = true;
    const { data } = await index("insurances");
    rows.value = data;
    loading.value = false;
  } catch (error) {}
}
onMounted(() => {
  fetchData();
});
</script>
