<template>
  <div class="row q-gutter-md q-mb-md">
    <div v-for="i in 4" class="col">
      <q-card bordered flat square>
        <q-card-section>
          <div class="row items-center q-gutter-sm justify-between">
            <div>
              <q-icon name="las la-users" size="xl" />
              <div class="text-h6">2</div>
            </div>
            <div class="text-h5">Clientes</div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
