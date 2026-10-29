<template>
  <div>
    <ListaPagina
      titulo="Saídas por consumo"
      :contexto="contexto"
      apoio="O que sai das existências por uso interno. As saídas por venda ficam no histórico de movimentos."
      :colunas="colunas"
      :linhas="data"
      :carregando="loading"
      :paginacao="pagination"
      :filtrado="!!filterLocation"
      texto-vazio="Ainda não há consumos registados."
      @recarregar="fetchData"
    >
      <template #accoes>
        <select v-model="filterLocation" class="lp-filtro" aria-label="Filtrar por departamento" @change="fetchData">
          <option value="">Todos os departamentos</option>
          <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
        </select>

        <q-btn
          unelevated no-caps
          icon="las la-minus-circle"
          label="Registar consumo"
          class="btn-primaria"
          @click="openCreate"
        />
      </template>
    </ListaPagina>

    <q-dialog v-model="dialog" persistent>
      <q-card class="cs-cartao">
        <q-card-section class="q-pb-none">
          <div class="cs-titulo">Registar consumo</div>
          <p class="cs-sub">Saída de existências por uso interno. Sai do departamento indicado.</p>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="onSubmit">

            <!-- O departamento vem primeiro: é dele que sai, e é o saldo
                 dele que o servidor exige para deixar sair. -->
            <q-select
              v-model="form.locationId"
              :options="locations"
              option-value="id" option-label="name"
              emit-value map-options
              class="fi" borderless
              label="Sai de *"
              hint="Departamento de onde o material é retirado."
              :rules="[v => !!v || 'Obrigatório']" lazy-rules
              popup-content-class="fi-popup"
              @update:model-value="carregarSaldos"
            />

            <q-select
              v-model="form.productId"
              :options="opcoesArtigo"
              option-value="id" :option-label="o => o?.name ?? ''"
              emit-value map-options
              use-input input-debounce="300"
              class="fi q-mt-md" borderless
              label="Artigo *"
              :loading="aProcurar"
              :rules="[v => !!v || 'Obrigatório']" lazy-rules
              popup-content-class="fi-popup"
              @filter="procurarArtigos"
              @update:model-value="aoEscolherArtigo"
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps" dense>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>
                      {{ TIPO[scope.opt.type] ?? 'Artigo' }} · conta-se em
                      {{ scope.opt.unitLabel ?? 'un' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template #no-option>
                <q-item><q-item-section class="cs-nada">Nenhum artigo encontrado</q-item-section></q-item>
              </template>
            </q-select>

            <div class="row q-col-gutter-sm q-mt-md">
              <div class="col-6">
                <q-input
                  v-model.number="form.quantity"
                  class="fi" borderless
                  type="number" min="0" step="0.001" inputmode="decimal"
                  label="Quantidade *"
                  :rules="[v => v > 0 || 'Obrigatório']" lazy-rules
                />
              </div>
              <div class="col-6">
                <!-- Só as unidades da família de conversão do artigo. Um item
                     contado em mL aceita L e garrafa; não aceita "cx", porque
                     não há factor entre as duas e a baixa sairia errada. -->
                <q-select
                  v-model="form.unitId"
                  :options="familia"
                  option-value="id"
                  :option-label="u => `${u.abbreviation} · ${u.name}`"
                  emit-value map-options
                  class="fi" borderless
                  label="Unidade"
                  :disable="familia.length < 2"
                  :hint="familia.length < 2 ? 'Este artigo só tem uma unidade.' : 'Em que unidade está a contar.'"
                  popup-content-class="fi-popup"
                />
              </div>
            </div>

            <!-- O que realmente sai, na unidade em que o stock conta o artigo.
                 Sem isto, escrever "1" com a garrafa em mente num item contado
                 em mililitros dava baixa de 1 mL. -->
            <div v-if="artigo" class="cs-efeito">
              <div class="cs-efeito__linha">
                <span class="cs-efeito__rotulo">Sai do stock</span>
                <span class="cs-efeito__valor">
                  <span class="num">{{ numero(emUnidadeDoItem) }}</span> {{ unidadeItemRotulo }}
                </span>
              </div>
              <div class="cs-efeito__linha">
                <span class="cs-efeito__rotulo">Saldo no departamento</span>
                <span class="cs-efeito__valor">
                  <span class="num">{{ numero(saldoDoArtigo) }}</span> {{ unidadeItemRotulo }}
                </span>
              </div>
            </div>

            <div v-if="excede" class="aviso q-mt-md">
              <q-icon class="aviso__icone" name="las la-exclamation-circle" size="18px" />
              <div class="aviso__corpo">
                <div class="aviso__titulo">Não há saldo suficiente</div>
                <div>
                  O departamento tem {{ numero(saldoDoArtigo) }} {{ unidadeItemRotulo }}
                  e esta saída são {{ numero(emUnidadeDoItem) }} {{ unidadeItemRotulo }}.
                  O registo vai ser recusado.
                </div>
              </div>
            </div>

            <q-input
              v-model="form.description"
              class="fi q-mt-md" borderless
              label="Observações"
              hint="Para que foi usado, ou a que corresponde esta saída."
              type="textarea" rows="2" autogrow
            />

            <div class="form-actions q-mt-md">
              <q-btn flat no-caps label="Cancelar" class="btn-icone" @click="dialog = false" />
              <q-btn
                unelevated no-caps type="submit"
                label="Registar consumo"
                class="btn-primaria"
                :loading="saving"
                :disable="excede"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
/**
 * Saídas de existências por consumo interno.
 *
 * ── A unidade ────────────────────────────────────────────────────────────
 *
 * O campo de quantidade não dizia em quê. Quem retira uma garrafa de álcool
 * de um artigo contado em mililitros escrevia "1" — e dava baixa de 1 mL.
 * Passa a haver unidade, escolhida de entre as da família de conversão do
 * artigo, e uma linha que mostra o que sai mesmo, na unidade em que o stock
 * o conta. É o mesmo mecanismo do consumo padrão e das linhas de compra.
 *
 * ── O artigo ─────────────────────────────────────────────────────────────
 *
 * Vinha de `products`, que filtra `type: PRODUCT` no servidor. Metade do que
 * se consome numa clínica — álcool, compressas, reagentes — é `CONSUMABLE` e
 * não aparecia aqui. Passa a `stock/items`, que devolve os dois tipos.
 */
import { api } from 'src/boot/axios'
import { showNotify } from 'src/utils/notify'
import { computed, onMounted, reactive, ref } from 'vue'
import ListaPagina from 'src/components/common/table/ListaPagina.vue'
import { useUnitOfMeasureStore } from 'src/stores/unit-of-measure'
import { quantidade as numero } from 'src/utils/format'

const TIPO = { PRODUCT: 'Produto', SERVICE: 'Serviço', CONSUMABLE: 'Consumível' }

const loading = ref(false)
const saving  = ref(false)
const dialog  = ref(false)
const data    = reactive([])
const locations = reactive([])
const filterLocation = ref('')
const pagination = reactive({ page: 1, perPage: 20, total: 0, totalPages: 1 })

const unidades = useUnitOfMeasureStore()

const opcoesArtigo = ref([])
const aProcurar = ref(false)
const artigo = ref(null)
const saldos = ref({})

const emptyForm = () => ({
  productId: null, locationId: null, unitId: null,
  quantity: null, attendanceId: '', description: '',
})
const form = reactive(emptyForm())

const contexto = computed(() => {
  const nome = locations.find((l) => l.id === filterLocation.value)?.name
  return nome ? `em ${nome}` : ''
})

const colunas = [
  {
    name: 'product', label: 'Artigo',
    field: (linha) => linha.product?.name ?? null, align: 'left',
  },
  {
    name: 'location', label: 'Departamento',
    field: (linha) => linha.fromLocation?.name ?? null, align: 'left',
  },
  {
    name: 'quantity', label: 'Quantidade', field: 'quantity',
    numerico: true,
    format: (v, linha) => `${numero(v)} ${linha.product?.unit?.abbreviation ?? 'un'}`,
  },
  { name: 'description', label: 'Observações', field: 'description', align: 'left' },
  {
    name: 'user', label: 'Responsável',
    field: (linha) => linha.user?.name ?? null, align: 'left',
  },
  {
    name: 'createdAt', label: 'Data', field: 'createdAt', align: 'left',
    format: (v) => fmtDate(v),
  },
]

// ── Unidades ─────────────────────────────────────────────────────────────

const porAbreviatura = (ab) =>
  ab ? unidades.units.find((u) => u.abbreviation === ab) ?? null : null

const familiaDe = (u) => (u ? u.baseUnitId ?? u.id : null)

const unidadeItem = computed(() => porAbreviatura(artigo.value?.unitLabel))
const unidadeItemRotulo = computed(() => artigo.value?.unitLabel ?? 'un')

/** A família de conversão da unidade do artigo: ela e todas com a mesma base. */
const familia = computed(() => {
  const base = unidadeItem.value
  if (!base) return []
  const id = familiaDe(base)
  const membros = unidades.units.filter((u) => familiaDe(u) === id)
  return membros.length ? membros : [base]
})

/** A quantidade na unidade em que o stock conta o artigo — o que sai mesmo. */
const emUnidadeDoItem = computed(() => {
  const escolhida = unidades.units.find((u) => u.id === form.unitId)
  const item = unidadeItem.value
  const q = Number(form.quantity ?? 0)
  if (!escolhida || !item || !Number(item.factor)) return q
  return (q * Number(escolhida.factor)) / Number(item.factor)
})

const saldoDoArtigo = computed(() => Number(saldos.value[form.productId] ?? 0))

const excede = computed(
  () => Boolean(artigo.value) && emUnidadeDoItem.value > saldoDoArtigo.value,
)

// ── Dados ────────────────────────────────────────────────────────────────

const fetchLocations = async () => {
  const { data: res } = await api.get('stock/locations')
  locations.splice(0, locations.length, ...(res.data ?? []))
}

/**
 * O saldo do departamento escolhido, por artigo. O servidor recusa a saída
 * quando não chega (`enforceAvailability`), por isso o número tem de estar à
 * vista antes de se carregar em registar, e não na mensagem de erro.
 */
const carregarSaldos = async () => {
  saldos.value = {}
  if (!form.locationId) return
  try {
    const { data: res } = await api.get('stock/balance', {
      params: { locationId: form.locationId },
    })
    saldos.value = Object.fromEntries(
      (res.data ?? []).map((r) => [r.productId, Number(r.quantity ?? 0)]),
    )
  } catch (_) {}
}

const procurarArtigos = async (val, update, abort) => {
  aProcurar.value = true
  try {
    const { data: res } = await api.get('stock/items', {
      params: { search: val || undefined },
    })
    update(() => { opcoesArtigo.value = res.data ?? [] })
  } catch {
    abort()
  } finally {
    aProcurar.value = false
  }
}

const aoEscolherArtigo = (id) => {
  artigo.value = opcoesArtigo.value.find((o) => o.id === id) ?? null
  form.unitId = unidadeItem.value?.id ?? null
}

const fetchData = async () => {
  loading.value = true
  try {
    const { data: res } = await api.get('stock/consumptions', {
      params: {
        page: pagination.page,
        perPage: pagination.perPage,
        locationId: filterLocation.value || undefined,
      },
    })
    data.splice(0, data.length, ...(res.data ?? []))
    Object.assign(pagination, {
      total: res.meta?.total ?? 0,
      totalPages: res.meta?.totalPages ?? 1,
    })
  } catch (_) {} finally { loading.value = false }
}

const openCreate = () => {
  Object.assign(form, emptyForm())
  artigo.value = null
  saldos.value = {}
  // O departamento do filtro é quase sempre aquele de onde se vai retirar.
  if (filterLocation.value) {
    form.locationId = filterLocation.value
    carregarSaldos()
  }
  dialog.value = true
}

const onSubmit = async () => {
  if (excede.value) return
  saving.value = true
  try {
    // O que vai para o servidor é sempre a quantidade convertida: o ledger
    // conta na unidade do artigo e o FEFO dá baixa nessa unidade.
    const payload = {
      productId: form.productId,
      locationId: form.locationId,
      quantity: emUnidadeDoItem.value,
      description: form.description || undefined,
    }
    const { data: res } = await api.post('stock/consumptions', payload)
    showNotify(res.message, res.success)
    dialog.value = false
    fetchData()
  } catch (e) {
    showNotify(e?.response?.data?.message || 'Ocorreu um erro', false)
  } finally {
    saving.value = false
  }
}

const goPage = (p) => { pagination.page = p; fetchData() }
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('pt-PT') : '—')

onMounted(async () => {
  if (!unidades.units.length) unidades.index()
  fetchLocations()
  fetchData()
})
</script>

<style scoped lang="scss">

.cs-titulo {
  font-size: var(--fs-title);
  line-height: var(--lh-tight);
  font-weight: var(--fw-semi);
  color: var(--text);
}

.cs-sub {
  margin: var(--sp-2) 0 0;
  font-size: var(--fs-label);
  line-height: var(--lh-body);
  color: var(--text-muted);
}

.cs-nada { font-size: var(--fs-label); color: var(--text-muted); }

/* O efeito da saída, antes de acontecer: o que sai e o que há. */
.cs-efeito {
  margin-top: var(--sp-4);
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--border);
  border-radius: var(--r-control);
  background: var(--surface-2);
}

.cs-efeito__linha {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--sp-4);

  & + & { margin-top: 4px; }
}

.cs-efeito__rotulo {
  font-size: var(--fs-label);
  font-weight: var(--fw-forte);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--text-3);
}

.cs-efeito__valor {
  font-size: var(--fs-body);
  font-weight: var(--fw-semi);
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

/* A unidade ao lado da quantidade, na listagem. */
.cs-un {
  margin-left: 3px;
  font-size: var(--fs-label);
  font-weight: var(--fw-regular);
  color: var(--text-muted);
}
</style>
