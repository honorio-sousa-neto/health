<template>
  <div class="row q-col-gutter-md">
    <div class="col-md-4 col-sm-6 col-xs-12">
      <q-card class="my-card">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Entrada</div>
          <div>
            <q-icon size="3rem" name="las la-caret-down" class="text-teal" />
          </div>
        </q-card-section>
        <q-card-section class="text-h5 q-pt-none"> 5.000,00 </q-card-section>
      </q-card>
    </div>
    <div class="col-md-4 col-sm-6 col-xs-12">
      <q-card class="my-card">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Saída</div>
          <div>
            <q-icon size="3rem" name="las la-caret-up" class="text-red-10" />
          </div>
        </q-card-section>
        <q-card-section class="text-h5 q-pt-none"> 2.500,00 </q-card-section>
      </q-card>
    </div>
    <div class="col-md-4 col-sm-6 col-xs-12 col">
      <q-card class="my-card">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Saldo</div>
          <div>
            <q-icon
              size="3rem"
              name="las la-balance-scale"
              class="text-green"
            />
          </div>
        </q-card-section>
        <q-card-section class="text-h5 q-pt-none"> 2.500,00 </q-card-section>
      </q-card>
    </div>
  </div>
</template>
