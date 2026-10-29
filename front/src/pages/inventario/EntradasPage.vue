<template>
  <div>
    <ListaPagina
      titulo="Entradas de stock"
      :contexto="contexto"
      apoio="Tudo o que entra nas existências — compras, ajustes e devoluções."
      :colunas="colunas"
      :linhas="data"
      :carregando="loading"
      :paginacao="pagination"
      :filtrado="!!filterLocation"
      texto-vazio="Ainda não há entradas registadas."
      @recarregar="fetchData"
    >
      <template #accoes>
        <select v-model="filterLocation" class="lp-filtro" aria-label="Filtrar por departamento" @change="fetchData">
          <option value="">Todos os departamentos</option>
          <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
        </select>

        <q-btn
          unelevated no-caps
          icon="las la-plus"
          label="Registar entrada"
          class="btn-primaria"
          @click="openCreate"
        />
      </template>

      <template #celula-product="{ linha }">
        <span>{{ linha.product?.name ?? "\u2014" }}</span>
        <span v-if="linha.product?.type" class="ent-tipo-linha">{{ TIPO[linha.product.type] }}</span>
      </template>
    </ListaPagina>

    <!-- Dialog -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: min(420px, 92vw); border-radius: var(--r-panel)">
        <q-card-section class="q-pb-sm">
          <div class="text-subtitle1 text-weight-semibold">Registar entrada de stock</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="onSubmit">
            <div class="form-section-label">Artigo</div>

            <!-- Entram produtos e consumíveis: o stock é o mesmo e o servidor
                 sempre aceitou ambos — era o selector que só oferecia um. -->
            <div class="ent-tipos" role="group" aria-label="Tipo de artigo">
              <button
                v-for="t in TIPOS_ARTIGO" :key="t.valor"
                type="button"
                class="ent-tipo"
                :class="{ 'ent-tipo--on': tipoArtigo === t.valor }"
                @click="mudarTipo(t.valor)"
              >{{ t.rotulo }}</button>
            </div>

            <q-select
              v-model="form.productId"
              :options="itemOptions"
              option-value="id" option-label="name"
              emit-value map-options use-input
              input-debounce="300"
              @filter="filtrarItens"
              class="fi" borderless label="Artigo *"
              :rules="[v => !!v || 'Obrigatório']" lazy-rules
              popup-content-class="fi-popup"
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>
                      {{ TIPO[scope.opt.type] ?? "" }} · saldo
                      <span class="num">{{ numero(scope.opt.balance) }}</span>
                      {{ scope.opt.unitLabel ?? "" }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template #no-option>
                <q-item><q-item-section class="ent-nada">Nenhum artigo encontrado</q-item-section></q-item>
              </template>
            </q-select>

            <p v-if="itemEscolhido" class="ent-escolhido">
              {{ TIPO[itemEscolhido.type] }} · saldo actual
              <span class="num">{{ numero(itemEscolhido.balance) }}</span>
              {{ itemEscolhido.unitLabel ?? "" }}
            </p>
            <div class="form-section-label q-mt-md">Destino e quantidade</div>
            <div class="row q-col-gutter-sm">
              <div class="col-7">
                <q-select v-model="form.locationId" :options="locations"
                  option-value="id" option-label="name"
                  emit-value map-options
                  class="fi" borderless label="Departamento *"
                  :rules="[v => !!v || 'Obrigatório']" lazy-rules
                  popup-content-class="fi-popup" />
              </div>
              <div class="col-5">
                <q-input v-model.number="form.quantity" class="fi" borderless
                  type="number" min="0.01" step="0.01" label="Quantidade *"
                  :rules="[v => v > 0 || 'Obrigatório']" lazy-rules>
                  <template v-if="itemEscolhido?.unitLabel" #append>
                    <span class="fi-sufixo">{{ itemEscolhido.unitLabel }}</span>
                  </template>
                </q-input>
              </div>
            </div>
            <q-select v-model="form.reason" :options="entryReasonOptions"
              option-value="value" option-label="label"
              emit-value map-options
              class="fi q-mt-sm" borderless label="Motivo *"
              :rules="[v => !!v || 'Obrigatório']" lazy-rules
              popup-content-class="fi-popup" />
            <q-input v-model="form.description" class="fi q-mt-sm" borderless
              label="Observações" type="textarea" rows="2" autogrow />
            <div class="form-actions q-mt-md">
              <q-btn flat no-caps label="Cancelar" @click="dialog = false" />
              <q-btn unelevated no-caps type="submit" label="Guardar" color="primary" :loading="saving" />
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

const loading = ref(false)
const saving  = ref(false)
const dialog  = ref(false)
const data    = reactive([])
const locations   = reactive([])
const itemOptions = reactive([])
const filterLocation = ref('')
const tipoArtigo = ref('')

const TIPO = { PRODUCT: 'Produto', CONSUMABLE: 'Consumível', SERVICE: 'Serviço' }
const TIPOS_ARTIGO = [
  { valor: '',           rotulo: 'Todos' },
  { valor: 'PRODUCT',    rotulo: 'Produtos' },
  { valor: 'CONSUMABLE', rotulo: 'Consumíveis' },
]

const numero = (v) =>
  new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 3 }).format(Number(v ?? 0))

const itemEscolhido = computed(() =>
  itemOptions.find((i) => i.id === form.productId) ?? null)
const pagination = reactive({ page: 1, perPage: 20, total: 0, totalPages: 1 })

