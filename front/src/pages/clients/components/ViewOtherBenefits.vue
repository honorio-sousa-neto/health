<template>
  <div v-if="loading" class="fit flex flex-center">
    <q-spinner-ios color="primary" size="3rem" :thickness="5" />
  </div>
  <div v-else-if="customer.name">
    <div class="q-pa-md">
      <div class="text-h6">{{ customer.name }}</div>

      <div>
        <div>
          <div>
            Custo total:
            <span class="text-bold">{{
              new Intl.NumberFormat("de-DE", {
                currency: "AOA",
                style: "currency",
              }).format(total)
            }}</span>
          </div>
          <div class="row">
            <div class="col">
              <div class="text-bold q-pt-md q-ml-md">Lista de documentos</div>
              <div class="q-py-md">
                <div class="row q-col-gutter-sm">
                  <div v-for="invoice in data" class="col-6">
                    <q-card class="q-pa-md row justify-between">
                      <div>
                        <div>
                          Ref.
                          <span class="text-bold">
                            {{ invoice.reference }}
                          </span>
                        </div>
                        <div>
                          Total da factura:
                          <span class="text-bold">{{
                            new Intl.NumberFormat("de-DE", {
                              currency: "AOA",
                              style: "currency",
                            }).format(invoice.total)
                          }}</span>
                        </div>
                        <div>
                          Custo real:
                          <span class="text-bold">{{
                            new Intl.NumberFormat("de-DE", {
                              currency: "AOA",
                              style: "currency",
                            }).format(
                              realCosts.find(
                                (item) => item.reference == invoice.reference
                              ).amount
                            )
                          }}</span>
                        </div>
                      </div>
                      <div>
                        <PrintButton :id="invoice.id" />
                      </div>
                    </q-card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="fit flex flex-center text-bold">
    Selecione um cliente / plano para ver os dados
  </div>
</template>
<script setup>
import PrintButton from "src/components/common/buttons/PrintButton.vue";
import { computed } from "vue";
const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  customer: {
    type: Object,
    default: {
      name: null,
    },
  },
  data: {
    type: Array,
    default: [],
  },
  realCosts: {
    type: Array,
    default: [],
  },
  totalRealCost: {
    type: Number,
    default: 0,
  },
});

const total = computed(() => {
  let result = 0;
  props.data.forEach((invoice) => {
    invoice.invoiceItems.forEach((item) => {
      result += item.price * item.quantity;
    });
  });

  return result;
});
</script>
