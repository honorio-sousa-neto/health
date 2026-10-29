<template>
  <div class="q-px-md">
    <Form @create="onSubmit"/>
  </div>

</template>
<script setup>
import { useHospitalizationStore } from 'src/stores/hospitalization';
import Form from './components/Form.vue';
const store = useHospitalizationStore()

const onSubmit = async () => {
  await store.create(store.form)
}
</script>
