<template>
  <div class="row" v-if="data.length">
    <div class="col-3" v-for="surgery in data">
      <q-card>
        <q-card-section class="row justify-between items-center">
          <div>
            <div class="text-bold">
              {{ surgery.service.name }}
            </div>
            <div class="text-caption">
              {{ surgery.service.description }}
            </div>
          </div>
          <div>
            <q-btn
              color="primary"
              round
              flat
              dense
              icon="las la-coins"
              @click="
                $router.push({
                  name: 'emitir-documento-form',
                  params: {
                    administrationId: surgery.id,
                  },
                })
              "
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
  <div v-else>Nenhum pedido</div>
</template>
<script setup>
import { useCommom } from "src/composables/commom";
const { data } = useCommom("administrations");
</script>
