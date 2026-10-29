<template>
  <div class="sb-rodape" :class="{ 'sb-rodape--rail': mini }">
    <!-- Estado da ligação. Só aparece quando há problema: num sítio que está
         sempre no ecrã, um indicador permanente de "tudo bem" deixa de se ver,
         e deixa de servir no momento em que for preciso. -->
    <div v-if="!ligado" class="sb-rede" :class="`sb-rede--${estado}`">
      <q-icon
        :name="caido ? 'las la-plug' : 'las la-sync'"
        size="15px"
        :class="{ 'sb-rede__gira': aReconectar }"
      />
      <span v-if="!mini">{{ caido ? "Sem ligação" : "A reconectar" }}</span>
      <q-tooltip :anchor="mini ? 'center right' : 'top middle'" :self="mini ? 'center left' : 'bottom middle'">
        {{ caido
          ? "O servidor não responde. O que está no ecrã pode estar desactualizado e o que gravar pode não chegar."
          : "A ligação falhou e está a ser retomada." }}
      </q-tooltip>
    </div>

    <div class="sb-rodape__accoes">
      <Notifications />

      <button class="sb-icon-btn" :aria-label="escuro ? 'Tema claro' : 'Tema escuro'" @click="alternar">
        <q-icon :name="escuro ? 'las la-sun' : 'las la-moon'" size="18px" />
        <q-tooltip :anchor="mini ? 'center right' : 'top middle'" :self="mini ? 'center left' : 'bottom middle'">
          {{ escuro ? "Tema claro" : "Tema escuro" }}
        </q-tooltip>
      </button>

      <button class="sb-icon-btn sb-icon-btn--sair" aria-label="Terminar sessão" @click="$emit('sair')">
        <q-icon name="las la-sign-out-alt" size="18px" />
        <q-tooltip :anchor="mini ? 'center right' : 'top middle'" :self="mini ? 'center left' : 'bottom middle'">
          Terminar sessão
        </q-tooltip>
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * O rodapé da barra: estado da ligação, notificações, tema e terminar sessão.
 *
 * As três primeiras vinham da barra de topo. As notificações não constavam da
 * lista de destinos da especificação, e não são decoração: abrem ligação
 * socket.io própria, escutam quatro eventos e mantêm contagem de não lidas. O
 * PRODUCT.md dá o tempo real como capacidade do produto, por isso tinham de
 * aterrar em algum lado.
 */
import Notifications from "./Notifications.vue";
import { useTheme } from "src/composables/theme";
import { useLigacao } from "src/composables/ligacao";

defineProps({ mini: { type: Boolean, default: false } });
defineEmits(["sair"]);

const { escuro, alternar } = useTheme();
const { estado, ligado, aReconectar, caido } = useLigacao();
</script>