const entryReasonOptions = [
  { label: 'Compra', value: 'purchase' },
  { label: 'Doação', value: 'donation' },
  { label: 'Ajuste positivo', value: 'positive_adjustment' },
]

const emptyForm = () => ({ productId: null, locationId: null, quantity: null, reason: 'purchase', description: '' })
const form = reactive(emptyForm())

const fetchLocations = async () => {
  const { data: res } = await api.get('stock/locations')
  locations.splice(0, locations.length, ...(res.data ?? []))
}

/**
 * Os artigos vêm de `stock/items`, que devolve produtos e consumíveis com o
 * saldo já calculado. O selector lia de `products`, que filtra
 * `type: PRODUCT` no servidor — era aí que os consumíveis ficavam de fora.
 */
const carregarItens = async (search) => {
  const { data: res } = await api.get('stock/items', {
    params: { search: search || undefined, type: tipoArtigo.value || undefined },
  })
  itemOptions.splice(0, itemOptions.length, ...(res.data ?? []))
}

const filtrarItens = async (val, update, abort) => {
  try {
    const { data: res } = await api.get('stock/items', {
      params: { search: val || undefined, type: tipoArtigo.value || undefined },
    })
    update(() => { itemOptions.splice(0, itemOptions.length, ...(res.data ?? [])) })
  } catch { abort() }
}

/** Mudar de tipo limpa a escolha: o artigo seleccionado pode não estar na
    lista nova, e um id invisível no formulário é um engano à espera. */
const mudarTipo = (valor) => {
  tipoArtigo.value = valor
  form.productId = null
  carregarItens('')
}

const fetchData = async () => {
  loading.value = true
  try {
    const { data: res } = await api.get('stock/entries', {
      params: { page: pagination.page, perPage: pagination.perPage, locationId: filterLocation.value || undefined },
    })
    data.splice(0, data.length, ...(res.data ?? []))
    Object.assign(pagination, { total: res.meta?.total ?? 0, totalPages: res.meta?.totalPages ?? 1 })
  } catch (_) {} finally { loading.value = false }
}

const openCreate = () => {
  Object.assign(form, emptyForm())
  tipoArtigo.value = ''
  carregarItens('')
  dialog.value = true
}

const onSubmit = async () => {
  saving.value = true
  try {
    const { data: res } = await api.post('stock/entries', form)
    showNotify(res.message, res.success)
    dialog.value = false
    fetchData()
  } catch (e) { showNotify(e?.response?.data?.message || "Ocorreu um erro", false) } finally { saving.value = false }
}

const goPage = (p) => { pagination.page = p; fetchData() }

const reasonLabel = (r) =>
  ({ purchase: 'Compra', donation: 'Doação', positive_adjustment: 'Ajuste manual' })[r] ?? r ?? '—'
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('pt-PT') : '—')

const contexto = computed(() => {
  const nome = locations.find((l) => l.id === filterLocation.value)?.name
  return nome ? `em ${nome}` : ''
})

const colunas = [
  { name: 'product', label: 'Artigo', field: (l) => l.product?.name ?? null, align: 'left' },
  {
    name: 'location', label: 'Departamento',
    field: (l) => l.toLocation?.name ?? null, align: 'left',
  },
  {
    name: 'reason', label: 'Motivo', field: 'reason', align: 'left', estado: true,
    format: (v) => reasonLabel(v),
    // Uma compra é a entrada normal; um ajuste manual é a que merece ser
    // notada, porque não tem documento por trás.
    tom: (v) => (v === 'positive_adjustment' ? 'aviso' : 'neutro'),
  },
  {
    name: 'quantity', label: 'Quantidade', field: 'quantity', numerico: true,
    format: (v, l) => `${numero(v)} ${l.product?.unit?.abbreviation ?? 'un'}`,
  },
  { name: 'user', label: 'Responsável', field: (l) => l.user?.name ?? null, align: 'left' },
  { name: 'createdAt', label: 'Data', field: 'createdAt', align: 'left', format: (v) => fmtDate(v) },
]

onMounted(() => { fetchLocations(); fetchData() })
</script>

<style scoped lang="scss">
.form-section-label { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight:700; color:var(--text-3); letter-spacing:0.6px; text-transform:uppercase; margin-bottom:8px; padding-bottom:5px; border-bottom:1px solid var(--border); }

/* Tipo de artigo: três alternativas exclusivas, marcadas por régua e peso. */
.ent-tipos { display:flex; gap:2px; margin-bottom:10px; border-bottom:1px solid var(--border); }
.ent-tipo {
  border:none; background:none; cursor:pointer;
  padding:6px 12px; margin-bottom:-1px;
  border-bottom:2px solid transparent;
  font-family:inherit; font-size: var(--fs-label); font-weight: var(--fw-medio);
  color: var(--text-muted);
  &:hover { color: var(--text-2); }
}
.ent-tipo--on { color: var(--text); font-weight: var(--fw-semi); border-bottom-color: var(--accent); }

.ent-nada { font-size: var(--fs-label); color: var(--text-muted); }

/* O saldo do artigo escolhido, para se saber ao que se está a somar. */
.ent-escolhido {
  margin: 6px 0 0;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  color: var(--text-muted);
}

.ent-tipo-linha {
  margin-left: 8px;
  font-size: var(--fs-label); font-weight: var(--fw-regular);
  color: var(--text-muted);
}

.form-actions { display:flex; justify-content:flex-end; gap:8px; }
</style>
