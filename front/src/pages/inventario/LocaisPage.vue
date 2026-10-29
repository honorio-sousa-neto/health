<template>
  <div>
    <!-- Sem um departamento a receber as entradas, nenhuma compra pode ser
         registada — e isso só se descobria ao tentar gravar a factura. -->
    <div v-if="!loading && !temPadrao" class="aviso">
      <q-icon class="aviso__icone" name="las la-exclamation-circle" size="18px" />
      <div class="aviso__corpo">
        <div class="aviso__titulo">Nenhum departamento recebe as entradas</div>
        <div>
          Uma compra entra no departamento marcado para as receber, e não há
          nenhum marcado. {{ data.length ? 'Abra um destes' : 'Crie o primeiro' }}
          e ligue «Recebe as entradas das compras».
        </div>
      </div>
    </div>

    <ListaPagina
      titulo="Departamentos"
      :contexto="contexto"
      apoio="Onde as existências ficam — farmácia, laboratório, bloco. Um deles recebe o que entra por compra."
      :colunas="colunas"
      :linhas="linhas"
      :carregando="loading"
      :paginacao="paginacao"
      :filtrado="!!paginacao.search"
      texto-vazio="Ainda não há departamentos criados."
      @recarregar="fetchData"
    >
      <template #accoes>
        <q-btn
          unelevated no-caps
          icon="las la-plus"
          label="Novo departamento"
          class="btn-primaria"
          @click="openCreate"
        />
      </template>

      <template #celula-isDefault="{ linha }">
        <span class="lp-estado" :class="linha.isDefault ? 'lp-estado--ok' : 'lp-estado--neutro'">
          <span class="lp-estado__ponto" />{{ linha.isDefault ? "Sim" : "Não" }}
        </span>
      </template>

      <template #linha-accoes="{ linha }">
        <EditButton modo="item" @click="openEdit(linha)" />
      </template>
    </ListaPagina>

    <!-- Dialog criar/editar -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: min(380px, 92vw); border-radius: var(--r-panel)">
        <q-card-section class="q-pb-sm">
          <div class="text-subtitle1 text-weight-semibold">
            {{ editing ? 'Editar departamento' : 'Novo departamento' }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="onSubmit">
            <q-input v-model="form.name" class="fi fi--principal" borderless label="Nome *"
              :rules="[v => !!v || 'Obrigatório']" lazy-rules />
            <q-input v-model="form.description" class="fi q-mt-sm" borderless
              label="Descrição" />
            <!-- Chamava-se "Farmácia (stock central)". O que a marca faz é
                 outra coisa, e é esta: dizer onde as compras aterram. -->
            <q-toggle
              v-model="form.isDefault"
              label="Recebe as entradas das compras"
              class="q-mt-md"
            />
            <p class="loc-nota">
              Só um departamento pode estar marcado. Ao ligar aqui, o que
              estiver marcado deixa de estar.
            </p>
            <div class="form-actions q-mt-md">
              <q-btn flat no-caps label="Cancelar" class="btn-icone" @click="dialog = false" />
              <q-btn unelevated no-caps type="submit" label="Guardar departamento"
                class="btn-primaria" :loading="saving" />
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
import EditButton from 'src/components/common/buttons/EditButton.vue'
import ListaPagina from 'src/components/common/table/ListaPagina.vue'
import { usePaginacaoLocal } from 'src/composables/paginacao-local'

const loading = ref(false)
const saving  = ref(false)
const dialog  = ref(false)
const editing = ref(null)
const data    = reactive([])

const emptyForm = () => ({ name: '', description: '', isDefault: false })
const form = reactive(emptyForm())

const temPadrao = computed(() => data.some((l) => l.isDefault))

// `stock/locations` devolve todos os departamentos de uma vez.
const { paginacao, linhas } = usePaginacaoLocal(computed(() => data), ['name', 'description'])

const contexto = computed(() =>
  paginacao.search ? `a filtrar por \u201c${paginacao.search}\u201d` : '',
)

const colunas = [
  { name: 'name', label: 'Nome', field: 'name', align: 'left', ordenavel: true },
  { name: 'description', label: 'Descrição', field: 'description', align: 'left' },
  { name: 'isDefault', label: 'Recebe compras', field: 'isDefault', align: 'left' },
  { name: 'actions', label: 'Acções', align: 'right' },
]

const fetchData = async () => {
  loading.value = true
  try {
    const { data: res } = await api.get('stock/locations')
    data.splice(0, data.length, ...(res.data ?? []))
  } catch (_) {} finally { loading.value = false }
}

const openCreate = () => {
  editing.value = null
  Object.assign(form, emptyForm())
  dialog.value = true
}

const openEdit = (row) => {
  editing.value = row.id
  Object.assign(form, { name: row.name, description: row.description ?? '', isDefault: row.isDefault })
  dialog.value = true
}

const onSubmit = async () => {
  saving.value = true
  try {
    const { data: res } = editing.value
      ? await api.patch(`stock/locations/${editing.value}`, form)
      : await api.post('stock/locations', form)
    showNotify(res.message, res.success)
    dialog.value = false
    fetchData()
  } catch (_) {} finally { saving.value = false }
}

onMounted(fetchData)
</script>

<style scoped lang="scss">
.aviso { margin-bottom: var(--sp-5); }

.loc-nota {
  margin: var(--sp-2) 0 0 44px;
  font-size: var(--fs-label);
  line-height: var(--lh-body);
  color: var(--text-muted);
}

.form-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
