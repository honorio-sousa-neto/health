<template>
  <div>
    <div class="text-h6">
      {{ customer.name }}
    </div>
    <div class="text-body1">
      <div>
        Contacto: <span class="text-body">{{ customer.phone }}</span>
      </div>
      <div>
        Endereço: <span class="text-body">{{ customer.address }}</span>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  customer: {
    type: Object,
    default: {
      name: null,
      phone: null,
      address: null,
    },
  },
});
</script>
