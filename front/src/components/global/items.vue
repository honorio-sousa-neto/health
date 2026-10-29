<template>
  <q-table
    title="Itens"
    square
    :rows="produtos"
    :columns="columns"
    row-key="id"
    selection="multiple"
    v-model:selected="selectedItems"
    :pagination="{ rowsPerPage: 0 }"
    :loading="loading"
    :flat="isAttending"
    :filter="text"
  >
    <template v-slot:top>
      <div class="row full-width justify-between q-mx-md">
        <div class="row items-center q-gutter-md">
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
          <div class="text-h6">Protocolo: {{ protocol }}</div>
        </div>
        <div>
          <!-- <q-btn
            color="primary"
            icon="add"
            label="Adicionar serviço"
            @click="router.push({ name: 'editing-service' })"
          /> -->
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
          <q-checkbox size="sm" color="primary" v-model="props.selected" />
        </q-td>
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.value }}
        </q-td>
      </q-tr>
      <q-tr v-if="props.selected" :props="props">
        <q-td colspan="100%">
          <div class="row q-gutter-md items-center">
            <q-input
              v-model="
                selectedItems[
                  selectedItems.findIndex((item) => item.id == props.row.id)
                ].quantity
              "
              type="number"
              label="Quantidade"
              outlined
              dense
              min="1"
              hint=""
            />
            <q-input
              v-model="
                selectedItems[
                  selectedItems.findIndex((item) => item.id == props.row.id)
                ].total
              "
              type="text"
              label="Preco"
              outlined
              dense
              step="0.001"
              min="1"
              :readonly="!insuranced"
              :hint="
                'Preço base:  ' +
                produtosAux.find((item) => item.id == props.row.id).net_price
              "
            />
            <div class="text-body1">
              Total
              <span>{{
                new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: "AOA",
                }).format(
                  selectedItems[
                    selectedItems.findIndex((item) => item.id == props.row.id)
                  ].total *
                    selectedItems[
                      selectedItems.findIndex((item) => item.id == props.row.id)
                    ].quantity
                )
              }}</span>
            </div>
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
<script setup>
import { useFetch } from "src/composables/fetch";
import { onMounted, ref, defineModel, watch } from "vue";

const props = defineProps({
  isAttending: {
    type: Boolean,
  },
  protocol: {
    type: Number,
  },
  insuranced: {
    type: Boolean,
  },
  text: {
    type: String,
  },
});
const { index } = useFetch();
const selectedItems = defineModel("items", { default: [] });
const columns = [
  {
    name: "title",
    field: "item",
    label: "Produto / serviço",
    align: "left",
  },
  {
    name: "decription",
    field: "description",
    label: "Descrição",
    align: "left",
  },
  {
    name: "quantity",
    field: "quantity",
    label: "Quantidade",
    align: "center",
  },
  {
    name: "unit_price",
    field: "unit_price",
    label: "Preço unitário",
    align: "right",
  },
  // {
  //   name: "total",
  //   field: "total",
  //   label: "Total",
  //   align: "left",
  //   format: (val, row) => val * row?.unit_price,
  // },
];
const loading = ref(false);
const produtos = ref([]);
const produtosAux = ref([]);
const category = ref("ENF");

const fetchData = async () => {
  try {
    loading.value = true;
    const { data } = await index("services/index/" + category.value);
    produtosAux.value = data;
    produtos.value = data.map((item) => ({
      id: item.id,
      item: item.title,
      description: item.description,
      unit_price: item.net_price,
      quantity: 1,
      total:
        item.net_price -
        (item.net_price * props.protocol) / 100 -
        Number(item.discount || 0),
      discount:
        Number(item.discount || 0) +
        (Number(item.net_price) * props.protocol) / 100,
    }));
    loading.value = false;
  } catch (error) {}
};

watch(category, () => {
  fetchData();
});
onMounted(() => {
  fetchData();
});
</script>
