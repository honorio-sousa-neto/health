<template>
  <div>
    <ListaPagina
      titulo="Transferências"
      :contexto="contexto"
      apoio="Movimentos entre departamentos. Não alteram o total em stock, só onde ele está."
      :colunas="colunas"
      :linhas="data"
      :carregando="loading"
      :paginacao="pagination"
      texto-vazio="Ainda não há transferências registadas."
      @recarregar="fetchData"
    >
      <template #accoes>
        <q-btn
          unelevated no-caps
          icon="las la-exchange-alt"
          label="Nova transferência"
          class="btn-primaria"
          @click="openCreate"
        />
      </template>

      <template #celula-product="{ linha }">
        <span>{{ linha.product?.name ?? "—" }}</span>
        <span v-if="linha.product?.type" class="tr-tipo-linha">{{ TIPO[linha.product.type] }}</span>
      </template>

      <template #celula-percurso="{ linha }">
        <span class="tr-percurso">
          {{ linha.fromLocation?.name ?? "—" }}
          <q-icon name="las la-arrow-right" size="13px" />
          {{ linha.toLocation?.name ?? "—" }}
        </span>
      </template>
    </ListaPagina>

    <q-dialog v-model="dialog" persistent>
      <q-card class="tr-cartao">
        <q-card-section class="q-pb-none">
          <div class="tr-titulo">Nova transferência de stock</div>
          <p class="tr-sub">Um ou vários artigos, no mesmo percurso. Ou seguem todos, ou não segue nenhum.</p>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="onSubmit">
            <!-- A origem vem primeiro: é o saldo dela que o servidor exige
                 para deixar sair, e é ele que se mostra em cada linha. -->
            <div class="form-section-label">Origem → Destino</div>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-select v-model="form.fromLocationId" :options="locations"
                  option-value="id" option-label="name" emit-value map-options
                  class="fi" borderless label="Origem *"
                  :rules="[v => !!v || 'Obrigatório']" lazy-rules
                  popup-content-class="fi-popup"
                  @update:model-value="aoEscolherOrigem" />
              </div>
              <div class="col-6">
                <!-- Sem a origem na lista: o servidor recusa origem igual ao
                     destino, e não vale a pena oferecer o que vai ser negado. -->
                <q-select v-model="form.toLocationId" :options="destinos"
                  option-value="id" option-label="name" emit-value map-options
                  class="fi" borderless label="Destino *"
                  :rules="[v => !!v || 'Obrigatório']" lazy-rules
                  popup-content-class="fi-popup" />
              </div>
            </div>

            <div class="form-section-label q-mt-md">
              Artigos
              <span v-if="linhas.length > 1" class="tr-contagem">{{ linhas.length }} linhas</span>
            </div>

            <!-- Transferem-se produtos e consumíveis: o stock é o mesmo e o
                 servidor sempre aceitou ambos. Os separadores só afinam o que
                 a procura oferece a seguir — não mexem no que já foi escolhido. -->
            <div class="tr-tipos" role="group" aria-label="Tipo de artigo a procurar">
              <button
                v-for="t in TIPOS_ARTIGO" :key="t.valor"
                type="button"
                class="tr-tipo"
                :class="{ 'tr-tipo--on': tipoArtigo === t.valor }"
                @click="mudarTipo(t.valor)"
              >{{ t.rotulo }}</button>
            </div>

            <div v-for="(linha, i) in linhas" :key="linha.chave" class="tr-linha">
              <div class="tr-linha__campos">
                <q-select
                  v-model="linha.productId"
                  :options="opcoesDaLinha(linha)"
                  option-value="id" :option-label="o => o?.name ?? ''"
                  emit-value map-options use-input
                  input-debounce="300"
                  :loading="linha.aProcurar"
                  @filter="(val, update, abort) => filtrarItens(linha, val, update, abort)"
                  @update:model-value="(id) => aoEscolherArtigo(linha, id)"
                  class="fi tr-linha__artigo" borderless label="Artigo *"
                  :rules="[v => !!v || 'Obrigatório']" lazy-rules
                  popup-content-class="fi-popup"
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
                    <q-item><q-item-section class="tr-nada">Nenhum artigo encontrado</q-item-section></q-item>
                  </template>
                </q-select>

                <q-input v-model.number="linha.quantity" class="fi tr-linha__qtd" borderless
                  type="number" min="0.01" step="0.01" inputmode="decimal" label="Quantidade *"
                  :rules="[v => v > 0 || 'Obrigatório']" lazy-rules>
                  <template v-if="linha.artigo?.unitLabel" #append>
                    <span class="fi-sufixo">{{ linha.artigo.unitLabel }}</span>
                  </template>
                </q-input>

                <q-btn
                  flat dense round
                  icon="las la-times"
                  class="tr-linha__remover"
                  :disable="linhas.length === 1"
                  :aria-label="`Remover linha ${i + 1}`"
                  @click="removerLinha(i)"
                />
              </div>

              <!-- O que há mesmo na origem, antes de se tentar. Sem isto, só se
                   descobria que não havia saldo depois de o registo ser recusado. -->
              <p v-if="linha.artigo && form.fromLocationId" class="tr-saldo"
                 :class="{ 'tr-saldo--curto': excedeLinha(linha) }">
                Saldo na origem
                <span class="num">{{ numero(saldoNaOrigem(linha)) }}</span>
                {{ linha.artigo.unitLabel ?? 'un' }}
                <template v-if="excedeLinha(linha)">
                  — não chega para {{ numero(linha.quantity) }}
                </template>
              </p>
            </div>

            <q-btn
              flat no-caps dense
              icon="las la-plus"
              label="Adicionar artigo"
              class="tr-adicionar"
              @click="adicionarLinha"
            />

            <div v-if="algumaExcede" class="aviso q-mt-md">
              <q-icon class="aviso__icone" name="las la-exclamation-circle" size="18px" />
              <div class="aviso__corpo">
                <div class="aviso__titulo">Não há saldo suficiente na origem</div>
                <div>
                  {{ excedidas.length === 1 ? 'Um artigo pede' : `${excedidas.length} artigos pedem` }}
                  mais do que a origem tem. Como a transferência segue inteira ou não segue,
                  o registo vai ser recusado por completo.
                </div>
              </div>
            </div>

            <q-input v-model="form.description" class="fi q-mt-md" borderless
              label="Observações"
              hint="Fica em todas as linhas desta transferência."
              type="textarea" rows="2" autogrow />

            <div class="form-actions q-mt-md">
              <q-btn flat no-caps label="Cancelar" @click="dialog = false" />
              <q-btn unelevated no-caps type="submit" color="primary"
                :label="linhas.length > 1 ? `Transferir ${linhas.length} artigos` : 'Transferir'"
                :loading="saving" :disable="algumaExcede" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
