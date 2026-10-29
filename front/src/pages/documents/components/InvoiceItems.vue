<template>
  <div class="row q-mt-md justify-between q-pr-sm">
    <div>
      <div class="text-h5">Itens</div>
      <div class="text-caption">Produtos e serviços</div>
    </div>
    <div class="col-8" v-if="!invoiceStore.form.beneficial?.includes('intern')">
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
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import { useInvoiceStore } from "src/stores/invoice";
import { useRoute } from "vue-router";
import { useAttendingStore } from "src/stores/attending";
import { useSearch } from "src/composables/search";

const { filter } = useSearch("services");
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

const items = defineModel("items");
const search = ref(null);

const options = ref([]);
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

const addToTable = (val) => {
  try {
    const exists = items.value.find((item) => item.id == val.id);
    if (exists) {
      search.value = null;
      return;
    }

    const discountTax = invoiceStore.form.customer.protocol.value;
    let realCost = 0;
    if (invoiceStore.form.beneficial == "protocol") {
      (val.consumables ?? []).forEach((item) => {
        realCost += Number(item.quantity) * Number(item.consumable?.unit_price ?? 0);
      });
    }
    if (realCost < 500) {
      realCost = 500;
    } else {
      realCost = realCost + realCost * (discountTax / 100);
    }

    items.value.push({
      id: val.id,
      name: val.name,
      description: val.description,
      quantity: 1,
      discount: val.discount || 0,
      unit_price: realCost || val.unit_price,
      total: realCost || val.unit_price,
      category: val.category,
      exam: val.exam,
      imagiology: val.imagiology,
      treatmentObservation: val.treatmentObservation,
      Hospitalization: val.Hospitalization,
      consultation: val.consultation,
    });
    search.value = null;
  } catch (error) {
    console.log(error.message);
  }
};
const removeToTable = (val) => {
  items.value.splice(val, 1);
};

onMounted(() => {});
</script>
<style scoped lang="scss">
/* height or max-height is important */
</style>
