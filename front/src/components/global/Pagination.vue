<template>
  <div class="pagination-bar row items-center justify-between q-mt-lg">
    <div class="text-caption text-grey-5">
      Página {{ page }} de {{ totalPages }}
    </div>
    <div class="row items-center q-gutter-sm">
      <q-select
        v-model="perPage"
        :options="[5, 10, 15, 25, 50]"
        outlined
        dense
        label="Por página"
        style="width: 105px"
        @update:model-value="$emit('update-search')"
      />
      <q-pagination
        v-model="page"
        color="primary"
        active-color="primary"
        :max="totalPages"
        :max-pages="6"
        boundary-links
        direction-links
        @update:model-value="$emit('update-search')"
      />
    </div>
  </div>
</template>

<script setup>
const perPage = defineModel("perPage");
const page = defineModel("page");

defineEmits(["update-search"]);
defineProps({
  totalPages: { type: Number, required: true },
});
</script>

<style lang="scss" scoped>
.pagination-bar {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  padding: 10px 16px;
}
</style>
