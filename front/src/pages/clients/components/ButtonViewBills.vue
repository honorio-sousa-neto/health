<template>
  <div>
    <q-btn
      color="secondary"
      icon="las la-coins"
      flat
      round
      dense
      @click="$router.push({ name: 'contas-cliente', params: { id } })"
    />
  </div>
</template>
<script setup>
defineProps({
  id: {
    type: String,
  },
});
</script>
