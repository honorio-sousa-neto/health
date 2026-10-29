<template>
  <!-- Sem `q-header`: a barra de topo foi absorvida pela lateral. O `view`
       perde o grupo do cabeçalho e fica com o essencial — `L` maiúsculo para
       a gaveta esquerda ocupar a altura toda, à esquerda do conteúdo. -->
  <q-layout view="lHh Lpr lFf">

    <!-- Abrir a barra em ecrã estreito.
         Abaixo do breakpoint a gaveta fica fechada e sobreposta, e o único
         código que a abria era o clique na marca da barra de topo. Com ela a
         sair, isto passa a ser a única porta — sem ele a navegação ficava
         inacessível em telemóvel e em janela estreita. -->
    <button class="sb-abrir" aria-label="Abrir menu" @click="store.leftDrawerOpen = true">
      <q-icon name="las la-bars" size="20px" />
    </button>

    <q-drawer
      v-model="store.leftDrawerOpen"
      show-if-above
      :mini="mini"
      :width="256"
      :mini-width="72"
      :breakpoint="500"
      class="sidebar-drawer"
    >
      <div class="sb">
        <NavIdentidade :mini="mini" />
        <NavPesquisa :mini="mini" />

        <hr class="sb-regua" />

        <div class="sb-nav">
          <Links />
        </div>

        <hr class="sb-regua" />

        <NavRodape :mini="mini" @sair="sair" />
      </div>

      <!-- Controlo de colapso, centrado sobre a aresta direita da barra -->
      <button
        class="sb-colapso"
        :aria-label="mini ? 'Expandir menu' : 'Recolher menu'"
        @click="alternarMini"
      >
        <q-icon :name="mini ? 'las la-angle-right' : 'las la-angle-left'" size="14px" />
        <q-tooltip anchor="center right" self="center left" :offset="[8, 0]">
          {{ mini ? "Expandir menu" : "Recolher menu" }}
        </q-tooltip>
      </button>
    </q-drawer>

    <q-page-container class="page-bg">
      <div class="page-content">
        <router-view />
      </div>
    </q-page-container>

  </q-layout>
</template>

<script setup>
import Links from "../components/global/index.vue";
import NavIdentidade from "src/components/global/NavIdentidade.vue";
import NavPesquisa from "src/components/global/NavPesquisa.vue";
import NavRodape from "src/components/global/NavRodape.vue";
import { SessionStorage } from "quasar";
import { useRouter } from "vue-router";
import { api } from "src/boot/axios";
import { useInvoiceStore } from "src/stores/invoice";
import { useSidebar } from "src/composables/sidebar";
import { getUser } from "src/utils/user";

const router = useRouter();
const { mini, alternarMini } = useSidebar();
const data = SessionStorage.getItem("alfavida_user");
api.defaults.headers["Authorization"] = "Bearer " + data?.token;
const store = useInvoiceStore();
getUser();

const sair = () => {
  SessionStorage.set("alfavida_user", {});
  SessionStorage.set("notifications", {});
  router.push({ name: "login" });
};
</script>
