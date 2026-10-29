<template>
  <div class="card__customized text-white">
    <div class="row items-center q-gutter-md">
      <div>
        <q-btn
          flat
          color="teal-7"
          style="background-color: #80cbc4"
          text-color="white"
          dense
          icon="las la-users"
          @click="onClick"
        />
      </div>
      <div style="font-size: 12pt; letter-spacing: 1px">Geral clientes</div>
    </div>
    <div class="text-h3 q-py-md">459</div>
    <div>
      Novos <q-badge color="teal-4" text-color="white" label="30" /> clientes
      nos últimos 7 dias
    </div>
  </div>
</template>
<script setup></script>
<style lang="scss" scoped>
.card__customized {
  min-height: 170px;
  width: auto;
  border-radius: var(--r-panel);
  background: #b2dfdb;
  background: linear-gradient(209deg, #b2dfdb 0%, #00695c 80%);
  background: -webkit-linear-gradient(209deg, #b2dfdb 0%, #00695c 80%);
  background: -moz-linear-gradient(209deg, #b2dfdb 0%, #00695c 80%);
  padding: 16px;
}
</style>
