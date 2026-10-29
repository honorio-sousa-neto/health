<template>
  <q-btn
    unelevated
    no-caps
    :to="{ name: to, params }"
    :label="rotulo"
    icon="las la-plus"
    class="btn-primaria"
  />
</template>

<script setup>
/**
 * A acção primária de uma lista. É a única com preenchimento sólido, e por
 * isso é a única que pode carregar o verde.
 *
 * Era um botão redondo só com ícone, em pílula e na cor `primary` do Quasar.
 * Um "+" sem palavra obriga a adivinhar o que cria; o rótulo diz exactamente
 * o que acontece.
 */
defineProps({
  to: { type: String, required: true },
  params: { type: Object, required: false },
  rotulo: { type: String, default: "Novo registo" },
});
</script>
