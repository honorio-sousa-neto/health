<template>
  <div class="q-pa-md">
    <div class="row justify-between q-gutter-md q-pb-md">
      <div>
        <div class="text-h6 text-weight-regular">
          Bem-vindo de volta, <span class="text-teal-9">Jacinto Veloso</span>
        </div>
        <div class="text-grey-8">
          Aqui estão as actualizações dos últimos 7 dias
        </div>
      </div>
      <div>
        <q-btn-dropdown outline no-caps label="Últimos 7 dias" color="grey-8">
          <q-list>
            <q-item clickable v-close-popup @click="onItemClick">
              <q-item-section>
                <q-item-label>Photos</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>
    <div class="row q-col-gutter-md">
      <div class="col-md-3 col-sm-6 col-xs-12">
        <Custom />
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <Service />
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <Service />
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <Service />
      </div>
    </div>
    <div class="row q-my-sm justify-between q-col-gutter-md">
      <div class="col-md-8 col-sm-12 col-xs-12">
        <Graph />
      </div>
      <div class="col-md-4 col-sm-12 col-xs-12">
        <Donut />
      </div>
    </div>
  </div>
</template>
<script setup>
import PerMonth from "src/components/dashboard/per-month.vue";
import PerNumber from "src/components/dashboard/per-number.vue";
import Custom from "./card/custom.vue";
import Service from "./card/service.vue";
import Graph from "./card/graph.vue";
import Donut from "./card/donut.vue";
</script>
