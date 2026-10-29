<template>
  <div v-if="data.isHeader">
    <div class="text-bold">
      {{ data.name }}
    </div>
    <ul>
      <li v-for="subitem in data.subItens">
        <div v-if="subitem.isHeader">
          <div>
            {{ subitem.name }}
          </div>
          <ol>
            <li v-for="item in subitem.subItens" class="q-my-xs">
              <div class="col-4">
                {{ item.name }}
              </div>
              <div class="col-4">
                Resultado:
                <span class="text-bold">{{ item.result }}</span>
              </div>
              <div class="col-4">
                Valor de referência:
                <span class="text-bold">{{ item.reference }}</span>
              </div>
            </li>
          </ol>
        </div>
        <div v-else class="q-my-xs">
          <div class="col-4">
            {{ subitem.name }}
          </div>
          <div class="col-4">
            Resultado:
            <span class="text-bold">{{ subitem.result }}</span>
          </div>
          <div class="col-4">
            Valor de referência:
            <span class="text-bold">{{ subitem.reference }}</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
  <div v-else class="q-my-xs">
    <div class="col-4 text-bold">
      {{ data.name }}
    </div>
    <div class="col-4">
      Resultado: <span class="text-bold">{{ data.result }}</span>
    </div>
    <div class="col-4">
      Valor de referência:
      <span class="text-bold">{{ data.reference }}</span>
    </div>
  </div>
</template>
<script setup>
defineProps({
  data: {
    type: Object,
  },
});
</script>
