<template>
  <div class="q-px-md">
    <q-tabs v-model="tab" dense align="left" class="text-teal">
      <q-tab name="newer" label="Novos pacientes" />
      <q-tab name="ongoing" label="Em atendimento" />
    </q-tabs>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel class="q-px-none" name="newer">
        <Table stage="DOCTOR_ONE" />
      </q-tab-panel>
      <q-tab-panel class="q-px-none" name="ongoing">
        <Table stage="DOCTOR_TWO" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
<script setup>
import { ref } from "vue";
import Table from "./medic/table.vue";
const tab = ref("newer");
</script>
