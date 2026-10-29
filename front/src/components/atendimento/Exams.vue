<template>
  <q-card square flat>
    <div
      style="position: sticky; top: 140px; z-index: 5"
      class="bg-teal-8 text-white q-pa-sm row items-center justify-between"
    >
      <div class="q-ml-md">Exames</div>
      <div>
        <q-btn
          color="white"
          icon="las la-save"
          dense
          flat
          round
          @click="saveChanges"
        >
          <q-tooltip> Salvar alterações </q-tooltip>
        </q-btn>
      </div>
    </div>
    <q-card-section>
      <div class="text-bold">História clínica</div>
      <q-input v-model="observation" type="textarea" outlined label="" />
      <div class="text-bold q-my-md">Pedidos de exame</div>
      <q-tabs v-model="tab" align="left" dense class="text-teal">
        <q-tab no-caps name="LAB" label="Laboratório" />
        <q-tab no-caps name="RX" label="Radiografia" />
        <q-tab no-caps name="ECO" label="Ecografia" />
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="LAB">
          <LabRxEco area="LAB" v-model:exams="lab" />
        </q-tab-panel>
        <q-tab-panel name="RX">
          <LabRxEco area="RX" v-model:exams="eco" />
        </q-tab-panel>
        <q-tab-panel name="ECO">
          <LabRxEco area="ECO" v-model:exams="rx" />
        </q-tab-panel>
      </q-tab-panels>

      <!-- <div class="row justify-end q-pt-md">
        <q-btn
          color="primary"
          icon="las la-forward"
          label="Ordenar exames"
          no-caps
          @click="onClick"
        />
      </div> -->
    </q-card-section>
  </q-card>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useServiceStore } from "src/stores/service";
import { useRoute } from "vue-router";
import { useAttendingStore } from "src/stores/attending";
import LabRxEco from "./LabRxEco.vue";
import { showNotify } from "src/utils/notify";
const props = defineProps({
  observation: {
    tye: String,
    default: null,
  },
});
const lab = ref([]);
const eco = ref([]);
const rx = ref([]);
const observation = ref(props.observation);
const tab = ref("LAB");
const route = useRoute();
const storeAttending = useAttendingStore();

const saveChanges = async () => {
  try {
    const id = route.params.id;
    const laboratory = lab.value.map((item) => ({
      area: "LAB",
      serviceId: item,
      attendingId: route.params.id,
    }));
    const ecography = eco.value.map((item) => ({
      area: "ECO",
      serviceId: item,
      attendingId: route.params.id,
    }));
    const radio = rx.value.map((item) => ({
      area: "RX",
      serviceId: item,
      attendingId: route.params.id,
    }));
    const payload = laboratory.concat(ecography).concat(radio);
    await storeAttending.addExams(payload);

    await storeAttending.update(
      { observation: observation.value, stage: "ATTENDANCE" },
      id
    );
  } catch (error) {
    console.log(error.message);
  }
};

const onClick = () => {
  if (!lab.value.length && !eco.value.length && !rx.value.length) {
    showNotify("Escolha um tipo de exame, pelo menos");
    return;
  }
};

const fetchData = async () => {
  try {
    const result = await storeAttending.showExams();
    lab.value.length = 0;
    eco.value.length = 0;
    rx.value.length = 0;
    result.data.data &&
      result.data.data.forEach((item) => {
        if (item.category == "LAB") {
          lab.value.push(item.id);
        }
      });
  } catch (error) {}
};

onMounted(() => {
  fetchData();
});
</script>
