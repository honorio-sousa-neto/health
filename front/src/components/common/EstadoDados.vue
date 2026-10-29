<template>
  <!-- A carregar -->
  <div v-if="carregando" class="state-box">
    <q-spinner size="28px" color="primary" />
    <span class="state-text">{{ textoCarregar }}</span>
  </div>

  <!-- Falhou -->
  <!-- Antes, um pedido que falhava era engolido por `catch (_) {}` e a página
       ficava exactamente igual a uma lista vazia. "Não há doentes na fila" e
       "não consegui saber quem está na fila" são coisas diferentes, e numa
       triagem a diferença importa. -->
  <div v-else-if="erro" class="state-box">
    <q-icon name="las la-exclamation-triangle" :size="tamanhoIcone" class="state-icon state-icon--erro" />
    <span class="state-text">{{ textoErro }}</span>
    <button v-if="repetivel" class="state-retry" @click="$emit('repetir')">
      <q-icon name="las la-redo-alt" size="15px" />
      <span>Tentar novamente</span>
    </button>
  </div>

  <!-- Vazio -->
  <div v-else-if="vazio" class="state-box">
    <q-icon :name="iconeVazio" :size="tamanhoIcone" class="state-icon" />
    <span class="state-text">{{ textoVazio }}</span>
  </div>
</template>

<script setup>
/**
 * Os três estados de uma lista, num só sítio.
 *
 * Não renderiza nada quando há dados — é para ser posto ao lado da tabela,
 * com `v-if` próprio, e não à volta dela.
 */
defineEmits(["repetir"]);

defineProps({
  carregando:    { type: Boolean, default: false },
  repetivel:     { type: Boolean, default: false },
  erro:          { type: [Boolean, Object, String], default: false },
  vazio:         { type: Boolean, default: false },
  textoCarregar: { type: String, default: "A carregar…" },
  textoErro:     { type: String, default: "Não foi possível carregar os dados." },
  textoVazio:    { type: String, default: "Sem registos." },
  iconeVazio:    { type: String, default: "las la-folder-open" },
  tamanhoIcone:  { type: String, default: "30px" },
});
</script>
