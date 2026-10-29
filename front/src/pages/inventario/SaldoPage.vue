<template>
  <div>
    <ListaPagina
      titulo="Existências"
      :contexto="contexto"
      apoio="Saldo actual por artigo e departamento. O estado compara o saldo com o stock mínimo da ficha."
      :colunas="colunas"
      :linhas="linhas"
      :carregando="loading"
      :paginacao="paginacao"
      :filtrado="!!paginacao.search || !!filterDept"
      texto-vazio="Ainda não há existências registadas."
      @recarregar="fetchBalance"
    >
      <template #accoes>
        <select v-model="filterDept" class="lp-filtro" aria-label="Filtrar por departamento" @change="fetchBalance">
          <option value="">Todos os departamentos</option>
          <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
        </select>

        <q-btn flat no-caps icon="las la-exchange-alt" label="Transferir" class="btn-icone" @click="openDialog('transferencia')" />
        <q-btn flat no-caps icon="las la-sliders-h" label="Ajuste manual" class="btn-icone" @click="openDialog('ajuste')" />
        <q-btn unelevated no-caps icon="las la-arrow-down" label="Registar entrada" class="btn-primaria" @click="openDialog('entrada')" />
      </template>
    </ListaPagina>

    <!-- ─── Dialog Entrada ──────────────────────────────────────────── -->
    <q-dialog v-model="dialogs.entrada" persistent>
      <q-card class="inv-dialog">
        <q-card-section class="dialog-header">
          <div class="dialog-title">
            <q-icon name="las la-arrow-down" color="primary" size="18px" />
            Registar entrada de stock
          </div>
          <q-btn flat round dense icon="las la-times" size="sm" @click="dialogs.entrada = false" />
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="submitEntrada">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-select v-model="fEntrada.productId" class="fi" borderless
                  label="Produto *" :options="productOpts" option-value="id" option-label="name"
                  emit-value map-options use-input input-debounce="300"
                  @filter="filterProds"
                  :rules="[v => !!v || 'Obrigatório']" lazy-rules popup-content-class="fi-popup" />
              </div>
              <div class="col-7">
                <q-select v-model="fEntrada.locationId" class="fi" borderless
                  label="Departamento de destino *" :options="locations"
                  option-value="id" option-label="name" emit-value map-options
                  :rules="[v => !!v || 'Obrigatório']" lazy-rules popup-content-class="fi-popup" />
              </div>
              <div class="col-5">
                <q-input v-model.number="fEntrada.quantity" class="fi" borderless
                  label="Quantidade *" type="number" min="0.01" step="0.01"
                  :rules="[v => v > 0 || 'Obrigatório']" lazy-rules />
              </div>
              <div class="col-12">
                <q-select v-model="fEntrada.reason" class="fi" borderless
                  label="Motivo *" :options="entryReasons" option-value="value" option-label="label"
                  emit-value map-options popup-content-class="fi-popup"
                  :rules="[v => !!v || 'Obrigatório']" lazy-rules />
              </div>
              <div class="col-12">
                <q-input v-model="fEntrada.description" class="fi" borderless
                  label="Observações" type="textarea" rows="2" autogrow />
              </div>
            </div>
            <div class="dialog-footer">
              <q-btn flat no-caps label="Cancelar" @click="dialogs.entrada = false" />
              <q-btn unelevated no-caps type="submit" label="Guardar" color="primary" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ─── Dialog Transferência ────────────────────────────────────── -->
    <q-dialog v-model="dialogs.transferencia" persistent>
      <q-card class="inv-dialog">
        <q-card-section class="dialog-header">
          <div class="dialog-title">
            <q-icon name="las la-exchange-alt" color="blue-grey-7" size="18px" />
            Transferir entre departamentos
          </div>
          <q-btn flat round dense icon="las la-times" size="sm" @click="dialogs.transferencia = false" />
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="submitTransferencia">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-select v-model="fTransfer.productId" class="fi" borderless
                  label="Produto *" :options="productOpts" option-value="id" option-label="name"
                  emit-value map-options use-input input-debounce="300"
                  @filter="filterProds"
                  :rules="[v => !!v || 'Obrigatório']" lazy-rules popup-content-class="fi-popup" />
              </div>
              <div class="col-6">
                <q-select v-model="fTransfer.fromLocationId" class="fi" borderless
                  label="De (origem) *" :options="locations"
                  option-value="id" option-label="name" emit-value map-options
                  :rules="[v => !!v || 'Obrigatório']" lazy-rules popup-content-class="fi-popup" />
              </div>
              <div class="col-6">
                <q-select v-model="fTransfer.toLocationId" class="fi" borderless
                  label="Para (destino) *" :options="locations"
                  option-value="id" option-label="name" emit-value map-options
                  :rules="[v => !!v || 'Obrigatório']" lazy-rules popup-content-class="fi-popup" />
              </div>
              <div class="col-12">
                <q-input v-model.number="fTransfer.quantity" class="fi" borderless
                  label="Quantidade *" type="number" min="0.01" step="0.01"
                  :rules="[v => v > 0 || 'Obrigatório']" lazy-rules />
              </div>
              <div class="col-12">
                <q-input v-model="fTransfer.description" class="fi" borderless
                  label="Observações" type="textarea" rows="2" autogrow />
              </div>
            </div>
            <div class="dialog-footer">
              <q-btn flat no-caps label="Cancelar" @click="dialogs.transferencia = false" />
              <q-btn unelevated no-caps type="submit" label="Transferir" color="blue-grey-7" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ─── Dialog Ajuste ──────────────────────────────────────────── -->
    <q-dialog v-model="dialogs.ajuste" persistent>
      <q-card class="inv-dialog">
        <q-card-section class="dialog-header">
          <div class="dialog-title">
            <q-icon name="las la-sliders-h" color="grey-7" size="18px" />
            Ajuste manual de stock
          </div>
          <q-btn flat round dense icon="las la-times" size="sm" @click="dialogs.ajuste = false" />
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="submitAjuste">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-select v-model="fAjuste.productId" class="fi" borderless
                  label="Produto *" :options="productOpts" option-value="id" option-label="name"
                  emit-value map-options use-input input-debounce="300"
                  @filter="filterProds"
                  :rules="[v => !!v || 'Obrigatório']" lazy-rules popup-content-class="fi-popup" />
              </div>
              <div class="col-7">
                <q-select v-model="fAjuste.locationId" class="fi" borderless
                  label="Departamento *" :options="locations"
                  option-value="id" option-label="name" emit-value map-options
                  :rules="[v => !!v || 'Obrigatório']" lazy-rules popup-content-class="fi-popup" />
              </div>
              <div class="col-5">
                <q-input v-model.number="fAjuste.quantity" class="fi" borderless
                  label="Nova quantidade *" type="number" min="0" step="0.01"
                  :rules="[v => v >= 0 || 'Obrigatório']" lazy-rules />
              </div>
              <div class="col-12">
                <q-select v-model="fAjuste.reason" class="fi" borderless
                  label="Motivo *" :options="adjustReasons" option-value="value" option-label="label"
                  emit-value map-options popup-content-class="fi-popup"
                  :rules="[v => !!v || 'Obrigatório']" lazy-rules />
              </div>
              <div class="col-12">
                <q-input v-model="fAjuste.description" class="fi" borderless
                  label="Observações" type="textarea" rows="2" autogrow />
              </div>
            </div>
            <div class="dialog-footer">
              <q-btn flat no-caps label="Cancelar" @click="dialogs.ajuste = false" />
              <q-btn unelevated no-caps type="submit" label="Guardar" color="grey-7" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { showNotify } from 'src/utils/notify'
