<template>
  <div class="q-pa-md bg-grey-3">
    <div v-for="subItem in subItens">
      <q-input
        v-model="subItem.name"
        type="text"
        label="Título"
        dense
        outlined
      />
      <q-checkbox
        left-label
        v-model="subItem.isHeader"
        label="É um cabeçalho?"
      />
      <q-slide-transition>
        <div v-if="!subItem.isHeader">
          <AddInput
            v-model:options="subItem.options"
            v-model:input="subItem.input"
            v-model:reference="subItem.reference"
          ></AddInput>
        </div>
      </q-slide-transition>
      <q-slide-transition>
        <div v-if="subItem.isHeader">
          <AddSubitem v-model:items="subItem.subItens"></AddSubitem>
        </div>
      </q-slide-transition>
    </div>
    <div class="q-mt-md">
      <q-btn
        color="primary"
        label="Novo sub-item"
        @click="
          subItens.push({
            isHeader: false,
            name: null,
            input: 'TEXT',
            options: [],
            subItens: [],
            reference: 'N',
          })
        "
      />
    </div>
  </div>
  <q-separator spaced />
</template>
<script setup>
import AddInput from "./AddInput.vue";
const subItens = defineModel("items", {
  default: [
    {
      isHeader: false,
      name: null,
      input: "TEXT",
      options: [],
      subItens: [
        {
          isHeader: false,
          name: null,
          input: "TEXT",
          options: [],
          subItens: [],
        },
      ],
    },
  ],
});
</script>
