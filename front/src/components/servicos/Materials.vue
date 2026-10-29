<template>
  <div>
    <q-separator spaced />
    <q-card-section>
      <div class="row">
        <q-select
          class="col"
          v-model="materials"
          type="text"
          label="Pesquisa"
          multiple
          outlined
          dense
          use-input
          option-label="name"
          option-value="id"
          input-debounce="500"
          @filter="filterFunction"
          :options="options"
          use-chips
        />
      </div>
      <q-slide-transition>
        <div class="q-my-md" v-if="materials.length">
          <div v-for="material in materials">
            <q-item>
              <q-item-section>
                <q-item-label>{{ material.name }}</q-item-label>
                <q-item-label caption lines="2">{{
                  material.measure
                }}</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-input
                  standout="bg-teal-8 text-white"
                  v-model.number="material.qtd"
                  dense
                  step="0.001"
                  min="1"
                  type="number"
                  label="Quantidade"
                />
              </q-item-section>
            </q-item>
            <q-separator spaced />
            <!-- <div class="row items-center q-gutter-md">
              <div class="text-body1 col-3">{{ material.name }}</div>
              <div>
                <q-input
                  v-model.number="material.qtd"
                  type="number"
                  dense
                  outlined
                  label="Quantidade"
                />
              </div>
            </div>
            <q-separator spaced inset /> -->
          </div>
        </div>
      </q-slide-transition>
    </q-card-section>
  </div>
</template>
<script setup>
import { useMaterialStore } from "src/stores/material";
import { ref } from "vue";
const emits = defineEmits(["finished"]);
const store = useMaterialStore();

const materials = defineModel("materials", { default: [] });

const options = ref([]);
const filterFunction = async (val, update, abort) => {
  try {
    if (!val) return;
    update(async () => {
      const data = await store.filter(val);
      val = null;
      options.value = data;
    });
  } catch (error) {}
};
</script>
