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
            <q-btn
              color="primary"
              label="Registro de entrada e saída"
              @click="router.push({ name: 'editing-stock-control' })"
            />
          </div>
        </div>
      </template>
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn
              size="sm"
              color="accent"
              round
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'remove' : 'add'"
            />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.value }}
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-slide-transition>
            <q-td colspan="100%">
              <div class="row q-gutter-sm">
                <q-input
                  class="col-3"
                  v-model.number="payload.qtd"
                  type="number"
                  outlined
                  dense
                  label="Quantidade"
                />
                <q-btn
                  color="primary"
                  icon="add"
                  no-caps
                  label="Adicionar ao stock"
                  @click="onSubmit(props.row.id)"
                />
              </div>
            </q-td>
          </q-slide-transition>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>
<script setup>
import { onMounted, ref, reactive } from "vue";
import { useFetch } from "src/composables/fetch";
import { useRouter } from "vue-router";
import { useNotify } from "src/composables/notify";

const { notify } = useNotify();
const router = useRouter();
const { index, update } = useFetch();
const loading = ref(false);
const rows = ref([]);
const selected = ref([]);

const columns = [
  { name: "name", field: "name", align: "left", label: "Nome" },
  {
    name: "description",
    field: "description",
    align: "left",
    label: "Descrição",
  },
  {
    name: "price",
    field: "price",
    align: "left",
    label: "Preço",
  },
  {
    name: "quantity",
    field: "quantity",
    align: "center",
    label: "Em stock",
  },
  {
    name: "min_quantity",
    field: "min_quantity",
    align: "center",
    label: "Quantidade mínima",
  },
];

function openEditPage(e, row, index) {
  router.push({ name: "editing-stock-control", params: { id: row.id } });
}
async function fetchData() {
  try {
    loading.value = true;
    const { data } = await index("materials");
    rows.value = data;
    loading.value = false;
  } catch (error) {}
}

const payload = reactive({
  qtd: null,
});

const onSubmit = async (id) => {
  try {
    loading.value = true;
    const { status, message } = await update(`materials/add-stock/${id}`, {
      material: id,
      quantity: payload.qtd,
      type: "ENTRADA",
    });
    loading.value = false;
    notify(status, message, "bottom");
    if (status) {
      payload.qtd = null;
      fetchData();
    }
  } catch (error) {
    console.log(error.message);
  }
};

onMounted(() => {
  fetchData();
});
</script>
