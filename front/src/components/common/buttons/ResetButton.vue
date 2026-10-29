<template>
  <q-btn
    flat
    no-caps
    :label="rotulo"
    padding="sm lg"
    class="reset-btn"
  />
</template>

<script setup>
/**
 * Tinha `color="grey-6"`, cor fixa da paleta do Quasar que não acompanha o
 * tema. A acção secundária de um formulário é texto, e o texto tem token.
 */
defineProps({ rotulo: { type: String, default: "Cancelar" } });
</script>

<style scoped>
.reset-btn {
  border-radius: var(--r-sm);
  font-size: var(--fs-body);
  font-weight: 500;
  color: var(--text-2);
}
.reset-btn:hover {
  background: var(--surface-3);
}
</style>
