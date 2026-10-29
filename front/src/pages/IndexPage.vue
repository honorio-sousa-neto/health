<template>
  <q-page class="flex flex-center">
    <div>
      <div class="text-center">
        <img
          alt="Quasar logo"
          src="~assets/welcome.svg"
          style="width: 200px; height: 200px"
        />
      </div>
      <div class="text-center q-gutter-sm">
        <div class="text-h4">
          <span>Olá,</span> <span class="text-primary">{{ user.name }}</span>
        </div>
        <div class="text-h6 text-weight-light">
          Seja bem-vindo ao Alfavida APP!
        </div>
        <div class="text-h6 text-weight-light">
          O Alfavida APP deseja para si um bom dia laboral!
        </div>
        <div class="text-bold">
          {{ calendar }}
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { SessionStorage } from "quasar";
import { api } from "src/boot/axios";
import { useAttendingStore } from "src/stores/attending";
import { computed, onMounted } from "vue";

const user = SessionStorage.getItem("alfavida_user");
const store = useAttendingStore();
const calendar = computed(() =>
  new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(new Date())
);

onMounted(async () => {});
</script>