/**
 * Transferências de stock entre departamentos.
 *
 * ── O artigo ─────────────────────────────────────────────────────────────
 *
 * O selector lia de `products`, que filtra `type: PRODUCT` no servidor.
 * Metade do que se move numa clínica — álcool, compressas, reagentes — é
 * `CONSUMABLE` e nunca aparecia na lista, pelo que não havia forma de o
 * transferir. Passa a `stock/items`, que devolve os dois tipos com o saldo
 * e a unidade, como já fazem as entradas e os consumos.
 *
 * ── Várias linhas ────────────────────────────────────────────────────────
 *
 * Quem move stock raramente move um artigo só: leva uma caixa de material
 * da farmácia para a enfermaria. O formulário passa a aceitar várias linhas
 * no mesmo percurso, enviadas em `items` e gravadas numa só transação no
 * servidor — ou seguem todas, ou não segue nenhuma.
 */
import { api } from 'src/boot/axios'
import { showNotify } from 'src/utils/notify'
import { computed, onMounted, reactive, ref } from 'vue'
import ListaPagina from 'src/components/common/table/ListaPagina.vue'
import { quantidade as numero } from 'src/utils/format'

const TIPO = { PRODUCT: 'Produto', CONSUMABLE: 'Consumível', SERVICE: 'Serviço' }
const TIPOS_ARTIGO = [
  { valor: '',           rotulo: 'Todos' },
  { valor: 'PRODUCT',    rotulo: 'Produtos' },
  { valor: 'CONSUMABLE', rotulo: 'Consumíveis' },
]

const loading = ref(false)
const saving  = ref(false)
const dialog  = ref(false)
const data    = reactive([])
const locations = reactive([])
const tipoArtigo = ref('')
const saldos = ref({})
const pagination = reactive({ page: 1, perPage: 20, total: 0, totalPages: 1 })

