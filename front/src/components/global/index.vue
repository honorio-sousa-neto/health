<template>
  <NavList :grupos="grupos" />
</template>

<script setup>
/**
 * O menu do utilizador em sessão.
 *
 * Eram dois componentes e dois `v-if` a decidir qual deles aparecia; a
 * decisão passou para o `menuParaPapel()`, que é onde os destinos vivem.
 */
import NavList from "./links/NavList.vue";
import { SessionStorage } from "quasar";
import { menuParaPapel } from "src/config/menu";

const user = SessionStorage.getItem("alfavida_user") ?? {};
const grupos = menuParaPapel(user.role);
</script>
