<template>
  <div class="metric-card" :class="{ 'metric-card--actionable': actionable }">
    <div class="mc-top">
      <div class="mc-icon" :style="{ background: iconBg }">
        <q-icon :name="icon" size="16px" :style="{ color: iconColor }" />
      </div>
      <div class="mc-label">{{ text }}</div>
      <q-btn
        v-if="actionable"
        flat round dense
        icon="las la-plus"
        size="xs"
        class="mc-add-btn"
        :style="{ color: iconColor }"
        @click.stop="$emit('action')"
      />
    </div>
    <div class="mc-amount" :style="{ color: amountColor }">
      {{ new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount ?? 0) }}
      <span class="mc-currency">Kz</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String },
  amount: { type: Number, default: 0 },
  icon: { type: String, default: "las la-arrow-down" },
  iconColor: { type: String, default: "#32b989" },
  iconBg: { type: String, default: "rgba(50,185,137,0.12)" },
  amountColor: { type: String, default: "#1a202c" },
  actionable: { type: Boolean, default: false },
});
defineEmits(["action"]);
</script>

<style scoped lang="scss">
.metric-card {
  background: var(--surface);
  border-radius: var(--r-control);
  border: 1px solid var(--border);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric-card--actionable {
  &:hover { background: var(--surface-2); border-color: var(--border-control); }
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

.mc-add-btn {
  opacity: 0.5;
  transition: opacity 0.15s;
  .metric-card--actionable:hover & { opacity: 1; }
}

.mc-amount {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}

.mc-currency {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 500;
  color: var(--text-faint);
  margin-left: 2px;
}
</style>
