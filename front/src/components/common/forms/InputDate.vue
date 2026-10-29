<template>
  <div>
    <q-input
      v-model="selectedDate"
      @update:model-value="setRange"
      label="Escolha uma data inicial"
      type="date"
      standout="bg-teal text-white"
    />
    <div class="q-ml-sm q-mt-sm" v-if="range">
      <!-- Simplified date display using a computed formatter -->
      <div>
        <div class="text-bold">Início:</div>
        <div>{{ formatDate(range ? range[0] : start) }}</div>
      </div>
      <div>
        <div class="text-bold">Fim:</div>
        <div>{{ formatDate(range ? range[1] : end) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { date } from "quasar";

const start = defineModel("start");
const end = defineModel("end");

const selectedDate = ref(null);
const range = ref(null);

// Create a reusable date formatter
const dateFormatter = new Intl.DateTimeFormat("pt", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const formatDate = (dateValue) => {
  if (!dateValue) return "";
  return dateFormatter.format(new Date(dateValue));
};

const setRange = (value) => {
  if (value) {
    const startDate = date.formatDate(new Date(value), "YYYY-MM-DD");
    const endDate = date.formatDate(
      date.addToDate(new Date(value), { months: 6 }),
      "YYYY-MM-DD"
    );
    range.value = [startDate, endDate];
    start.value = startDate;
    end.value = endDate;
  }
};
</script>
