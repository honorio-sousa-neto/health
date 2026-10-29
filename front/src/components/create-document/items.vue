<template>
  <q-card flat>
    <q-card-section class="q-pb-none">
      <div class="row justify-between">
        <div>
          <div class="text-h5">Itens</div>
          <div class="text-caption">Produtos e serviços</div>
        </div>
        <div>
          <q-select
            v-model="search"
            type="text"
            label="Pesquisa"
            standout="bg-teal-8 text-white"
            use-input
            dense
            class="col-md-12 col-xs-12"
            :option-label="
              (item) =>
                item === null
                  ? ''
                  : item.name + ' [' + `${item.description || ''}` + ']'
            "
            option-value="id"
            input-debounce="500"
            @filter="filterFunction"
            :options="options"
            @update:model-value="addToTable"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-select>
        </div>
      </div>
      <q-separator spaced />
    </q-card-section>
    <q-slide-transition>
      <div v-show="items.length" class="q-px-md">
        <q-table
          flat
          :rows="items"
          :columns="columns"
          row-key="name"
          :pagination="{ rowsPerPage: 0 }"
          hide-bottom
          virtual-scroll
          dense
          style="max-width: 100%; max-height: 500px"
          class="my-sticky-header-table"
        >
          <template v-slot:body-cell-actions="props">
            <q-td key="quantity" :props="props">
              <q-btn
                color="red"
                icon="las la-ban"
                flat
                size="sm"
                round
                dense
                @click="removeToTable(props.rowIndex)"
              />
            </q-td>
          </template>
          <template v-slot:body-cell-quantity="props">
            <q-td key="quantity" :props="props">
              <div class="text-pre-wrap">{{ props.row.quantity }}</div>
              <q-popup-edit
                v-model="props.row.quantity"
                title="Alterar quantidade"
                buttons
                persistent
                v-slot="scope"
              >
                <q-input
                  type="number"
                  v-model.number="scope.value"
                  dense
                  autofocus
                  hint="Use os botões para fechar"
                />
              </q-popup-edit>
            </q-td>
          </template>
          <template v-slot:body-cell-unit_price="props">
            <q-td key="unit_price" :props="props">
              <div class="text-pre-wrap">{{ props.row.unit_price }}</div>
              <q-popup-edit
                v-model="props.row.unit_price"
                title="Alterar Preço"
                buttons
                persistent
                v-slot="scope"
                v-if="invoiceStore.form.customerId.insurance_number"
              >
                <q-input
                  type="number"
                  v-model.number="scope.value"
                  step="0.01"
                  dense
                  autofocus
                  hint="Use os botões para fechar"
                />
              </q-popup-edit>
            </q-td>
          </template>
          <template v-slot:body-cell-discount="props">
            <q-td key="discount" :props="props">
              <div class="text-pre-wrap">{{ props.row.discount }}</div>
              <q-popup-edit
                v-model="props.row.discount"
                title="Alterar desconto"
                buttons
                persistent
                v-slot="scope"
                v-if="invoiceStore.form.customerId.insurance_number"
              >
                <q-input
                  type="number"
                  v-model.number="scope.value"
                  step="0.01"
                  dense
                  autofocus
                  hint="Use os botões para fechar"
                />
              </q-popup-edit>
            </q-td>
          </template>
        </q-table>
      </div>
    </q-slide-transition>
  </q-card>
</template>
<script setup>
import { useServiceStore } from "src/stores/service";
import { onMounted, ref, watch } from "vue";
import { required } from "src/utils/validation";
import { useInvoiceStore } from "src/stores/invoice";
import { useRoute } from "vue-router";
import { useAttendingStore } from "src/stores/attending";
const invoiceStore = useInvoiceStore();
const columns = [
  {
    name: "actions",
    label: "",
    align: "left",
  },
  {
    name: "name",
    label: "Nome",
    field: "name",
    align: "left",
    format: (val, row) =>
      `${val} ${row.description ? "[" + row.description + "]" : ""}`,
  },

  {
    name: "unit_price",
    label: "Preco unitario",
    field: "unit_price",
    align: "center",
  },
  {
    name: "quantity",
    label: "Qtd",
    field: "quantity",
    align: "center",
  },
  {
    name: "discount",
    label: "Desconto",
    field: "discount",
    align: "center",
  },
  {
    name: "total",
    label: "Total",
    field: "total",
    align: "center",
    format: (val, row) => row.quantity * (row.unit_price - row.discount),
  },
];
const store = useServiceStore();
const category = ref("ENF");
const items = defineModel("items");
const search = ref(null);

const options = ref([]);
const filterFunction = async (val, update, abort) => {
  try {
    if (!val) return;
    update(async () => {
      const data = await store.filter(category.value, val);
      val = null;
      options.value = data;
    });
  } catch (error) {}
};

const addToTable = (val) => {
  try {
    const exists = items.value.find((item) => item.id == val.id);
    if (exists) {
      search.value = null;
      return;
    }

    items.value.push({
      id: val.id,
      name: val.name,
      description: val.description,
      quantity: 1,
      discount: val.discount || 0,
      unit_price: val.unit_price,
      total: val.unit_price,
    });
    search.value = null;
    console.log("items", items.value);
  } catch (error) {
    console.log(error.message);
  }
};
const removeToTable = (val) => {
  items.value.splice(val, 1);
};
const route = useRoute();
const storeAttending = useAttendingStore();

onMounted(() => {});
</script>
<style scoped lang="scss">
/* height or max-height is important */
</style>