/** Última lista pedida ao servidor. Serve de ponto de partida a cada linha
    nova, para o selector abrir já preenchido em vez de vazio. */
const catalogo = ref([])

let proximaChave = 0
const novaLinha = () => ({
  chave: proximaChave++,
  productId: null,
  quantity: null,
  artigo: null,
  opcoes: [...catalogo.value],
  aProcurar: false,
})

const linhas = reactive([novaLinha()])

const emptyForm = () => ({ fromLocationId: null, toLocationId: null, description: '' })
const form = reactive(emptyForm())

const destinos = computed(() => locations.filter((l) => l.id !== form.fromLocationId))

const saldoNaOrigem = (linha) => Number(saldos.value[linha.productId] ?? 0)

const excedeLinha = (linha) =>
  !!linha.artigo && !!form.fromLocationId && Number(linha.quantity) > saldoNaOrigem(linha)

const excedidas = computed(() => linhas.filter(excedeLinha))
const algumaExcede = computed(() => excedidas.value.length > 0)

/** O mesmo artigo em duas linhas seria somado contra o mesmo saldo — um
    engano fácil de cometer e difícil de ver. Não se oferece o que já está. */
const opcoesDaLinha = (linha) => {
  const jaEscolhidos = new Set(
    linhas.filter((l) => l !== linha && l.productId).map((l) => l.productId))
  return linha.opcoes.filter((o) => !jaEscolhidos.has(o.id))
}

const adicionarLinha = () => { linhas.push(novaLinha()) }

const removerLinha = (i) => {
  if (linhas.length === 1) return
  linhas.splice(i, 1)
}

const fetchLocations = async () => {
  const { data: res } = await api.get('stock/locations')
  locations.splice(0, locations.length, ...(res.data ?? []))
}

const pedirItens = async (search) => {
  const { data: res } = await api.get('stock/items', {
    params: { search: search || undefined, type: tipoArtigo.value || undefined },
  })
  return res.data ?? []
}

const carregarCatalogo = async () => {
  try {
    catalogo.value = await pedirItens('')
    // As linhas ainda sem escolha acompanham o catálogo novo; as que já têm
    // artigo ficam como estão, para o separador não desfazer trabalho feito.
    linhas.forEach((l) => { if (!l.productId) l.opcoes = [...catalogo.value] })
  } catch (_) {}
}

const filtrarItens = async (linha, val, update, abort) => {
  linha.aProcurar = true
  try {
    const encontrados = await pedirItens(val)
    update(() => {
      // O artigo já escolhido fica sempre na lista: fora dela, `map-options`
      // deixaria de saber o nome e o campo mostrava um id em bruto.
      const falta = linha.artigo && !encontrados.some((o) => o.id === linha.artigo.id)
      linha.opcoes = falta ? [linha.artigo, ...encontrados] : encontrados
    })
  } catch {
    abort()
  } finally { linha.aProcurar = false }
}

/** Mudar de separador muda o que a procura oferece daqui para a frente. */
const mudarTipo = (valor) => {
  tipoArtigo.value = valor
  carregarCatalogo()
}

const aoEscolherArtigo = (linha, id) => {
  linha.artigo = linha.opcoes.find((o) => o.id === id) ?? null
}

/** O saldo é por departamento: muda a origem, muda o que há disponível.
    O destino, esse, não pode ser o mesmo — limpa-se se acabou de o ser. */
const aoEscolherOrigem = (id) => {
  if (form.toLocationId === id) form.toLocationId = null
  carregarSaldos()
}

const carregarSaldos = async () => {
  saldos.value = {}
  if (!form.fromLocationId) return
  try {
    const { data: res } = await api.get('stock/balance', {
      params: { locationId: form.fromLocationId },
    })
    saldos.value = Object.fromEntries(
      (res.data ?? []).map((r) => [r.productId, Number(r.quantity ?? 0)]),
    )
  } catch (_) {}
}

const fetchData = async () => {
  loading.value = true
  try {
    const { data: res } = await api.get('stock/transfers', {
      params: { page: pagination.page, perPage: pagination.perPage },
    })
    data.splice(0, data.length, ...(res.data ?? []))
    Object.assign(pagination, { total: res.meta?.total ?? 0, totalPages: res.meta?.totalPages ?? 1 })
  } catch (_) {} finally { loading.value = false }
}

