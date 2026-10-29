<template>
  <div class="q-px-md">
    <div class="row q-gutter-md">
      <div class="text-h6">{{ store.currentData.name }}</div>
      <div>
        <q-btn
          color="grey"
          icon="las  la-pen"
          round
          dense
          size="sm"
          flat
          @click="confirm = !confirm"
        />
      </div>
    </div>
    <div class="text-body1">Descrição: {{ store.currentData.description }}</div>
    <div class="text-body1">Área: {{ store.currentData.area }}</div>
  </div>

  <q-dialog v-model="confirm">
    <q-card style="width: 500px; max-width: 80vw">
      <q-card-section>
        <div class="row justify-end">
          <q-btn color="grey" icon="close" round dense v-close-popup flat />
        </div>
        <Form />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { useSectionStore } from "src/stores/section";
import Form from "./components/Form.vue";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useConsultationStore } from "src/stores/consultation";

const confirm = ref(false);
const store = useConsultationStore();
const route = useRoute();
const fetchData = async () => {
  try {
    const { success } = await store.show(route.params.id);
  } catch (error) {}
};

watch(confirm, async (current) => {
  if (current) {
    await store.show(route.params.id);
  }
});

onMounted(() => {
  fetchData();
});
</script>
