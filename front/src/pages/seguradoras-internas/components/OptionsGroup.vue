<template>
  <div>
    <q-table
      :rows="rows"
      row-key="id"
      selection="multiple"
      v-model:selected="selected"
      grid
      hide-bottom
      :pagination="{ rowsPerPage: 0 }"
      :filter
      class="full-width"
    >
      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-4 grid-style-transition"
          :style="props.selected ? 'transform: scale(0.95);' : ''"
        >
          <q-card
            bordered
            flat
            :class="
              props.selected
                ? $q.dark.isActive
                  ? 'bg-grey-9'
                  : 'bg-grey-2'
                : ''
            "
          >
            <q-card-section class="row items-center q-gutter-md">
              <q-checkbox dense v-model="props.selected" />
              <div class="col">
                <div class="row justify-between">
                  <div class="text-bold">{{ props.row.name }}</div>
                  <div class="text-bold">
                    {{
                      new Intl.NumberFormat("de-DE", {
                        currency: "AOA",
                        style: "currency",
                      }).format(props.row.unit_price)
                    }}
                  </div>
                </div>
                <div class="text-caption">
                  {{
                    props.row.description?.slice(0, 30) || "Nenhuma descrição"
                  }}
                  <q-tooltip>
                    {{ props.row.description }}
                  </q-tooltip>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
  </div>
</template>
<script setup>
import { computed } from "vue";

const props = defineProps({
  rows: {
    type: Array,
    default: [],
  },
  filter: {
    type: String,
  },
});
const selected = defineModel("selected");
const optionsGroup = computed(() => props.options);
</script>
