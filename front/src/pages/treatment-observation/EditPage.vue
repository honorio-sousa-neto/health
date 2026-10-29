<template>
  <div class="q-px-md">
    <Form @create="onSubmit"/>
  </div>

</template>
<script setup>
import { useRoute } from 'vue-router';
import Form from './components/Form.vue';
import { useTreatmentObservationStore } from 'src/stores/treatment-observation';
const store = useTreatmentObservationStore()
const route = useRoute()
const onSubmit = async () => {
  await store.update(store.form, route.params.id)
}


</script>