import { computed, onMounted, reactive, ref } from 'vue'
import ListaPagina from 'src/components/common/table/ListaPagina.vue'
import { usePaginacaoLocal } from 'src/composables/paginacao-local'
import { quantidade } from 'src/utils/format'

const loading  = ref(false)
const saving   = ref(false)
const filterDept = ref('')

const data      = reactive([])
const locations = reactive([])
const productOpts = reactive([])

const dialogs = reactive({ entrada: false, transferencia: false, ajuste: false })

const emptyEntrada     = () => ({ productId: null, locationId: null, quantity: null, reason: 'purchase', description: '' })
const emptyTransferencia = () => ({ productId: null, fromLocationId: null, toLocationId: null, quantity: null, description: '' })
const emptyAjuste      = () => ({ productId: null, locationId: null, quantity: null, reason: 'positive_adjustment', description: '' })

const fEntrada   = reactive(emptyEntrada())
const fTransfer  = reactive(emptyTransferencia())
const fAjuste    = reactive(emptyAjuste())

const entryReasons = [
  { label: 'Compra',          value: 'purchase' },
  { label: 'Doação',          value: 'donation' },
  { label: 'Ajuste positivo', value: 'positive_adjustment' },
]
const adjustReasons = [
  { label: 'Ajuste positivo', value: 'positive_adjustment' },
  { label: 'Ajuste negativo', value: 'negative_adjustment' },
  { label: 'Produto expirado', value: 'expiry' },
  { label: 'Perda / Quebra',   value: 'loss' },
]

const catLabels = {
  consumable:       'Consumível',
  reagent:          'Reagente',
  equipment:        'Equipamento',
  epi:              'EPI',
  glassware:        'Vidraria',
  standardSolution: 'Sol. Padrão',
}
const catLabel = (c) => catLabels[c] ?? c
const isLow = (row) =>
  row.product?.minimumStock > 0 && row.quantity <= row.product.minimumStock

// `stock/balance` devolve o saldo todo de uma vez — a paginação é local.
const { paginacao, linhas } = usePaginacaoLocal(computed(() => data), [
  (r) => r.product?.name,
  (r) => r.location?.name,
])

const contexto = computed(() => {
  const partes = []
  if (paginacao.search) partes.push(`a filtrar por \u201c${paginacao.search}\u201d`)
  const nome = locations.find((l) => l.id === filterDept.value)?.name
  if (nome) partes.push(`em ${nome}`)
  return partes.join(' \u00b7 ')
})

