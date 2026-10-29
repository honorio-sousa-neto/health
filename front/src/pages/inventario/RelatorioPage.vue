<template>
  <PaginaRelatorio
    titulo="Relatório mensal"
    :contexto="contexto"
    apoio="Movimentação de existências do mês. O stock final é o inicial mais o que entrou menos o que saiu."
    :carregando="carregando"
    :vazio="!relatorio"
    texto-vazio="Escolha o mês e gere o relatório."
    icone-vazio="las la-chart-bar"
    @recarregar="gerar"
  >
    <template #accoes>
      <input
        v-model.number="filtro.ano"
        type="number" min="2020"
        class="lp-filtro rel-ano"
        aria-label="Ano"
      />

      <select v-model.number="filtro.mes" class="lp-filtro" aria-label="Mês">
        <option v-for="m in MESES" :key="m.valor" :value="m.valor">{{ m.rotulo }}</option>
      </select>

      <select v-model="filtro.departamento" class="lp-filtro" aria-label="Departamento">
        <option value="">Todos os departamentos</option>
        <option v-for="d in departamentos" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>

      <q-btn
        flat no-caps
        icon="las la-file-excel"
        label="Exportar Excel"
        class="btn-icone"
        :loading="aExportar"
        :disable="!relatorio"
        @click="exportar"
      >
        <q-tooltip>Entradas e saídas diárias por artigo</q-tooltip>
      </q-btn>

      <q-btn
        unelevated no-caps
        label="Gerar"
        class="btn-primaria"
        :loading="carregando"
        @click="gerar"
      />
    </template>

    <!-- ── Resumo por artigo ─────────────────────────────────────────── -->
    <section class="rel-seccao">
      <h2 class="rel-seccao__titulo">
        Resumo por artigo
        <span class="rel-seccao__contagem">{{ resumo.length }}</span>
      </h2>

      <div v-if="resumo.length" class="rel-tabela-wrap">
        <table class="lp-tabela">
          <thead>
            <tr>
              <th class="lp-c" scope="col">Artigo</th>
              <th class="lp-c lp-c--num" scope="col">Stock inicial</th>
              <th class="lp-c lp-c--num" scope="col">Entradas</th>
              <th class="lp-c lp-c--num" scope="col">Saídas</th>
              <th class="lp-c lp-c--num" scope="col">Transf. recebidas</th>
              <th class="lp-c lp-c--num" scope="col">Transf. enviadas</th>
              <th class="lp-c lp-c--num" scope="col">Stock final</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="linha in resumo" :key="linha.productId" class="lp-linha">
              <td class="lp-c lp-c--forte">{{ linha.productName ?? "\u2014" }}</td>
              <td class="lp-c lp-c--num">{{ numero(linha.openingQty) }}</td>
              <td class="lp-c lp-c--num">+{{ numero(linha.totalEntries) }}</td>
              <td class="lp-c lp-c--num">\u2212{{ numero(linha.totalOuts) }}</td>
              <td class="lp-c lp-c--num">+{{ numero(linha.totalTransfersIn) }}</td>
              <td class="lp-c lp-c--num">\u2212{{ numero(linha.totalTransfersOut) }}</td>
              <td class="lp-c lp-c--num lp-c--forte">{{ numero(linha.closingQty) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="rel-vazio">Sem movimentos neste período.</p>
    </section>

    <!-- ── Entradas ──────────────────────────────────────────────────── -->
    <section class="rel-seccao">
      <h2 class="rel-seccao__titulo">
        Entradas
        <span class="rel-seccao__contagem">{{ entradas.length }}</span>
      </h2>

      <div v-if="entradas.length" class="rel-tabela-wrap">
        <table class="lp-tabela">
          <thead>
            <tr>
              <th class="lp-c" scope="col">Artigo</th>
              <th class="lp-c" scope="col">Destino</th>
              <th class="lp-c" scope="col">Motivo</th>
              <th class="lp-c lp-c--num" scope="col">Quantidade</th>
              <th class="lp-c" scope="col">Data</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="linha in entradas" :key="linha.id" class="lp-linha">
              <td class="lp-c lp-c--forte">{{ linha.product?.name ?? "\u2014" }}</td>
              <td class="lp-c">{{ linha.toLocation?.name ?? "\u2014" }}</td>
              <td class="lp-c">{{ MOTIVO[linha.reason] ?? linha.reason ?? "\u2014" }}</td>
              <td class="lp-c lp-c--num">{{ quantidadeCom(linha) }}</td>
              <td class="lp-c">{{ data(linha.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="rel-vazio">Sem entradas neste período.</p>
    </section>

    <!-- ── Saídas ────────────────────────────────────────────────────── -->
    <section class="rel-seccao">
      <h2 class="rel-seccao__titulo">
        Saídas e consumos
        <span class="rel-seccao__contagem">{{ saidas.length }}</span>
      </h2>

      <div v-if="saidas.length" class="rel-tabela-wrap">
        <table class="lp-tabela">
          <thead>
            <tr>
              <th class="lp-c" scope="col">Artigo</th>
              <th class="lp-c" scope="col">Origem</th>
              <th class="lp-c" scope="col">Atendimento</th>
              <th class="lp-c lp-c--num" scope="col">Quantidade</th>
              <th class="lp-c" scope="col">Data</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="linha in saidas" :key="linha.id" class="lp-linha">
              <td class="lp-c lp-c--forte">{{ linha.product?.name ?? "\u2014" }}</td>
              <td class="lp-c">{{ linha.fromLocation?.name ?? "\u2014" }}</td>
              <td class="lp-c">{{ linha.attendance?.reference ?? "\u2014" }}</td>
              <td class="lp-c lp-c--num">{{ quantidadeCom(linha) }}</td>
              <td class="lp-c">{{ data(linha.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="rel-vazio">Sem saídas neste período.</p>
    </section>
  </PaginaRelatorio>
</template>

<script setup>
/**
 * O relatório mensal de existências.
 *
 * São três tabelas na mesma página — resumo, entradas, saídas — e por isso
 * não é uma `ListaPagina`. Mas é a mesma página: o cabeçalho, os estados e
 * as tabelas vêm todos do mesmo sítio, pela `PaginaRelatorio`.
 *
 * O motivo de cada entrada era mostrado cru, como vem da base
 * (`positive_adjustment`), dentro de uma cápsula verde. Passa a palavras.
 */
import { computed, onMounted, reactive, ref } from "vue";
import { api } from "src/boot/axios";
import PaginaRelatorio from "src/components/common/table/PaginaRelatorio.vue";
import { showNotify } from "src/utils/notify";
import { quantidade as numero } from "src/utils/format";

const carregando = ref(false);
const aExportar = ref(false);
const relatorio = ref(null);
const departamentos = ref([]);

const agora = new Date();
const filtro = reactive({
  ano: agora.getFullYear(),
  mes: agora.getMonth() + 1,
  departamento: "",
});

const MESES = [
  { rotulo: "Janeiro", valor: 1 }, { rotulo: "Fevereiro", valor: 2 },
  { rotulo: "Março", valor: 3 }, { rotulo: "Abril", valor: 4 },
  { rotulo: "Maio", valor: 5 }, { rotulo: "Junho", valor: 6 },
  { rotulo: "Julho", valor: 7 }, { rotulo: "Agosto", valor: 8 },
  { rotulo: "Setembro", valor: 9 }, { rotulo: "Outubro", valor: 10 },
  { rotulo: "Novembro", valor: 11 }, { rotulo: "Dezembro", valor: 12 },
];

const MOTIVO = {
  purchase: "Compra",
  donation: "Doação",
  positive_adjustment: "Ajuste positivo",
  negative_adjustment: "Ajuste negativo",
  transfer: "Transferência",
  sale: "Venda",
  consumption: "Consumo",
  service_consumption: "Consumo em serviço",
  lab_consumption: "Consumo em laboratório",
  purchase_reversal: "Anulação de compra",
  expiry: "Expirado",
  loss: "Perda",
};

// A resposta pode vir sem alguma das secções.
const resumo = computed(() => relatorio.value?.summary ?? []);
const entradas = computed(() => relatorio.value?.movements?.entries ?? []);
const saidas = computed(() => relatorio.value?.movements?.exits ?? []);

const contexto = computed(() => {
  const mes = MESES.find((m) => m.valor === filtro.mes)?.rotulo ?? "";
  const dep = departamentos.value.find((d) => d.id === filtro.departamento)?.name;
  return [`${mes} de ${filtro.ano}`, dep].filter(Boolean).join(" \u00b7 ");
});

const data = (v) => (v ? new Date(v).toLocaleDateString("pt-PT") : "\u2014");

const quantidadeCom = (linha) =>
  `${numero(linha.quantity)} ${linha.product?.unit?.abbreviation ?? "un"}`;

const carregarDepartamentos = async () => {
  const { data: res } = await api.get("stock/locations");
  departamentos.value = res.data ?? [];
};

const gerar = async () => {
  carregando.value = true;
  relatorio.value = null;
  try {
    const { data: res } = await api.get("stock/reports/monthly", {
      params: {
        year: filtro.ano,
        month: filtro.mes,
        locationId: filtro.departamento || undefined,
      },
    });
    relatorio.value = res.data;
  } catch (_) {
    showNotify("Não foi possível calcular o relatório", false);
  } finally {
    carregando.value = false;
  }
};

const exportar = async () => {
  aExportar.value = true;
  try {
    const { data: blob } = await api.get("stock/reports/monthly/excel", {
      params: {
        year: filtro.ano,
        month: filtro.mes,
        locationId: filtro.departamento || undefined,
      },
      responseType: "blob",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventario-${String(filtro.mes).padStart(2, "0")}-${filtro.ano}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (_) {
    showNotify("Erro ao exportar o relatório", false);
  } finally {
    aExportar.value = false;
  }
};

onMounted(carregarDepartamentos);
</script>

<style scoped lang="scss">
.rel-ano { width: 88px; }
</style>
