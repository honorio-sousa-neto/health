<template>
  <q-table
    flat
    :rows
    :columns="columns"
    row-key="name"
    :pagination="{ rowsPerPage: 0 }"
    hide-bottom
    virtual-scroll
    dense
    style="max-width: 100%"
    class="my-sticky-header-table"
    v-model:selected="selected"
    selection="multiple"
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
</template>
<script setup>
import { useDrugStore } from "src/stores/drug";
import { useInvoiceStore } from "src/stores/invoice";
import { onMounted, ref, watch } from "vue";
const store = useDrugStore();
const invoiceStore = useInvoiceStore();
const selected = ref([]);
const columns = [
  {
    name: "name",
    label: "Nome",
    field: "name",
    align: "left",
  },

  {
    name: "quantity",
    label: "Qtd",
    field: "quantity",
    align: "center",
  },
];
const rows = ref([]);
onMounted(async () => {
  await store.index();
  rows.value = store.state.data.map((item) => ({ quantity: 1, ...item }));
});

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  unit_price: {
    type: Number,
    required: true,
  },
});

watch(
  () => selected,
  (current) => {
    const index = invoiceStore.form.invoiceItems.findIndex(
      (item) => item.id == props.id
    );
    let total = props.unit_price;
    selected.value.forEach((element) => {
      const amount = element.amount + (element.amount * element.tax) / 100;
      total = total + amount * element.quantity;
      invoiceStore.form.invoiceItems[index] = {
        config: `${element.name} - (${element.quantity}), `,
        ...invoiceStore.form.invoiceItems[index],
      };
    });
    invoiceStore.form.invoiceItems[index].unit_price = total;
  },
  {
    deep: true,
  }
);
</script>
