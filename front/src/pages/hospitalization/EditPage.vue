<template>
  <div class="q-px-md">
    <Form @create="onSubmit"/>
  </div>

</template>
<script setup>
import { useRoute } from 'vue-router';
import Form from './components/Form.vue';
import { useHospitalizationStore } from 'src/stores/hospitalization';
const store = useHospitalizationStore()
const route = useRoute()
const onSubmit = async () => {
  await store.update(store.form, route.params.id)
}


</script>
