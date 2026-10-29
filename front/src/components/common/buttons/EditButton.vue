<template>
  <q-item v-if="modo === 'item'" v-close-popup clickable @click="$emit('click')">
    <q-item-section avatar><q-icon name="las la-edit" size="18px" /></q-item-section>
    <q-item-section>Editar</q-item-section>
  </q-item>

  <q-btn v-else flat round dense icon="las la-edit" class="btn-icone" @click="$emit('click')">
    <q-tooltip>Editar</q-tooltip>
  </q-btn>
</template>

<script setup>
/**
 * Tinha `color="green-8"` — cor da paleta do Quasar em chrome, que a regra 10
 * reserva para valores clínicos. O ícone herda agora a cor do contexto.
 *
 * O `click` é emitido explicitamente. Com dois ramos `v-if`/`v-else` o Vue
 * não garante a propagação automática de ouvintes nativos, e um botão de
 * editar que não responde é o género de defeito que só aparece em uso.
 */
defineEmits(["click"]);
defineProps({ modo: { type: String, default: "botao" } });
</script>
