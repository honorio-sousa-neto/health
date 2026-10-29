<template>
  <div class="dc-wrap">

    <div class="dc-head">
      <div class="dc-title">
        <q-icon name="las la-flask" size="16px" style="color:#805ad5" />
        Consumo de materiais
        <span v-if="linhas.length" class="dc-count">{{ linhas.length }}</span>
      </div>
      <div class="dc-sub">Declare o que foi usado para realizar este serviço — sai do inventário</div>
    </div>

    <template v-if="!readonly">
      <!-- Pesquisa -->
      <q-select
        v-model="picker"
        :options="opcoes"
        option-label="name"
        use-input input-debounce="300"
        @filter="filtrar"
        @update:model-value="adicionar"
        placeholder="Pesquisar reagente, material ou fármaco…"
        borderless dense
        class="dc-sel"
      >
        <template #prepend><q-icon name="las la-search" size="14px" color="grey-5" /></template>
        <template #append><q-icon name="las la-plus-circle" size="16px" color="purple-4" /></template>
        <template #option="scope">
          <q-item v-bind="scope.itemProps" dense>
            <q-item-section>
              <q-item-label style="font-size:var(--fs-body);font-weight:600;color:var(--text)">{{ scope.opt.name }}</q-item-label>
              <q-item-label caption style="font-size:var(--fs-label)">
                <span class="dc-type" :class="scope.opt.type === 'CONSUMABLE' ? 'dct--cons' : 'dct--prod'">
                  {{ scope.opt.type === 'CONSUMABLE' ? 'Consumível' : 'Produto' }}
                </span>
                <span :class="scope.opt.balance > 0 ? 'text-grey-6' : 'text-red'">
                  saldo {{ scope.opt.balance }} {{ scope.opt.unitLabel ?? '' }}
                </span>
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template #no-option>
          <q-item><q-item-section class="text-grey text-caption">Nenhum item encontrado</q-item-section></q-item>
        </template>
      </q-select>

      <!-- Linhas -->
      <div v-if="linhas.length" class="dc-list">
        <div v-for="(l, i) in linhas" :key="l.productId" class="dc-row">
          <div class="dc-info">
            <div class="dc-name">
              {{ l.name }}
              <span v-if="l.padrao != null && l.quantity !== l.padrao" class="dc-dev">
                {{ l.quantity > l.padrao ? '+' : '' }}{{ Number((l.quantity - l.padrao).toFixed(2)) }}
                vs padrão
              </span>
            </div>
            <div class="dc-meta">
              <span class="dc-type" :class="l.type === 'CONSUMABLE' ? 'dct--cons' : 'dct--prod'">
                {{ l.type === 'CONSUMABLE' ? 'Consumível' : 'Produto' }}
              </span>
              <span v-if="l.padrao != null" class="dc-padrao">padrão {{ l.padrao }}</span>
              <span :class="l.quantity > l.balance ? 'dc-warn' : 'text-grey-6'">
                saldo {{ l.balance }} {{ l.unitLabel ?? '' }}
              </span>
            </div>
          </div>
          <div class="dc-ctrl">
            <button class="dc-btn" @click="mudarQtd(i, -1)">−</button>
            <input type="number" v-model.number="l.quantity" min="0" step="0.01" class="dc-qty" />
            <button class="dc-btn" @click="mudarQtd(i, 1)">+</button>
          </div>
          <button class="dc-rm" @click="remover(i)" title="Remover">
            <q-icon name="las la-times" size="13px" />
          </button>
        </div>
      </div>

      <div v-if="excedidos.length" class="dc-alert">
        <q-icon name="las la-exclamation-triangle" size="14px" />
        Quantidade acima do saldo disponível: {{ excedidos.join(', ') }}. O stock ficará negativo.
      </div>

      <div v-if="linhas.length" class="dc-actions">
        <q-btn flat no-caps dense label="Limpar" color="grey-6" @click="linhas = []" />
        <q-btn
          v-if="desviouDoPadrao"
          flat no-caps dense
          icon="las la-undo"
          label="Repor padrão"
          color="deep-purple-5"
          @click="reporPadrao"
        />
        <q-btn
          unelevated no-caps dense
          icon="las la-check"
          label="Registar consumo"
          color="deep-purple-6"
          style="border-radius:var(--r-sm)"
          :loading="saving"
          @click="registar"
        />
      </div>
    </template>

  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { api } from 'src/boot/axios'
