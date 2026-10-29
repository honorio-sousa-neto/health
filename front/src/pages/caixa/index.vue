<template>
  <div class="data-page">
    <!-- Tab pills -->
    <div class="tab-bar">
      <button
        v-for="bank in store.data.data"
        :key="bank.id"
        class="tab-pill"
        :class="{ active: tab === bank.id }"
        @click="tab = bank.id"
      >
        <q-icon name="las la-university" size="14px" />
        {{ bank.name }}
      </button>
    </div>

    <!-- Content -->
    <Flow :key="tab" :flow="tab" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useBankStore } from "src/stores/bank";
import Flow from "./component/flow.vue";

const tab = ref("Caixa");
const store = useBankStore();

onMounted(() => store.index());
</script>

<style scoped lang="scss">
.tab-bar {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding: 16px 16px 0;
}

.tab-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--r-pill);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  font-size: var(--fs-body); line-height: var(--lh-body);
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;

  &:hover { border-color: var(--st-ok); color: var(--st-ok-text); }

  &.active {
    background: #32b989;
    border-color: var(--st-ok);
    color: #fff;
  }
}
</style>
