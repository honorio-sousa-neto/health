<template>
  <q-table
    :rows="rows"
    row-key="id"
    selection="multiple"
    v-model:selected="selected"
    grid
    hide-bottom
    :pagination="{ rowsPerPage: 0 }"
  >
    <template v-slot:item="props">
      <div
        class="q-pa-xs col-xs-12 col-sm-6 col-md-3 col-lg-3 grid-style-transition"
        :style="props.selected ? 'transform: scale(0.95);' : ''"
      >
        <q-card
          bordered
          flat
          :class="props.selected ? 'bg-teal-8 text-white' : 'bg-grey-2'"
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
                    }).format(props.row.service.unit_price)
                  }}
                </div>
              </div>
              <div class="text-caption">
                {{ props.row.description?.slice(0, 30) || "Nenhuma descrição" }}
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
</template>
<script setup>
const selected = defineModel("selected");
defineProps({
  rows: {
    type: Array,
    default: [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>
