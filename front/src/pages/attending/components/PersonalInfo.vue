<template>
  <q-card square flat class="q-pa-md" style="font-size: 13pt">
    <div class="">
      <div class="q-pa-sm bg-teal-8 text-h6 text-white q-mb-sm">
        Informações pessoais
      </div>
      <div class="q-gutter-sm q-px-md q-pt-md">
        <div class="row">
          <div class="col-3">Nome do paciente:</div>
          <span class="text-bold">{{
            storeAttending.currentAttendance.customer?.name
          }}</span>
        </div>
        <div class="row">
          <div class="col-3">Telemóvel:</div>
          <span class="text-bold">{{
            storeAttending.currentAttendance.customer?.phone
          }}</span>
        </div>
        <div class="row items-center">
          <div class="col-3">Idade:</div>
          <div>
            <input
              v-model="store.form.age"
              type="text"
              placeholder="Digite aqui..."
              :readonly="['doctor', 'analyst'].includes(user.role)"
            />
          </div>
        </div>

        <div class="row items-center">
          <div class="col-3">Género:</div>
          <div>
            <q-radio v-model="store.form.gender" dense val="MALE" label="M" />
            <q-radio
              v-model="store.form.gender"
              dense
              class="q-ml-md"
              val="FEMALE"
              label="F"
            />
          </div>
        </div>
        <!-- <div class="row items-center">
          <div>Residência:</div>
          <input v-model="text" type="text" placeholder="Digite aqui..." />
        </div> -->
      </div>
    </div>
  </q-card>
</template>
<script setup>
import { SessionStorage } from "quasar";
import { useAttendingStore } from "src/stores/attending";
import { useScreeningStore } from "src/stores/screening";
const user = SessionStorage.getItem("alfavida_user");
const storeAttending = useAttendingStore();
const store = useScreeningStore();
</script>
<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input {
  border: none;
  outline: none;
}
</style>