/** Esgotado, no mínimo, ou com folga. */
const situacao = (linha) => {
  if (Number(linha.quantity) <= 0) return 'esgotado'
  return isLow(linha) ? 'minimo' : 'ok'
}

const ROTULO = { esgotado: 'Esgotado', minimo: 'No mínimo', ok: 'Com folga' }
const TOM = { esgotado: 'erro', minimo: 'aviso', ok: 'ok' }

const colunas = [
  {
    name: 'product', label: 'Artigo',
    field: (l) => l.product?.name ?? null, align: 'left', ordenavel: true,
  },
  {
    name: 'category', label: 'Classe',
    field: (l) => (l.product?.materialCategory ? catLabel(l.product.materialCategory) : null),
    align: 'left',
  },
  {
    name: 'location', label: 'Departamento',
    field: (l) => l.location?.name ?? null, align: 'left', ordenavel: true,
  },
  {
    name: 'quantity', label: 'Saldo', field: 'quantity',
    numerico: true, ordenavel: true,
    format: (v, l) => `${quantidade(v)} ${l.product?.unit?.abbreviation ?? 'un'}`,
  },
  {
    name: 'minimumStock', label: 'Mínimo',
    field: (l) => l.product?.minimumStock ?? null, numerico: true,
    format: (v) => (v == null ? '\u2014' : quantidade(v)),
  },
  {
    name: 'estado', label: 'Estado', field: (l) => l, align: 'left', estado: true,
    format: (_, l) => ROTULO[situacao(l)],
    tom: (_, l) => TOM[situacao(l)],
  },
]

const fetchLocations = async () => {
  const { data: res } = await api.get('stock/locations')
  locations.splice(0, locations.length, ...(res.data ?? []))
}

const fetchBalance = async () => {
  loading.value = true
  try {
    const { data: res } = await api.get('stock/balance', {
      params: { locationId: filterDept.value || undefined },
    })
    data.splice(0, data.length, ...(res.data ?? []))
  } catch (_) {} finally { loading.value = false }
}

// Vinha de `products`, que filtra `type: PRODUCT` no servidor: não se podia
// dar entrada, transferir nem ajustar um consumível a partir daqui.
const filterProds = async (val, update, abort) => {
  try {
    const { data: res } = await api.get('stock/items', { params: { search: val || undefined } })
    update(() => productOpts.splice(0, productOpts.length, ...(res.data ?? [])))
  } catch { abort() }
}

const openDialog = (type) => {
  if (type === 'entrada')      Object.assign(fEntrada, emptyEntrada())
  if (type === 'transferencia') Object.assign(fTransfer, emptyTransferencia())
  if (type === 'ajuste')       Object.assign(fAjuste, emptyAjuste())
  dialogs[type] = true
}

const submitEntrada = async () => {
  saving.value = true
  try {
    const { data: res } = await api.post('stock/entries', fEntrada)
    showNotify(res.message, res.success)
    if (res.success) { dialogs.entrada = false; fetchBalance() }
  } catch (e) { showNotify(e?.response?.data?.message || "Ocorreu um erro", false) } finally { saving.value = false }
}

const submitTransferencia = async () => {
  saving.value = true
  try {
    const { data: res } = await api.post('stock/transfers', fTransfer)
    showNotify(res.message, res.success)
    if (res.success) { dialogs.transferencia = false; fetchBalance() }
  } catch (e) { showNotify(e?.response?.data?.message || "Ocorreu um erro", false) } finally { saving.value = false }
}

const submitAjuste = async () => {
  saving.value = true
  try {
    const { data: res } = await api.post('stock/adjustments', fAjuste)
    showNotify(res.message, res.success)
    if (res.success) { dialogs.ajuste = false; fetchBalance() }
  } catch (e) { showNotify(e?.response?.data?.message || "Ocorreu um erro", false) } finally { saving.value = false }
}

onMounted(() => { fetchLocations(); fetchBalance() })
</script>

<style scoped lang="scss">
.inv-actions .q-btn { border-radius: var(--r-sm); }




.inv-table thead tr {
  background: var(--surface-3);
  border-bottom: 1px solid var(--border);
}
.inv-table th {
  padding: 12px 14px; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 800;
  color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.6px;
  text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.inv-table tbody tr {
  border-bottom: 1px solid var(--surface-3);
  transition: background 0.12s;
  &:last-child { border-bottom: none; }
  &:hover { background: var(--surface-2); }
}
.inv-table td {
  padding: 14px 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* Column alignment */

/* Tinta translúcida da cor de estado: funciona sobre superfície clara e
   escura. Os literais anteriores (#fffbeb / #fff5f5) pintavam faixas quase
   brancas no tema escuro. */
.row-low  td { background: rgba(237, 137, 54, 0.12) !important; }
.row-zero td { background: rgba(197, 48, 48, 0.12) !important; }



/* Dialog */
.inv-dialog { min-width: 440px; border-radius: var(--r-panel); }
.dialog-header {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 8px;
}
.dialog-title {
  display: flex; align-items: center; gap: 8px;
  font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 600; color: var(--text);
}
.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
</style>
