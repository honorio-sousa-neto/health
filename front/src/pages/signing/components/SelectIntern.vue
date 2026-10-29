<template>
  <q-select
    v-model="intern"
    :loading
    :options="data"
    option-label="name"
    option-value="id"
    label="Pacote"
    standout="bg-teal-8 text-white"
  />
  <q-slide-transition>
    <div class="q-ml-md" v-if="intern">
      <div>
        Custo:
        <span class="text-bold">{{ currencyFormat(intern.amount) }}</span>
      </div>
      <div>
        <div class="text-bold q-my-sm">Serviços incluídos</div>
        <div v-for="category in intern.services">
          <div class="text-bold">{{ category.category.name }}</div>
          <!-- {{ category.category.Service }} -->
          <div class="q-ml-sm text-caption">
            {{ category.category.Service.map((item) => item.name).join(", ") }}
          </div>
        </div>
      </div>
    </div>
  </q-slide-transition>
</template>
<script setup>
import { useCommom } from "src/composables/commom";
import { currencyFormat } from "src/utils/format";
import { computed, ref, watch } from "vue";
const { data, loading } = useCommom("interns");
const intern = defineModel("intern");
</script>
