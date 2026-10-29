<template>
  <div>
    <div class="row items-center q-mb-md">
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
    <div class="row q-col-gutter-sm q-px-md">
      <div
        v-for="consultation in store.data"
        @click="select(consultation)"
        class="col-md-3"
      >
        <div
          :class="
            storeAttending.form.consultationId == consultation.id
              ? 'selected'
              : ''
          "
          class="card-consultation flex flex-center"
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
  </div>
</template>
<script setup>
import { useAttendingStore } from "src/stores/attending";
import { useConsultationStore } from "src/stores/consultation";
import { onMounted, ref } from "vue";
const store = useConsultationStore();
const storeAttending = useAttendingStore();
defineEmits(["back"]);
onMounted(async () => {
  fetchData();
});

const selected = ref(null);
const select = (consultation) => {
  storeAttending.form.consultationId = consultation.id;
};
const fetchData = async () => {
  await store.index();
};
</script>
<style lang="scss">
.card-consultation {
  height: 190px;
  background-color: $teal-4;
  color: aliceblue;
  font-size: 28pt;
  cursor: pointer;
}

.selected {
  background-color: $green-9 !important;
}
</style>
