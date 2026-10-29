<template>
  <div>
    <!-- Cabeçalho -->
    <div class="ph-header">
      <div>
        <div class="ph-title">Farmácia · Dispensar</div>
        <div class="ph-sub">Prescrições pendentes de entrega</div>
      </div>
      <q-btn unelevated no-caps icon="las la-sync-alt" label="Actualizar"
        color="primary" size="sm" style="border-radius: var(--r-sm)" @click="fetchData" />
    </div>

    <!-- Estado: loading / vazio -->
    <div v-if="loading" class="ph-state">
      <q-spinner-dots color="primary" size="28px" />
    </div>
    <div v-else-if="!data.length" class="ph-state">
      <q-icon name="las la-pills" size="48px" color="grey-4" />
      <span>Nenhuma prescrição pendente</span>
    </div>

    <!-- Lista de prescrições -->
    <div v-else class="ph-list">
      <div v-for="rx in data" :key="rx.id" class="rx-card">
        <!-- Cabeçalho do cartão -->
        <div class="rx-head">
          <div class="rx-patient">
            <q-icon name="las la-user" size="14px" color="grey-5" />
            {{ rx.consultation?.screening?.customer?.name ?? '—' }}
          </div>
          <div class="rx-meta">
            <span class="rx-doctor">Dr. {{ rx.doctor?.name ?? '—' }}</span>
            <span class="rx-date">{{ fmtDate(rx.createdAt) }}</span>
          </div>
        </div>

        <!-- Itens prescritos -->
        <div class="rx-items">
          <div v-for="item in rx.items" :key="item.id" class="rx-item">
            <div class="rx-drug">
              <span class="rx-drug-name">{{ item.service?.name ?? '—' }}</span>
              <span class="rx-drug-qty">× {{ item.quantity }}</span>
            </div>
            <div class="rx-dosage">
              {{ item.dose }}
              <span v-if="item.frequency" class="rx-sep">·</span>
              {{ item.frequency }}
              <span v-if="item.duration" class="rx-sep">·</span>
              {{ item.duration ? item.duration + ' dia(s)' : '' }}
              <span v-if="item.canal" class="rx-sep">·</span>
              {{ item.canal }}
            </div>
          </div>
        </div>

        <!-- Acção -->
        <div class="rx-footer">
          <q-btn unelevated no-caps icon="las la-check-circle" label="Dispensar"
            color="primary" size="sm" style="border-radius: var(--r-sm)"
            :loading="dispensing === rx.id"
            @click="dispense(rx.id)" />
        </div>
      </div>
    </div>

    <!-- Dialog de confirmação -->
    <q-dialog v-model="confirmDialog" persistent>
      <q-card style="min-width: min(360px, 92vw); border-radius: var(--r-panel)">
        <q-card-section class="q-pb-sm">
          <div class="text-subtitle1 text-weight-semibold">Confirmar dispensa</div>
        </q-card-section>
        <q-card-section>
          <div style="font-size: var(--fs-title); color:var(--text-3)">
            Ao confirmar, o stock dos medicamentos será decrementado automaticamente.
            Esta operação não pode ser revertida.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancelar" @click="confirmDialog = false; pendingId = null" />
          <q-btn unelevated no-caps label="Confirmar" color="primary"
            :loading="dispensing !== null" @click="confirmDispense" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { showNotify } from 'src/utils/notify'
import { onMounted, reactive, ref } from 'vue'

const loading       = ref(false)
const dispensing    = ref(null)
const confirmDialog = ref(false)
const pendingId     = ref(null)
const data          = reactive([])

const fetchData = async () => {
  loading.value = true
  try {
    const { data: res } = await api.get('prescriptions')
    data.splice(0, data.length, ...(res.data ?? []))
  } catch (_) {} finally { loading.value = false }
}

const dispense = (id) => {
  pendingId.value = id
  confirmDialog.value = true
}

const confirmDispense = async () => {
  if (!pendingId.value) return
  dispensing.value = pendingId.value
  try {
    const { data: res } = await api.post(`prescriptions/${pendingId.value}/dispense`)
    showNotify(res.message, res.success)
    if (res.success) {
      confirmDialog.value = false
      fetchData()
    }
  } catch (_) {
    showNotify('Erro ao dispensar prescrição', false)
  } finally {
    dispensing.value = null
    pendingId.value  = null
  }
}

const fmtDate = (d) =>
  d ? new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d)) : '—'

onMounted(fetchData)
</script>

<style scoped lang="scss">
.ph-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 20px 12px; flex-wrap: wrap; gap: 12px;
}
.ph-title { font-size: var(--fs-heading); line-height: var(--lh-tight); font-weight: 700; color: var(--text); }
.ph-sub   { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 2px; }

.ph-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 70px 20px; color: var(--text-faint); font-size: var(--fs-body); line-height: var(--lh-body);
}

.ph-list {
  padding: 0 20px 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px;
}

.rx-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-panel);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  &:hover { background: var(--surface-2); border-color: var(--border-control); }
}

.rx-head {
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--surface-3);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.rx-patient {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 600; color: var(--text);
}

.rx-meta {
  display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
}
.rx-doctor { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted); }
.rx-date   { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }

.rx-items {
  flex: 1;
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rx-item { background: var(--surface-2); border-radius: var(--r-sm); padding: 8px 10px; }

.rx-drug {
  display: flex; align-items: center; gap: 8px; margin-bottom: 3px;
}
.rx-drug-name { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 500; color: var(--text-2); }
.rx-drug-qty  { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--st-ok-text); background: var(--st-ok-tint); padding: 1px 6px; border-radius: var(--r-control); }

.rx-dosage {
  font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-muted);
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
}
.rx-sep { color: var(--text-disabled); }

.rx-footer {
  padding: 10px 16px 14px;
  border-top: 1px solid var(--surface-3);
  display: flex;
  justify-content: flex-end;
}
</style>
