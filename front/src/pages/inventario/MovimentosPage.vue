<template>
  <ListaPagina
    titulo="Histórico de movimentos"
    :contexto="contexto"
    apoio="Tudo o que entrou, saiu ou mudou de departamento. É o registo de onde o saldo vem."
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="temFiltro"
    texto-vazio="Ainda não há movimentos registados."
    @recarregar="fetchData"
  >
    <template #accoes>
      <select v-model="filters.type" class="lp-filtro" aria-label="Filtrar por tipo" @change="aoFiltrar">
        <option :value="null">Todos os tipos</option>
        <option v-for="o in typeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>

      <select v-model="filters.locationId" class="lp-filtro" aria-label="Filtrar por departamento" @change="aoFiltrar">
        <option :value="null">Todos os departamentos</option>
        <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
      </select>

      <input v-model="filters.from" type="date" class="lp-filtro" aria-label="De" @change="aoFiltrar" />
      <input v-model="filters.to" type="date" class="lp-filtro" aria-label="At\u00e9" @change="aoFiltrar" />
    </template>

    <template #celula-percurso="{ linha }">
      <span class="mov-percurso">
        <template v-if="linha.type === 'TRANSFER'">
          {{ linha.fromLocation?.name ?? "?" }}
          <q-icon name="las la-arrow-right" size="13px" />
          {{ linha.toLocation?.name ?? "?" }}
        </template>
        <template v-else>
          {{ linha.toLocation?.name ?? linha.fromLocation?.name ?? "\u2014" }}
        </template>
      </span>
    </template>

    <template #celula-quantity="{ linha }">
      <span class="mov-qtd" :class="linha.type === 'EXIT' ? 'mov-qtd--sai' : 'mov-qtd--entra'">
        {{ linha.type === "EXIT" ? "\u2212" : "+" }}{{ quantidade(linha.quantity) }}
        <span class="mov-qtd__un">{{ linha.product?.unit?.abbreviation ?? "un" }}</span>
      </span>
    </template>
  </ListaPagina>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { computed, onMounted, reactive, ref } from 'vue'
import ListaPagina from 'src/components/common/table/ListaPagina.vue'
import { quantidade } from 'src/utils/format'

const loading    = ref(false)
const data       = reactive([])
const locations  = reactive([])
const pagination = reactive({ page: 1, perPage: 30, total: 0, totalPages: 1 })
const filters    = reactive({ type: null, locationId: null, from: '', to: '' })

const typeOptions = [
  { label: 'Entradas',       value: 'ENTRY'    },
  { label: 'Saídas',         value: 'EXIT'     },
  { label: 'Transferências', value: 'TRANSFER' },
]

const fetchLocations = async () => {
  const { data: res } = await api.get('stock/locations')
  locations.splice(0, locations.length, ...(res.data ?? []))
}

const fetchData = async (page = 1) => {
  loading.value = true
  pagination.page = page
  try {
    const { data: res } = await api.get('stock/movements', {
      params: {
        page,
        perPage: pagination.perPage,
        type:       filters.type       || undefined,
        locationId: filters.locationId || undefined,
        from:       filters.from       || undefined,
        to:         filters.to         || undefined,
      },
    })
    data.splice(0, data.length, ...(res.data ?? []))
    Object.assign(pagination, { total: res.meta?.total ?? 0, totalPages: res.meta?.totalPages ?? 1 })
  } catch (_) {} finally { loading.value = false }
}

const MOTIVO = {
  purchase: 'Compra',
  donation: 'Doação',
  positive_adjustment: 'Ajuste positivo',
  negative_adjustment: 'Ajuste negativo',
  transfer: 'Transferência',
  sale: 'Venda',
  consumption: 'Consumo',
  service_consumption: 'Consumo em serviço',
  lab_consumption: 'Consumo em laboratório',
  purchase_reversal: 'Anulação de compra',
  expiry: 'Expirado',
  loss: 'Perda',
}

// Onze cores pastel para onze motivos não distinguia nada: a cor deixava de
// ser sinal. Fica em texto, e o tom só marca o que merece ser notado —
// perdas, expirados e ajustes, que não têm documento por trás.
const TOM = {
  expiry: 'erro',
  loss: 'erro',
  negative_adjustment: 'aviso',
  positive_adjustment: 'aviso',
  purchase_reversal: 'aviso',
}

const temFiltro = computed(() =>
  Boolean(filters.type || filters.locationId || filters.from || filters.to),
)

const contexto = computed(() => {
  const partes = []
  const tipo = typeOptions.find((o) => o.value === filters.type)?.label
  if (tipo) partes.push(tipo.toLowerCase())
  const nome = locations.find((l) => l.id === filters.locationId)?.name
  if (nome) partes.push(`em ${nome}`)
  if (filters.from || filters.to) {
    partes.push(`de ${filters.from || '\u2026'} a ${filters.to || '\u2026'}`)
  }
  return partes.join(' \u00b7 ')
})

const colunas = [
  { name: 'product', label: 'Artigo', field: (l) => l.product?.name ?? null, align: 'left' },
  { name: 'percurso', label: 'Departamento', field: () => null, align: 'left' },
  {
    name: 'reason', label: 'Motivo', field: 'reason', align: 'left', estado: true,
    format: (v, l) => MOTIVO[v] ?? l.type ?? '\u2014',
    tom: (v) => TOM[v] ?? 'neutro',
  },
  { name: 'quantity', label: 'Quantidade', field: 'quantity', numerico: true },
  { name: 'user', label: 'Responsável', field: (l) => l.user?.name ?? null, align: 'left' },
  { name: 'createdAt', label: 'Data', field: 'createdAt', align: 'left', format: (v) => fmtDate(v) },
]

const aoFiltrar = () => fetchData(1)

const fmtDate = (d) =>
  d ? new Intl.DateTimeFormat('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d)) : '—'

onMounted(() => { fetchLocations(); fetchData() })
</script>

<style scoped lang="scss">
.mov-percurso {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  white-space: nowrap;
}

/* O sinal e a direcção do movimento. Sem tinta de estado: entrar e sair não
   é bom nem mau, é o que um inventário faz. */
.mov-qtd {
  font-variant-numeric: tabular-nums;
  font-weight: var(--fw-semi);
  white-space: nowrap;
  color: var(--text);
}

.mov-qtd--sai { color: var(--text-2); }

.mov-qtd__un {
  margin-left: 3px;
  font-size: var(--fs-label);
  font-weight: var(--fw-regular);
  color: var(--text-muted);
}
</style>
