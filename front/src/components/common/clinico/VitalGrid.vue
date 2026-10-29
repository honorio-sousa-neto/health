<template>
  <div class="vg" :class="{ 'vg--fixo': !fluido }">
    <slot />
  </div>
</template>

<script setup>
/**
 * O contentor dos sinais vitais.
 *
 * Existe porque os vitais nunca aparecem sozinhos — aparecem em conjunto, numa
 * fila que quebra. Sem contentor, cada ecrã que mostre vitais reescreve o mesmo
 * flex com o mesmo gap, que é exactamente a duplicação de definições que o
 * plano de tokens existe para evitar. É também o que o `.cs-item` de hoje não
 * tem: depende de um pai com flex que a primitiva não fornece.
 *
 * Dois modos, porque os dois cenários reais são diferentes:
 *   - fluido (omissão): os chips repartem a largura disponível. Serve o
 *     cabeçalho de uma consulta, onde se quer a fila inteira à vista.
 *   - fixo: largura mínima constante e quebra natural. Serve um painel lateral
 *     estreito, onde esticar deixaria os chips desproporcionados.
 */
defineProps({
  fluido: { type: Boolean, default: true },
});
</script>

<style scoped lang="scss">
.vg {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  align-items: stretch;
}

// Cada chip cresce para repartir a linha, com um piso que impede dois vitais
// de ficarem espremidos lado a lado num ecrã estreito.
.vg > :deep(*) {
  flex: 1 1 140px;
  min-width: 0;
}

.vg--fixo > :deep(*) {
  flex: 0 1 auto;
}

@media (max-width: 599.98px) {
  .vg {
    gap: var(--sp-1);
  }

  .vg > :deep(*) {
    flex: 1 1 100%;
  }
}
</style>
