<template>
  <div class="q-pa-md bg-grey-3">
    <div v-for="(subItem, index) in subItens">
      <div class="row q-gutter-sm q-mb-sm items-center justify-between">
        <div class="text-bold">Parâmetro</div>
        <div>
          <q-btn
            color="red-8"
            icon="las la-minus"
            rounded
            label="Remover este parâmetro"
            @click="subItens.splice(index, 1)"
            no-caps
          />
        </div>
      </div>
      <q-input v-model="subItem.name" type="text" label="Título" outlined />
      <div class="row q-gutter-md q-mb-sm">
        <q-radio
          v-model="subItem.isHeader"
          :val="false"
          label="Resultado Simples"
        />
        <q-radio
          v-model="subItem.isHeader"
          :val="true"
          label="Resultado Composto"
        />
      </div>
      <q-separator spaced />

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
        <div v-if="subItem.isHeader" class="q-pl-md">
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
            reference: '-',
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
