<template>
  <div class="stat-card">
    <div class="stat-card__icon" :style="{ background: bg }">
      <q-icon :name="icon" size="22px" :style="{ color: color }" />
    </div>
    <div class="stat-card__val">{{ value }}</div>
    <div class="stat-card__key">{{ label }}</div>
  </div>
</template>

<script setup>
defineProps({
  icon:  { type: String, required: true },
  value: { type: [Number, String], required: true },
  label: { type: String, required: true },
  color: { type: String, default: "#32b989" },
  bg:    { type: String, default: "#f0fbf6" },
});
</script>

<style scoped lang="scss">
.stat-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r-control);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-card__icon {
  width: 42px; height: 42px; border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
}

.stat-card__val {
  font-size: 28px; font-weight: 800; color: var(--text); line-height: 1;
}

.stat-card__key {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.5px;
}
</style>
