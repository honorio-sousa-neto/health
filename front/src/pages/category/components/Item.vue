<template>
  <div class="row justify-between items-center">
    <div class="text-body1">{{ item.name }}</div>
    <div>
      <q-btn icon="delete" color="red" round dense flat />
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});
</script>
