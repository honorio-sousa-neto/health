<template>
  <div>
    {{ Hey }}
  </div>
</template>
<script setup>
import { useAccount } from "src/composables/account";
const props = defineProps(["startDate", "endDate", "internId", "id"]);
const { state } = useAccount({
  startDate: props.startDate,
  endDate: props.endDate,
  internId: props.internId,
  id: props.id,
});
</script>
