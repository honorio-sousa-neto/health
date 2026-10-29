<template>
  <div>
    <div>
      <div v-for="category in categories" :key="category.id">
        <div class="text-bold text-uppercase text-white bg-teal q-pa-xs">
          {{ category.category.name }}
        </div>
        <div v-for="service in category.category.Service" :key="service.id">
          <div
            @click="addToInvoice(service)"
            class="row custom-link justify-between q-mb-xs q-ml-md"
          >
            <div>
              <div>{{ service.name }}</div>
              <div class="text-bold">
                {{
                  new Intl.NumberFormat("de-DE", {
                    currency: "AOA",
                    style: "currency",
                  }).format(service.unit_price)
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useCommom } from "src/composables/commom";
import { useInvoiceStore } from "src/stores/invoice";
import { computed, onMounted, ref } from "vue";
const { fetchOne, loading } = useCommom("interns");
const storeInvoice = useInvoiceStore();
const props = defineProps({
  internId: {
    type: Number,
    default: null,
  },
});
const internTax = ref(0);
const services = ref([]);
const fetchData = async () => {
  const data = await fetchOne(props.internId);
  console.log(data);
  internTax.value = data.internTax;
  services.value = data.services;
};
onMounted(() => {
  if (props.internId) {
    fetchData();
  }
});

const addToInvoice = (val) => {
  const exists = storeInvoice.form.invoiceItems.find(
    (item) => item.id == val.id
  );
  console.log(storeInvoice.form.invoiceItems);
  if (storeInvoice.form.invoiceItems[0]?.name?.includes("Internamento")) {
    return;
  }

  if (
    val.name.includes("Internamento") &&
    storeInvoice.form.invoiceItems.length > 0
  ) {
    return;
  }

  if (exists) {
    return;
  }

  storeInvoice.form.invoiceItems.push({
    id: val.id,
    name: val.name,
    description: val.description,
    quantity: 1,
    discount: val.discount || 0,
    unit_price: val.unit_price,
    total: val.unit_price,
    category: val.category,
    exam: val.exam,
    imagiology: val.imagiology,
    treatmentObservation: val.treatmentObservation,
    Hospitalization: val.Hospitalization,
    consultation: val.consultation,
  });
};

const categories = computed(() => {
  const categoriesAux = JSON.parse(JSON.stringify(services.value));
  categoriesAux.forEach((element) => {
    for (let index = 0; index < element.category.Service.length; index++) {
      if (element.category.Service[index].name.includes("Internamento")) {
        element.category.Service[index].unit_price =
          element.category.Service[index].unit_price -
          ((100 - internTax.value) / 100) *
            element.category.Service[index].unit_price;
      }
      if (
        element.category.Service[index].unit_price > 3000 &&
        ["Hematologia", "Serologia", "Parasitologia", "Bioquímica"].includes(
          element.category.name
        )
      ) {
        console.log(element.category.Service[index]);
      }
    }
  });

  return categoriesAux;
});
</script>
<style scoped lang="scss">
.custom-link {
  color: $grey-9;
  font-size: 11pt;
  &:hover {
    cursor: pointer;
    color: $teal-8;
  }
}
</style>
