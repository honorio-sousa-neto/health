<template>
  <div>
    <div
      style="position: sticky; top: 140px; z-index: 5"
      class="bg-teal-8 text-white q-pa-sm row items-center justify-between"
    >
      <div>Sintomas</div>
      <div v-if="!justRead">
        <q-btn
          color="white"
          icon="las la-edit"
          flat
          dense
          round
          @click="isEditing = !isEditing"
        />
        <q-btn
          flat
          color="white"
          dense
          icon="las la-save"
          round
          :loading="store.loadings.loadingCreate"
          @click="saveChanges"
        >
          <q-tooltip> Guardar dados </q-tooltip>
        </q-btn>
      </div>
    </div>
    <q-slide-transition>
      <q-list bordered v-show="isEditing">
        <q-select
          filled
          v-model="symptoms"
          use-input
          use-chips
          multiple
          option-label="title"
          option-value="id"
          input-debounce="0"
          @new-value="createValue"
          :options="options"
          @filter="filterFunction"
        />
      </q-list>
    </q-slide-transition>
    <q-slide-transition>
      <q-list bordered v-show="!isEditing">
        <ul>
          <li v-for="symptom in symptoms">{{ symptom.title || symptom }}</li>
        </ul>
      </q-list>
    </q-slide-transition>
  </div>
</template>
<script setup>
import { useAttendingStore } from "src/stores/attending";
import { useSymptomStore } from "src/stores/symptom";
import { onMounted, ref } from "vue";
const props = defineProps({
  justRead: {
    type: Boolean,
    default: false,
  },
});
const isEditing = ref(!props.justRead);
const store = useSymptomStore();
const symptoms = ref([]);
const storeAttending = useAttendingStore();
const newSymptoms = ref([]);
const options = ref([]);
const createValue = async (val, done) => {
  if (val.length > 0) {
    if (
      !options.value?.find(
        (item) => item.title.toLowerCase() == val.toLowerCase()
      )
    ) {
      const { data } = await store.create({ title: val });
      newSymptoms.value.push(data.data);
    }
    done(val, "toggle");
  }
};

const filterFunction = async (val, update, abort) => {
  try {
    if (!val) return;
    update(async () => {
      const data = await store.index(val);
      val = null;
      options.value = data;
    });
  } catch (error) {}
};

const saveChanges = async () => {
  try {
    const payload = symptoms.value.filter((item) => item.id);
    const result = payload.concat(newSymptoms.value);
    await storeAttending.addSymptoms(result);
  } catch (error) {}
};
const fetchData = async () => {
  try {
    const { data } = await storeAttending.showSymptoms();
    symptoms.value = data.data;
  } catch (error) {}
};

onMounted(() => {
  fetchData();
});
</script>
