<template>
  <div class="flow-wrap">
    <!-- Resumo do período -->
    <div class="metrics-row">
      <Card
        text="Entrada"
        :amount="data.data.entry"
        icon="las la-arrow-down"
        icon-color="var(--st-ok-text)"
        icon-bg="var(--st-ok-tint)"
        amount-color="var(--text)"
      />
      <Card
        text="Saída"
        :amount="data.data.out"
        icon="las la-arrow-up"
        icon-color="var(--st-danger-text)"
        icon-bg="var(--st-danger-tint)"
        amount-color="var(--text)"
      />
      <Card
        text="Saldo"
        :amount="data.data.balance"
        icon="las la-balance-scale"
        icon-color="var(--text-2)"
        icon-bg="var(--surface-3)"
        amount-color="var(--text)"
      />
    </div>

    <ListaPagina
      titulo="Movimentos"
      :contexto="contexto"
      apoio="Entradas e saídas deste destino, por ordem de registo."
      :colunas="colunas"
      :linhas="linhas"
      :paginacao="paginacao"
      :filtrado="!!paginacao.search"
      texto-vazio="Ainda não há movimentos registados."
      @recarregar="fetchData"
    >
      <template #accoes>
        <q-btn
          unelevated no-caps
          icon="las la-plus"
          label="Novo registo"
          class="btn-primaria"
          @click="dialog = true"
        />
      </template>
    </ListaPagina>

    <!-- Dialog -->
    <q-dialog v-model="dialog" persistent>
      <div class="dialog-box">
        <div class="dialog-header">
          <span class="dialog-title">Novo registo</span>
          <q-btn flat round dense icon="las la-times" color="grey-5" v-close-popup />
        </div>
        <Form :flow="flow" @saved="onSaved" />
      </div>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { usePaginacaoLocal } from "src/composables/paginacao-local";
import { kwanza } from "src/utils/format";
import Card from "./card.vue";
import Form from "./form.vue";
import { useFlowStore } from "src/stores/flow";
import { useCreateUpdate } from "src/composables/create-update";

const dialog = ref(false);
const props = defineProps({ flow: { type: String, required: true } });
const store = useFlowStore();
const { create, loading } = useCreateUpdate("flows");

const data = reactive({
  data: { out: 0, entry: 0, balance: 0, table: [] },
});

// O movimento vem todo de uma vez no mesmo pedido do resumo: a paginação e
// a pesquisa são locais.
const { paginacao, linhas } = usePaginacaoLocal(
  computed(() => data.data.table ?? []),
  ["description"],
);

const contexto = computed(() =>
  paginacao.search ? `a filtrar por \u201c${paginacao.search}\u201d` : "",
);

const colunas = [
  { name: "description", label: "Descrição", field: "description", align: "left", ordenavel: true },
  {
    name: "type", label: "Tipo", field: "type", align: "left", estado: true,
    format: (v) => (v === "ENTRY" ? "Entrada" : "Saída"),
    tom: () => "neutro",
  },
  {
    name: "amount", label: "Valor", field: "amount",
    numerico: true, ordenavel: true,
    format: (v, l) => `${l.type === "ENTRY" ? "+" : "\u2212"}${kwanza(v)}`,
  },
  {
    name: "createdAt", label: "Data", field: "createdAt", align: "left", ordenavel: true,
    format: (v) =>
      v
        ? new Intl.DateTimeFormat("pt-PT", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          }).format(new Date(v))
        : "\u2014",
  },
];

const fetchData = async () => {
  try {
    const response = await store.index(props.flow);
    Object.assign(data, response);
  } catch (error) {}
};

const onSaved = async (payload) => {
  const result = await create({ destination: props.flow, ...payload });
  if (result) {
    dialog.value = false;
    fetchData();
  }
};

onMounted(fetchData);
</script>

<style scoped lang="scss">
.flow-wrap {
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Metrics ── */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

/* ── Table card ── */




/* ── Empty ── */

/* ── Header row ── */


/* ── Data rows ── */




/* ── Dialog ── */
.dialog-box {
  background: var(--surface);
  border-radius: var(--r-panel);
  width: 420px;
  max-width: 95vw;
  padding: 20px 22px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.dialog-title {
  font-size: var(--fs-title); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text);
}
</style>
