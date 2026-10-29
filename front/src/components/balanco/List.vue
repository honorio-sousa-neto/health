<template>
  <q-card flat square class="my-card">
    <q-card-section class="row q-gutter-md">
      <q-radio v-model="shape" val="daily" label="Diario" />
      <q-radio v-model="shape" val="monthly" label="Mensal" />
    </q-card-section>
    <q-card-section>
      <Daily v-if="shape == 'daily'"></Daily>
      <Monthly v-if="shape == 'monthly'"></Monthly>
    </q-card-section>
  </q-card>
</template>
<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useFetch } from "src/composables/fetch";
import Daily from "./Daily.vue";
import Monthly from "./Monthly.vue";
import { api } from "src/boot/axios";

const shape = ref("daily");
const selected = ref([]);

const { store } = useFetch();

const document = ref("FR");
const response = ref({
  toPay: 0,
  paid: 0,
  documents: [],
});
const loading = ref(false);
const fetchData = async () => {
  try {
    loading.value = true;
    const { data } = await store("reports-financial", {
      range: range.value,
      document: document.value,
    });
    response.value.toPay = data.toPay;
    response.value.paid = data.paid;
    response.value.documents = data.documents;
    loading.value = false;
  } catch (error) {}
};

watch(document, () => {
  fetchData();
});
onMounted(() => {
  // fetchData();
});
</script>
