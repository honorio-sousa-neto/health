<template>
  <q-btn color="primary" :outline :label @click="onClick" />
</template>
<script setup>
defineProps({
  label: {
    type: String,
  },
  outline: {
    type: Boolean,
    default: false,
  },
});
</script>
