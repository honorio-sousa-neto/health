<template>
  <div>
    <div class="row q-mb-md items-center">
      <q-btn
        color="grey-8"
        flat
        icon="las la-angle-left"
        round
        dense
        @click="$emit('back')"
      />
      <div>Voltar</div>
    </div>
    <div class="row q-gutter-md">
      <div
        v-for="consultation in store.data.data"
        class="col card-consultation flex flex-center"
        @click="selectItem(consultation)"
        :class="
          selectedOnes.find((item) => item.id == consultation.id)
            ? 'bg-green-9'
            : ''
        "
      >
        <div class="text-center">
          <div class="text-h6">
            {{ consultation.name }}
          </div>
          <div class="text-body1">{{ consultation.description }}</div>
          <div class="text-caption">{{ consultation.area }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useExamsStore } from "src/stores/exams";
import { onMounted } from "vue";
const store = useExamsStore();
defineEmits(["back"]);
onMounted(async () => {
  fetchData();
});
const selectedOnes = defineModel("selected", { default: [] });
const selectItem = (item) => {
  const index = selectedOnes.value.findIndex(
    (element) => element.id == item.id
  );
  console.log(index);
  if (index == -1) selectedOnes.value.push(item);
  else selectedOnes.value.splice(index, 1);
};
const fetchData = async () => {
  await store.index();
};
</script>
<style lang="scss" scoped>
.consultation-card {
}
</style>
