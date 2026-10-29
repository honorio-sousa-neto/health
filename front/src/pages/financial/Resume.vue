<template>
  <div class="row q-col-gutter-md q-px-md q-pt-md">
    <!-- Recebido -->
    <div class="col-md-4 col-sm-6 col-xs-12">
      <div
        class="metric-card"
        :class="{ 'metric-card--active': status === 'PAGO' }"
        @click="select('PAGO')"
      >
        <div class="mc-top">
          <div class="mc-icon" style="background: rgba(50,185,137,0.10)">
            <q-icon name="las la-handshake" size="16px" style="color: var(--st-ok)" />
          </div>
          <span class="mc-label">Recebido</span>
          <q-icon v-if="status === 'PAGO'" name="las la-check-circle" size="16px" style="color: var(--st-ok)" />
        </div>
        <div class="mc-amount" style="color: var(--st-ok-text)">
          {{ fmt(amount.received) }} <span class="mc-kz">Kz</span>
        </div>
      </div>
    </div>

    <!-- A receber -->
    <div class="col-md-4 col-sm-6 col-xs-12">
      <div
        class="metric-card"
        :class="{ 'metric-card--active': status === 'POR_PAGAR' }"
        @click="select('POR_PAGAR')"
      >
        <div class="mc-top">
          <div class="mc-icon" style="background: rgba(237,137,54,0.10)">
            <q-icon name="las la-coins" size="16px" style="color: var(--st-warn)" />
          </div>
          <span class="mc-label">A receber</span>
          <q-icon v-if="status === 'POR_PAGAR'" name="las la-check-circle" size="16px" style="color: var(--st-warn)" />
        </div>
        <div class="mc-amount" style="color: var(--st-warn-text)">
          {{ fmt(amount.toReceive) }} <span class="mc-kz">Kz</span>
        </div>
      </div>
    </div>

    <!-- Imposto de selo -->
    <div class="col-md-4 col-sm-6 col-xs-12">
      <div class="metric-card">
        <div class="mc-top">
          <div class="mc-icon" style="background: rgba(66,153,225,0.10)">
            <q-icon name="las la-file-invoice-dollar" size="16px" style="color: var(--st-info)" />
          </div>
          <span class="mc-label">Imposto de selo</span>
        </div>
        <div class="mc-amount" style="color:var(--text-3)">
          {{ fmt(amount.received / 100) }} <span class="mc-kz">Kz</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { api } from "src/boot/axios";
import { onMounted, reactive } from "vue";

const status = defineModel("status");
const emit = defineEmits(["fetch"]);

const amount = reactive({ toReceive: 0, received: 0 });

const fmt = (val) =>
  new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(val) || 0);

const select = (val) => {
  status.value = val;
  emit("fetch");
};

const fetchData = async () => {
  const { data: { body: { data: response } } } = await api.get("finances/receipt");
  Object.assign(amount, response);
};

onMounted(fetchData);
</script>

<style scoped lang="scss">
.metric-card {
  background: var(--surface);
  border-radius: var(--r-control);
  border: 1.5px solid var(--border);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  transition: border-color 0.15s;

  &:hover { background: var(--surface-2); border-color: var(--border-control); }

  &--active {
    border-color: var(--st-ok);
  }
}

.mc-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mc-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--r-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mc-label {
  flex: 1;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.mc-amount {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.mc-kz {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 500;
  color: var(--text-faint);
  margin-left: 2px;
}
</style>
