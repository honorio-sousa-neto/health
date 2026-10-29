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
              label="Adicionar método de pagamento"
              @click="router.push({ name: 'editing-payment' })"
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
  { name: "title", field: "title", align: "left", label: "Título" },
  {
    name: "code",
    field: "code",
    align: "left",
    label: "Código",
  },
];

function openEditPage(e, row, index) {
  router.push({ name: "editing-payment", params: { id: row.id } });
}
async function fetchData() {
  try {
    loading.value = true;
    const { data } = await index("payments");
    rows.value = data;
    loading.value = false;
  } catch (error) {}
}
onMounted(() => {
  fetchData();
});
</script>
