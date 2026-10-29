<template>
  <div class="q-ml-md">
    <div class="text-bold q-py-sm">
      {{ customer.name }}
    </div>
    <div v-if="customer?.internId" class="q-pa-sm">
      <div>
        Seguro interno:
        <span class="text-bold">
          {{ customer.intern.name }}
        </span>
      </div>
    </div>
    <div v-else-if="customer?.parentId" class="q-pa-sm">
      <div>
        Seguro interno:
        <span class="text-bold">
          {{ customer.parent?.intern?.name }}
        </span>
      </div>
    </div>
    <div v-else-if="customer?.protocolId" class="q-pa-sm">
      <div>
        Protocolo:
        <span class="text-bold">
          {{ customer.protocol.name }}
        </span>
      </div>
    </div>
    <div v-else-if="customer?.insuranceId" class="q-pa-sm">
      <div>
        Seguradora:
        <span class="text-bold">
          {{ customer.insurance?.name }}
        </span>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  customer: {
    type: Object,
  },
});
</script>
