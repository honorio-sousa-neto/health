<template>
  <div>
    <div class="row">
      <q-radio v-model="input" val="TEXT" label="Quantitativo" />
      <q-radio v-model="input" val="SELECT" label="Qualitativo" />
    </div>
    <div class="q-my-sm">
      <q-input
        v-model="reference"
        type="text"
        label="Valor de referência"
        outlined
      />
    </div>
    <q-slide-transition>
      <div v-show="input == 'SELECT'">
        <div class="row q-gutter-md">
          <q-input
            class="col-9"
            v-model="text"
            type="text"
            label="Opção"
            outlined
          />
          <q-btn
            class="col"
            color="primary"
            icon="las la-plus"
            label="Adicionar"
            no-caps
            @click="
              () => {
                if (!text) return;
                options.push({ label: text, value: text });
                text = null;
              }
            "
          />
        </div>
        <div v-if="options.length">
          <ol>
            <li v-for="(option, index) in options">
              <div class="row items-center q-gutter-md">
                <div>{{ option.label }}</div>
                <div>
                  <q-btn
                    color="red-8"
                    icon="close"
                    round
                    flat
                    @click="spliceMethod(index)"
                  />
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
      <q-separator spaced />
    </q-slide-transition>
  </div>
</template>
<script setup>
import { ref } from "vue";

const input = defineModel("input", { default: "TEXT" });
const options = defineModel("options", { default: [] });
const reference = defineModel("reference");
const text = ref(null);

const spliceMethod = (index) => {
  try {
    options.value.splice(index, 1);
  } catch (error) {
    console.log(error.message);
  }
};
</script>