const openCreate = () => {
  Object.assign(form, emptyForm())
  tipoArtigo.value = ''
  saldos.value = {}
  catalogo.value = []
  linhas.splice(0, linhas.length, novaLinha())
  carregarCatalogo()
  dialog.value = true
}

const onSubmit = async () => {
  saving.value = true
  try {
    const { data: res } = await api.post('stock/transfers', {
      fromLocationId: form.fromLocationId,
      toLocationId:   form.toLocationId,
      description:    form.description,
      items: linhas.map((l) => ({ productId: l.productId, quantity: Number(l.quantity) })),
    })
    showNotify(res.message, res.success)
    dialog.value = false
    fetchData()
  } catch (e) { showNotify(e?.response?.data?.message || "Ocorreu um erro", false) } finally { saving.value = false }
}

const goPage = (p) => { pagination.page = p; fetchData() }
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-PT') : '—'

const contexto = computed(() => "")

const colunas = [
  { name: 'product', label: 'Artigo', field: (l) => l.product?.name ?? null, align: 'left' },
  { name: 'percurso', label: 'De → Para', field: () => null, align: 'left' },
  {
    name: 'quantity', label: 'Quantidade', field: 'quantity', numerico: true,
    format: (v, l) => `${v} ${l.product?.unit?.abbreviation ?? 'un'}`,
  },
  { name: 'description', label: 'Motivo', field: 'description', align: 'left' },
  { name: 'user', label: 'Responsável', field: (l) => l.user?.name ?? null, align: 'left' },
  { name: 'createdAt', label: 'Data', field: 'createdAt', align: 'left', format: (v) => fmtDate(v) },
]

onMounted(() => { fetchLocations(); fetchData() })
</script>

<style scoped lang="scss">
.tr-cartao { min-width: min(560px, 94vw); border-radius: var(--r-panel); }

.tr-titulo {
  font-size: var(--fs-title);
  line-height: var(--lh-tight);
  font-weight: var(--fw-semi);
  color: var(--text);
}

.tr-sub {
  margin: var(--sp-2) 0 0;
  font-size: var(--fs-label);
  line-height: var(--lh-body);
  color: var(--text-muted);
}

.form-section-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--sp-3);
  font-size: var(--fs-label);
  line-height: var(--lh-tight);
  font-weight: var(--fw-forte);
  color: var(--text-3);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--border);
}

.tr-contagem {
  font-weight: var(--fw-regular);
  letter-spacing: 0;
  text-transform: none;
  color: var(--text-muted);
}

/* Tipo de artigo: três alternativas exclusivas, marcadas por régua e peso. */
.tr-tipos { display: flex; gap: 2px; margin-bottom: 10px; border-bottom: 1px solid var(--border); }
.tr-tipo {
  border: none; background: none; cursor: pointer;
  padding: 6px 12px; margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  font-family: inherit; font-size: var(--fs-label); font-weight: var(--fw-medio);
  color: var(--text-muted);
  &:hover { color: var(--text-2); }
}
.tr-tipo--on { color: var(--text); font-weight: var(--fw-semi); border-bottom-color: var(--accent); }

.tr-nada { font-size: var(--fs-label); color: var(--text-muted); }

/* Cada linha é um artigo do carrinho: artigo, quantidade e o botão de tirar. */
.tr-linha { & + & { margin-top: var(--sp-2); } }

.tr-linha__campos {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-2);
}

.tr-linha__artigo { flex: 1 1 auto; min-width: 0; }
.tr-linha__qtd    { flex: 0 0 148px; }

.tr-linha__remover {
  flex: 0 0 auto;
  margin-top: 6px;
  color: var(--text-3);
  &:hover:not([disabled]) { color: var(--st-danger-text); }
}

.tr-saldo {
  margin: 2px 0 0;
  font-size: var(--fs-label);
  line-height: var(--lh-tight);
  color: var(--text-muted);
}

.tr-saldo--curto { color: var(--st-danger-text); font-weight: var(--fw-medio); }

.tr-adicionar {
  margin-top: var(--sp-2);
  font-size: var(--fs-label);
  color: var(--text-2);
}

.tr-tipo-linha {
  margin-left: 8px;
  font-size: var(--fs-label); font-weight: var(--fw-regular);
  color: var(--text-muted);
}

.tr-percurso {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  white-space: nowrap;
}

.form-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
