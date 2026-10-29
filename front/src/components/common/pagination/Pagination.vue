<template>
  <div class="pagination-bar">
    <!-- Search -->
    <div class="pag-search">
      <q-icon name="las la-search" size="15px" color="grey-5" />
      <input
        v-model="search"
        class="pag-search-input"
        placeholder="Pesquisar..."
      />
      <q-icon
        v-if="search"
        name="las la-times"
        size="13px"
        color="grey-4"
        class="cursor-pointer"
        @click="search = ''"
      />
    </div>

    <q-space />

    <!-- Total -->
    <div class="pag-total" v-if="total > 0">
      {{ total }} {{ total === 1 ? "registo" : "registos" }}
    </div>

    <!-- Per page -->
    <q-select
      v-model="perPage"
      dense
      borderless
      :options="[5, 10, 15, 25, 50]"
      class="pag-perpage"
    />

    <!-- Nav -->
    <q-pagination
      v-model="page"
      :max="totalPages"
      color="grey-6"
      active-color="primary"
      :max-pages="5"
      boundary-links
      direction-links
      flat
    />

    <!-- Action button (e.g. Novo) -->
    <div v-if="$slots.actions" class="pag-divider" />
    <slot name="actions" />
  </div>
</template>

<script setup>
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const page = defineModel("page");
const perPage = defineModel("perpage");
const search = defineModel("search", { default: "" });

const router = useRouter();
const route = useRoute();

const props = defineProps({
  totalPages: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
});

const emits = defineEmits(["fetch"]);

// page / perPage — navigate immediately
watch([page, perPage], ([, newPerPage], [, oldPerPage]) => {
  router.push({
    query: {
      page: newPerPage !== oldPerPage ? 1 : page.value,
      perPage: perPage.value,
      search: search.value || undefined,
    },
  });
  emits("fetch");
});

// search — debounced, resets to page 1
let searchTimer = null;
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    router.push({
      query: {
        page: 1,
        perPage: perPage.value,
        search: search.value || undefined,
      },
    });
    emits("fetch");
  }, 600);
});
</script>

<style scoped lang="scss">
.pagination-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  padding: 6px 14px;
  margin-bottom: 4px;
}

.pag-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface-3);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-pill);
  padding: 0 14px;
  height: 40px;
  min-width: 250px;
  transition: border-color 0.18s ease, background 0.18s ease;

  &:hover { border-color: var(--text-disabled); }

  &:focus-within {
    border-color: var(--accent);
    outline: var(--ring-w) solid var(--accent);
    outline-offset: 1px;
  }
}

.pag-search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--fs-body);
  color: var(--text);
  flex: 1;
  min-width: 0;

  &::placeholder { color: var(--text-disabled); }
}

.pag-total {
  font-size: var(--fs-label);
  color: var(--text-faint);
  white-space: nowrap;
}

.pag-perpage {
  font-size: var(--fs-body);
  min-width: 70px;
}

.pag-divider {
  width: 1px;
  height: 20px;
  background: var(--border);
  flex-shrink: 0;
}
</style>
