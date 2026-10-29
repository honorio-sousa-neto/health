<template>
  <q-btn
    unelevated
    no-caps
    :loading
    :label="rotulo"
    color="primary"
    padding="sm lg"
    class="submit-btn"
  />
</template>

<script setup>
/**
 * `color="primary"` é o #1e8460 do quasar.variables — o verde para sólidos
 * com texto branco por cima, a 4,64:1. Não trocar pelo verde da marca.
 */
defineProps({
  loading: { type: Boolean, default: false },
  /** "Guardar" chega em formulários curtos; onde houver dúvida sobre o que
      está a ser guardado, o rótulo di-lo. */
  rotulo: { type: String, default: "Guardar" },
});
</script>

<style scoped>
.submit-btn {
  border-radius: var(--r-control);
  font-size: var(--fs-body);
  font-weight: 600;
}
</style>
