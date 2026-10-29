<template>
  <div style="padding-bottom: 48px">
    <PersonalInfo />
    <Screening />
    <MedicRoom v-if="['doctor'].includes(user.role)" />
    <AnalystRoom class="q-px-md" v-if="user.role == 'analyst'" />
  </div>
</template>
<script setup>
import PersonalInfo from "./components/PersonalInfo.vue";
import Screening from "./components/Screening.vue";
import MedicRoom from "./components/MedicRoom.vue";
import { useAttendingStore } from "src/stores/attending";
import AnalystRoom from "./components/AnalystRoom.vue";

import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { SessionStorage } from "quasar";

const user = SessionStorage.getItem("alfavida_user");
const store = useAttendingStore();
const route = useRoute();

const fetchData = async () => {
  await store.show(route.params.id);
};

onMounted(() => {
  fetchData();
});
</script>
