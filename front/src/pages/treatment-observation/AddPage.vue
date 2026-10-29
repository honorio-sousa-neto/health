<template>
  <div class="q-px-md">
    <Form @create="onSubmit"/>
  </div>

</template>
<script setup>
import { useTreatmentObservationStore } from 'src/stores/treatment-observation';
import Form from './components/Form.vue';
const store = useTreatmentObservationStore()

const onSubmit = async () => {
  await store.create(store.form)
}
</script>
