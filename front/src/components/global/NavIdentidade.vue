<template>
  <div class="sb-topo">
    <!-- Marca. No rail fica só o símbolo, que é o que cabe no eixo. -->
    <div class="sb-marca">
      <span class="sb-marca__sinal"><q-icon name="las la-heartbeat" size="18px" /></span>
      <span v-if="!mini" class="sb-marca__nome">Clínica Alfavida</span>
    </div>

    <!-- Quem está em sessão, e em que serviço. -->
    <div class="sb-id">
      <span class="sb-id__avatar">{{ iniciais }}</span>
      <span v-if="!mini" class="sb-id__texto">
        <span class="sb-id__nome">{{ nome }}</span>
        <span v-if="servico" class="sb-id__servico">{{ servico }}</span>
      </span>
      <q-tooltip v-if="mini" anchor="center right" self="center left" :offset="[10, 0]">
        {{ nome }}{{ servico ? ` · ${servico}` : "" }}
      </q-tooltip>
    </div>
  </div>
</template>

<script setup>
/**
 * Marca e identidade, no topo da barra.
 *
 * Vinham os dois da barra de topo, que foi absorvida. O avatar tinha um
 * gradiente por papel — nove deles, um por cor — e sai pela regra 2. Fica
 * superfície elevada com as iniciais, que é o que o resto do sistema faz
 * quando precisa de distinguir sem colorir.
 */
import { computed } from "vue";
import { SessionStorage } from "quasar";
import { servicoDe, iniciaisDe } from "src/config/papeis";

defineProps({ mini: { type: Boolean, default: false } });

const user = SessionStorage.getItem("alfavida_user") ?? {};
const nome = computed(() => user?.name ?? "Sessão iniciada");
const servico = computed(() => servicoDe(user?.role));
const iniciais = computed(() => iniciaisDe(user?.name));
</script>
