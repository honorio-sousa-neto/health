<template>
  <q-tabs dense align="left" v-model="tab" class="text-teal">
    <q-tab name="mails" label="Em atendimento" />
    <q-tab name="alarms" label="Histórico" />
  </q-tabs>
  <q-separator color="primary" />
  <q-tab-panels v-model="tab" animated>
    <q-tab-panel class="q-px-none" name="mails">
      <Waiting />
    </q-tab-panel>
    <q-tab-panel name="alarms"> </q-tab-panel>
    <q-tab-panel name="movies">
      <div class="text-h6">Movies</div>
      Lorem ipsum dolor sit amet consectetur adipisicing elit.
    </q-tab-panel>
  </q-tab-panels>
</template>
<script setup>
import { ref } from "vue";
import Waiting from "../attending/waiting.vue";

const tab = ref("mails");
</script>