import { showNotify } from 'src/utils/notify'

const props = defineProps({
  // Serviço(s) realizados — o consumo padrão de cada um é pré-preenchido e somado
  serviceId:    { type: String,  default: null },
  serviceIds:   { type: Array,   default: () => [] },
  attendanceId: { type: String,  default: null },
  reference:    { type: String,  default: null },
  readonly:     { type: Boolean, default: false },
})
const emit = defineEmits(['saved'])

const picker      = ref(null)
const opcoes      = ref([])
const linhas      = ref([])
const saving      = ref(false)

const excedidos = computed(() =>
  linhas.value.filter((l) => l.quantity > l.balance).map((l) => l.name)
)

const desviouDoPadrao = computed(() =>
  linhas.value.some((l) => l.padrao != null && l.quantity !== l.padrao)
)

const reporPadrao = () => {
  linhas.value = linhas.value
    .filter((l) => l.padrao != null)
    .map((l) => ({ ...l, quantity: l.padrao }))
}

const filtrar = async (val, update, abort) => {
  try {
    const { data } = await api.get('stock/items', { params: { search: val || undefined } })
    update(() => { opcoes.value = data.data ?? [] })
  } catch { abort() }
}

const adicionar = (opt) => {
  if (!opt) return
  const existente = linhas.value.find((l) => l.productId === opt.id)
  if (existente) existente.quantity += 1
  else linhas.value.push({
    productId: opt.id, name: opt.name, type: opt.type,
    unitLabel: opt.unitLabel, balance: opt.balance, quantity: 1,
  })
  picker.value = null
}

const mudarQtd = (i, d) => {
  const l = linhas.value[i]
  l.quantity = Math.max(0, Number(((l.quantity || 0) + d).toFixed(2)))
}
const remover = (i) => linhas.value.splice(i, 1)

// Pré-preenche com o consumo padrão dos serviços realizados
const idsServicos = computed(() =>
  [...new Set([props.serviceId, ...(props.serviceIds ?? [])].filter(Boolean))]
)

const carregarPadrao = async () => {
  if (!idsServicos.value.length) return
  try {
    const { data } = await api.get('stock/consumables/suggest', {
      params: { serviceIds: idsServicos.value.join(',') },
    })
    const padrao = data.data ?? []
    if (!padrao.length) return
    const { data: itens } = await api.get('stock/items')
    const saldos = Object.fromEntries((itens.data ?? []).map((i) => [i.id, i.balance]))
    linhas.value = padrao.map((r) => ({
      productId: r.productId, name: r.name, type: r.type,
      unitLabel: r.unitLabel, balance: saldos[r.productId] ?? 0,
      quantity: r.quantity,
      padrao: r.quantity,   // guarda o valor padrão para sinalizar desvios
    }))
  } catch (_) {}
}

const registar = async () => {
  const items = linhas.value
    .filter((l) => l.quantity > 0)
    .map((l) => ({ productId: l.productId, quantity: l.quantity }))
  if (!items.length) { showNotify('Indique pelo menos um item com quantidade', false); return }

  saving.value = true
  try {
    await api.post('stock/consumptions/declare', {
      items,
      serviceId:    props.serviceId    || undefined,
      attendanceId: props.attendanceId || undefined,
      reference:    props.reference    || undefined,
    })
    showNotify('Consumo registado', true)
    linhas.value = []
    emit('saved')
  } catch (e) {
    showNotify(e?.response?.data?.message ?? 'Erro ao registar o consumo', false)
  } finally {
    saving.value = false
  }
}

