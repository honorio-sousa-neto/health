<template>
  <q-form @submit="onSubmit" @reset="onReset">
    <div class="type-toggle q-mb-md">
      <button
        type="button"
        class="toggle-btn"
        :class="{ active: form.type === 'ENTRY' }"
        @click="form.type = 'ENTRY'"
      >
        <q-icon name="las la-arrow-down" size="14px" />
        Entrada
      </button>
      <button
        type="button"
        class="toggle-btn toggle-btn--out"
        :class="{ active: form.type === 'OUT' }"
        @click="form.type = 'OUT'"
      >
        <q-icon name="las la-arrow-up" size="14px" />
        Saída
      </button>
    </div>

    <div class="q-gutter-sm">
      <q-input
        v-model.number="form.amount"
        type="number"
        step="0.001"
        label="Montante"
        class="fi"
        borderless
      />
      <q-input
        v-model="form.description"
        type="text"
        label="Descrição"
        class="fi"
        borderless
      />
    </div>

    <div class="q-mt-md row q-gutter-sm">
      <q-btn unelevated no-caps label="Salvar" type="submit" color="primary" class="save-btn" :loading />
      <q-btn no-caps label="Limpar" type="reset" flat color="grey-6" />
    </div>
  </q-form>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  loading: { type: Boolean },
  initialType: { type: String, default: "ENTRY" },
});
const emit = defineEmits(["saved"]);

const form = reactive({ type: props.initialType, amount: null, description: null });

watch(() => props.initialType, (val) => { form.type = val; });

const onSubmit = () => {
  emit("saved", { ...form });
  onReset();
};
const onReset = () => {
  Object.assign(form, { type: props.initialType, amount: null, description: null });
};
</script>

<style scoped lang="scss">
.type-toggle {
  display: flex;
  gap: 6px;
  background: var(--surface-3);
  border-radius: var(--r-sm);
  padding: 4px;
}

.toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: var(--r-sm);
  border: none;
  background: transparent;
  font-size: var(--fs-body); line-height: var(--lh-body);
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &.active {
    background: var(--surface);
    color: var(--st-ok-text);
  }

  &--out.active {
    color: var(--danger);
  }
}

.save-btn { border-radius: var(--r-sm); font-weight: 600; }
</style>
