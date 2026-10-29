<template>
  <div>
    <div class="text-bold">Nome</div>
    <div class="q-mb-xs">{{ name }}</div>
    <div class="text-bold">Contacto</div>
    <div class="q-mb-xs">{{ phone }}</div>
    <div class="text-bold">Endereço</div>
    <div class="q-mb-xs">{{ address || "Desconhecido" }}</div>
    <div class="text-bold">Idade</div>
    <div class="q-mb-xs">{{ age || "Desconhecido" }}</div>
  </div>
</template>
<script setup>
import { computed } from "vue";
const props = defineProps({
  name: {
    type: String,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  birthday: {
    type: String,
  },
});

const age = computed(() => {
  if (props.birthday) {
    const birthday = new Date(props?.birthday?.split("T"));
    const today = new Date();

    let age = today.getFullYear() - birthday.getFullYear();
    const currentMonth = today.getMonth();
    const birthdayMonth = birthday.getMonth();

    if (
      currentMonth < birthdayMonth ||
      (currentMonth === birthdayMonth && today.getDate() < birthday.getDate())
    ) {
      age--;
    }
    return age;
  }
  return 0;
});
</script>
