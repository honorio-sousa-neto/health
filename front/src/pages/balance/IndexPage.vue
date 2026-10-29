<template>
  <PaginaRelatorio
    titulo="Balanço"
    :contexto="contexto"
    apoio="Facturação por área de serviço. Abra uma área para ver os documentos que a compõem."
    :carregando="carregando"
    :vazio="!linhas.length"
    texto-vazio="Sem facturação neste período."
    @recarregar="carregar"
  >
    <template #accoes>
      <select v-model="modo" class="lp-filtro" aria-label="Período" @change="mudarModo">
        <option value="diario">Diário</option>
        <option value="mensal">Mensal</option>
      </select>

      <input
        v-if="modo === 'diario'"
        v-model="dia"
        type="date"
        class="lp-filtro"
        aria-label="Dia"
        @change="carregar"
      />
      <input
        v-else
        v-model="mes"
        type="month"
        class="lp-filtro"
        aria-label="Mês"
        @change="carregar"
      />

      <q-btn
        v-if="modo === 'mensal'"
        flat no-caps
        icon="las la-file-excel"
        label="Baixar mapa"
        class="btn-icone"
        @click="baixarMapa"
      />
    </template>

    <section class="rel-seccao">
      <div class="rel-tabela-wrap">
        <table class="lp-tabela">
          <thead>
            <tr>
              <th class="lp-c" scope="col">Área</th>
              <th class="lp-c lp-c--num" scope="col">Total</th>
              <th class="lp-c lp-c--accoes" scope="col"><span class="sr-only">Acções</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="linha in linhas" :key="linha.categoryId" class="lp-linha">
              <td class="lp-c lp-c--forte">{{ linha.categoryName ?? "\u2014" }}</td>
              <td class="lp-c lp-c--num">{{ kwanza(linha.total) }}</td>
              <td class="lp-c lp-c--accoes">
                <button
                  class="lp-menu-btn"
                  type="button"
                  :aria-label="`Ver documentos de ${linha.categoryName}`"
                  @click="abrir(linha)"
                >
                  <q-icon name="las la-eye" size="16px" />
                  <q-tooltip>Ver documentos</q-tooltip>
                </button>
              </td>
            </tr>
          </tbody>
          <!-- O total do período estava num cartão por cima da tabela, com um
               "Kz" escrito à mão. É a soma da coluna: fica no fim dela. -->
          <tfoot>
            <tr class="rel-total">
              <td class="lp-c">Total do período</td>
              <td class="lp-c lp-c--num">{{ kwanza(total) }}</td>
              <td class="lp-c lp-c--accoes" />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  </PaginaRelatorio>
</template>

<script setup>
import { openProtectedFile } from "src/utils/protected-file";
/**
 * O balanço por área de serviço, diário ou mensal.
 *
 * O par de botões "Diário / Mensal" e o cartão do total eram dois blocos
 * soltos por cima de uma tabela feita à mão. O período passa a `select` junto
 * dos restantes filtros, e o total ao fim da coluna que soma — que é onde se
 * confere uma soma.
 */
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "src/boot/axios";
import PaginaRelatorio from "src/components/common/table/PaginaRelatorio.vue";
import { kwanza } from "src/utils/format";

const route = useRoute();
const router = useRouter();

const carregando = ref(false);
const linhas = ref([]);

const hoje = new Date();
const dois = (n) => String(n).padStart(2, "0");

const modo = ref(route.query.mode ?? "diario");
const dia = ref(`${hoje.getFullYear()}-${dois(hoje.getMonth() + 1)}-${dois(hoje.getDate())}`);
const mes = ref(`${hoje.getFullYear()}-${dois(hoje.getMonth() + 1)}`);

const periodo = computed(() => (modo.value === "diario" ? dia.value : mes.value));

const total = computed(() =>
  linhas.value.reduce((soma, l) => soma + (Number(l.total) || 0), 0),
);

const contexto = computed(() => {
  if (modo.value === "diario") {
    return dia.value
      ? new Intl.DateTimeFormat("pt-PT", {
          day: "2-digit", month: "long", year: "numeric",
        }).format(new Date(dia.value))
      : "";
  }
  if (!mes.value) return "";
  const [ano, m] = mes.value.split("-");
  return new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" })
    .format(new Date(Number(ano), Number(m) - 1, 1));
});

const carregar = async () => {
  carregando.value = true;
  try {
    const { data } = await api.get("balances", {
      params: { range: periodo.value, type: modo.value },
    });
    // A API devolve { categories: { [id]: { categoryName, total } }, payments }.
    // A tabela mostra as áreas: iteramos `categories`, não o objecto de topo.
    linhas.value = Object.entries(data.categories ?? {}).map(
      ([categoryId, resumo]) => ({ categoryId, ...resumo }),
    );
  } catch (_) {
    linhas.value = [];
  } finally {
    carregando.value = false;
  }
};

const mudarModo = async () => {
  await router.replace({ query: { mode: modo.value } });
  carregar();
};

const abrir = (linha) =>
  router.push({
    name: "balanco-view",
    query: { range: periodo.value },
    params: { category: linha.categoryId },
  });

const baixarMapa = () => {
  const [ano, m] = mes.value.split("-");
  openProtectedFile(
    `${api.defaults.baseURL}/reports/download/excel/monthly-report?year=${ano}&month=${m}`,
  );
};

onMounted(carregar);
</script>
