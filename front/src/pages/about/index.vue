<template>
  <div class="page-content page-bg">

    <!-- Empresa -->
    <div class="form-card q-mb-md">
      <div class="row items-center justify-between q-mb-md">
        <div class="form-section-label" style="margin-bottom:0; border-bottom:none">
          Informações da Empresa
        </div>
        <q-btn flat no-caps dense :icon="isEditing ? 'las la-times' : 'las la-pen'"
          :label="isEditing ? 'Cancelar' : 'Editar'" color="grey-6" style="font-size: var(--fs-label)"
          @click="isEditing = !isEditing" />
      </div>

      <q-slide-transition>
        <Form v-if="isEditing" @saved="isEditing = false" />
      </q-slide-transition>
      <q-slide-transition>
        <View v-if="!isEditing" />
      </q-slide-transition>
    </div>

    <!-- Contas bancárias -->
    <div class="form-card">
      <div class="row items-center justify-between q-mb-md">
        <div class="form-section-label" style="margin-bottom:0; border-bottom:none">
          Contas Bancárias
        </div>
        <q-btn flat no-caps dense icon="las la-plus" label="Adicionar" color="primary"
          style="font-size: var(--fs-label)" @click="addBank" />
      </div>

      <!-- List -->
      <div v-if="banks.length" class="bank-list">
        <div v-for="(bank, idx) in banks" :key="bank.id ?? idx" class="bank-row">

          <div v-if="!bank._editing" class="bank-view">
            <div class="bank-icon">
              <q-icon name="las la-university" size="18px" />
            </div>
            <div class="bank-info">
              <div class="bank-name">{{ bank.name || '—' }}</div>
              <div class="bank-meta">
                <span v-if="bank.iban">IBAN: {{ bank.iban }}</span>
                <span v-if="bank.number">Conta: {{ bank.number }}</span>
              </div>
            </div>
            <div class="bank-btns">
              <q-btn flat round dense icon="las la-pen" size="sm" color="grey-5"
                @click="startEdit(idx)" />
              <q-btn flat round dense icon="las la-trash" size="sm" color="red-4"
                :loading="bank._deleting" @click="removeBank(idx)" />
            </div>
          </div>

          <div v-else class="bank-edit">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-4">
                <q-input v-model="bank.name" class="fi" borderless label="Banco" />
              </div>
              <div class="col-12 col-sm-4">
                <q-input v-model="bank.iban" class="fi" borderless label="IBAN" />
              </div>
              <div class="col-12 col-sm-4">
                <q-input v-model="bank.number" class="fi" borderless label="Nº de conta" />
              </div>
            </div>
            <div class="row justify-end q-mt-sm q-gutter-sm">
              <q-btn flat no-caps label="Cancelar" size="sm" color="grey-6"
                @click="cancelEdit(idx)" />
              <q-btn unelevated no-caps label="Guardar" size="sm" color="primary"
                style="border-radius: var(--r-sm)" :loading="bank._saving" @click="saveBank(idx)" />
            </div>
          </div>

        </div>
      </div>

      <div v-else class="state-box" style="padding:28px 0">
        <q-icon name="las la-university" size="32px" style="color:var(--text-disabled)" />
        <span class="state-text">Nenhuma conta bancária registada</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useCompanyStore } from "src/stores/company";
import { useBankStore } from "src/stores/bank";
import { onMounted, reactive, ref } from "vue";
import Form from "src/components/sobre/Form.vue";
import View from "./view.vue";

const isEditing = ref(false);
const store = useCompanyStore();
const bankStore = useBankStore();
const banks = reactive([]);

const addBank = () => {
  banks.push({ id: null, name: "", iban: "", number: "", _editing: true, _saving: false, _deleting: false, _orig: null });
};

const startEdit = (idx) => {
  const b = banks[idx];
  b._orig = { name: b.name, iban: b.iban, number: b.number };
  b._editing = true;
};

const cancelEdit = (idx) => {
  const b = banks[idx];
  if (!b.id) { banks.splice(idx, 1); return; }
  Object.assign(b, b._orig, { _editing: false });
};

const saveBank = async (idx) => {
  const b = banks[idx];
  b._saving = true;
  const companyId = store.data.data.id;
  const payload = { name: b.name, iban: b.iban, number: b.number, companyId };
  if (b.id) {
    await bankStore.update(payload, b.id);
  } else {
    const res = await bankStore.create(payload);
    if (res?.data?.data?.id) b.id = res.data.data.id;
  }
  b._orig = { name: b.name, iban: b.iban, number: b.number };
  b._editing = false;
  b._saving = false;
};

const removeBank = async (idx) => {
  const b = banks[idx];
  if (b.id) {
    b._deleting = true;
    await bankStore.destroy(b.id);
  }
  banks.splice(idx, 1);
};

onMounted(async () => {
  await store.show();
  await bankStore.index();
  banks.splice(0, banks.length, ...bankStore.data.data.map(b => ({
    ...b, _editing: false, _saving: false, _deleting: false,
    _orig: { name: b.name, iban: b.iban, number: b.number },
  })));
});
</script>

<style scoped lang="scss">

.bank-list { display: flex; flex-direction: column; gap: 8px; }

.bank-row {
  border: 1.5px solid var(--border); border-radius: var(--r-sm);
  overflow: hidden; background: var(--surface);
  &:hover { background: var(--surface-2); border-color: var(--border-control); }
}

.bank-view {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
}
.bank-icon {
  width: 36px; height: 36px; border-radius: var(--r-sm); flex-shrink: 0;
  background: var(--st-info-tint); color: var(--st-info-text);
  display: flex; align-items: center; justify-content: center;
}
.bank-info { flex: 1; min-width: 0; }
.bank-name { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 600; color: var(--text-2); }
.bank-meta { display: flex; gap: 14px; margin-top: 2px; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }
.bank-btns { display: flex; gap: 2px; flex-shrink: 0; }

.bank-edit { padding: 14px; background: var(--surface-2); }
</style>
