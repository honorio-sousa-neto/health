<template>
  <div>
    <div class="text-h6">
      {{ form.consultation.screening.customer.name }}
    </div>
    <div class="row">
      <div
        class="q-ml-md text-grey q-mt-sm col-6"
        v-for="element in form.consultation.prescriptions.at(0).items"
      >
        <div class="row justify-between items-center">
          <div>
            {{ element.service.name }}
          </div>
        </div>
        <div class="q-ml-sm">
          <div>
            Dose: <span>{{ element.dose }}</span>
          </div>
          <div>
            Quantidade: <span>{{ element.quantity }}</span>
          </div>
          <div>
            Duração: <span>{{ element.duration }} dias</span>
          </div>
          <div>
            Frequência: <span>{{ element.frequency }}</span>
          </div>
          <div>
            Via: <span>{{ element.canal }}</span>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div v-for="day in form.duration" :key="day">
        <q-checkbox
          @update:model-value="updatePrescription"
          v-model="form.days"
          :label="`Dia ${day}`"
          :val="day"
        />
      </div>
    </div>
    <q-slide-transition>
      <div v-show="form.duration == form.days.length">
        <q-btn
          color="primary"
          icon="las la-save"
          label="Terminar ambulatório"
          @click="finishAmbulatory"
        />
      </div>
    </q-slide-transition>
  </div>
</template>
<script setup>
import { api } from "src/boot/axios";
import { showNotify } from "src/utils/notify";
import { onMounted, reactive, ref } from "vue";

const props = defineProps({
  id: {
    type: String,
  },
});

const emits = defineEmits(["finish"]);

const loading = ref(false);
let form = reactive({
  consultation: {
    screening: {
      customer: {
        name: "",
      },
    },
    prescriptions: [
      {
        items: [],
      },
    ],
  },
  duration: 0,
  items: [],
  days: [],
});

const updatePrescription = async (val) => {
  const { data } = await api.patch("ambulatories/" + props.id, {
    days: { days: val },
  });
};

const finishAmbulatory = async () => {
  const { data } = await api.patch("ambulatories/" + props.id, {
    status: "CLOSED",
  });
  showNotify(data.message, data.success);
  if (data.success) {
    emits("finish");
  }
};

const fetchData = async () => {
  try {
    loading.value = true;
    const { data } = await api.get("ambulatories/" + props.id);
    Object.assign(form, data.data);
    console.log(data);
    form.days = data.data?.days?.days ?? [];
    form.duration = Math.max(
      form.consultation.prescriptions
        .find((item) => item.type == "AMBULATORY")
        .items.map((ele) => ele.duration)
    );
    loading.value = false;
  } catch (error) {}
};
onMounted(() => {
  fetchData();
});
</script>
