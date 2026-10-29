<template>
  <component :is="components[user.role]"></component>
</template>
<script setup>
import { SessionStorage } from "quasar";
import Attending from "./attending.vue";
import Screening from "./screening.vue";
import Medic from "./medic.vue";

const components = {
  attendant: Attending,
  nurse: Screening,
  doctor: Medic,
};
const user = SessionStorage.getItem("alfavida_user");
</script>