watch(idsServicos, (novo, antigo) => {
  if (JSON.stringify(novo) !== JSON.stringify(antigo)) carregarPadrao()
})
onMounted(carregarPadrao)
</script>

<style scoped lang="scss">
.dc-wrap {
  display: flex; flex-direction: column; gap: 10px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-control); padding: 14px 16px;
}

.dc-head { display: flex; flex-direction: column; gap: 2px; }
.dc-title {
  display: flex; align-items: center; gap: 7px;
  font-size: var(--fs-body); font-weight: 700; color: var(--text);
}
.dc-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px; border-radius: var(--r-sm);
  background: #805ad5; color: #fff; font-size: var(--fs-label); font-weight: 800;
}
.dc-sub { font-size: var(--fs-label); color: var(--text-faint); margin-left: 23px; }

/* Select */
.dc-sel :deep(.q-field__control) {
  background: var(--surface-3); border-radius: var(--r-sm); border: 1.5px solid transparent;
  padding: 0 12px; min-height: 40px;
  transition: border-color .18s, background .18s;
}
.dc-sel :deep(.q-field__control:hover) { background: var(--surface-2); }
.dc-sel.q-field--focused :deep(.q-field__control) {
  border-color: var(--st-purple); background: var(--surface);
}
.dc-sel :deep(.q-field__native), .dc-sel :deep(.q-field__input) { font-size: var(--fs-body); color: var(--text); }

/* Tipo */
.dc-type {
  display: inline-block; font-size: var(--fs-label); font-weight: 700; padding: 1px 6px;
  border-radius: var(--r-sm); margin-right: 6px; text-transform: uppercase; letter-spacing: .3px;
}
.dct--cons { background: rgba(237,137,54,.12); color: var(--chip-warn); }
.dct--prod { background: rgba(66,153,225,.12); color: var(--chip-info); }

/* Lista */
.dc-list { display: flex; flex-direction: column; border: 1.5px solid var(--border); border-radius: var(--r-sm); overflow: hidden; }
.dc-row {
  display: flex; align-items: center; gap: 10px; padding: 9px 12px;
  border-bottom: 1px solid var(--border-soft); background: var(--surface);
  &:last-child { border-bottom: none; }
  &:hover { background: var(--surface-2); }
}
.dc-info { flex: 1; min-width: 0; }
.dc-name { font-size: var(--fs-label); font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dc-meta { font-size: var(--fs-label); margin-top: 2px; }
.dc-warn { color: var(--danger); font-weight: 600; }
.dc-padrao {
  color: #6b46c1; font-weight: 600; margin-right: 8px;
}
.dc-dev {
  display: inline-block; margin-left: 6px;
  font-size: var(--fs-label); font-weight: 700; padding: 1px 6px; border-radius: var(--r-sm);
  background: rgba(128,90,213,.12); color: var(--chip-purple); vertical-align: middle;
}

.dc-ctrl {
  display: flex; align-items: center; background: var(--surface-3);
  border: 1.5px solid var(--border-strong); border-radius: var(--r-sm); overflow: hidden; flex-shrink: 0;
}
.dc-btn {
  width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  font-size: var(--fs-body); font-weight: 700; color: var(--text-3); background: transparent; border: none; cursor: pointer;
  &:hover { background: #ece7f8; color: var(--text); }
}
.dc-qty {
  width: 48px; height: 26px; text-align: center; border: none; outline: none;
  background: transparent; font-size: var(--fs-label); font-weight: 700; color: var(--text);
  -moz-appearance: textfield;
  &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; }
}
.dc-rm {
  width: 24px; height: 24px; border-radius: var(--r-sm); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; cursor: pointer; color: var(--text-disabled);
  &:hover { background: rgba(229,62,62,.08); color: var(--danger); }
}

.dc-alert {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--fs-label); color: var(--chip-warn);
  background: rgba(237,137,54,.08); border: 1px solid rgba(237,137,54,.25);
  border-radius: var(--r-sm); padding: 7px 10px;
}

.dc-actions { display: flex; justify-content: flex-end; gap: 6px; }

</style>
