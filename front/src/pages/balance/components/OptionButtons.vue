<template>
  <div class="q-px-md q-pt-sm q-gutter-sm">
    <q-btn
      color="primary"
      icon="las la-calendar-week"
      label="Diário"
      @click="
        async () => {
          await $router.push({ query: { mode: 'diario' } });
          $emit('changeMode');
        }
      "
      :outline="$route.query.mode != 'diario'"
    />
    <q-btn
      color="primary"
      icon="las la-calendar"
      label="Mensal"
      @click="
        async () => {
          await $router.push({ query: { mode: 'mensal' } });
          $emit('changeMode');
        }
      "
      :outline="$route.query.mode != 'mensal'"
    />
  </div>
</template>
<script setup>
defineEmits(["changeMode"]);
</script>
