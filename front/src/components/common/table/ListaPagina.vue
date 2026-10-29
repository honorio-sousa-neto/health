<template>
  <section class="lp">
    <!-- ── Cabeçalho ────────────────────────────────────────────────────
         Fora do contentor que rola, por isso está sempre visível sem
         `sticky`: a coluna é flex, o corpo é a única parte com overflow. É
         mais robusto do que empilhar dois `sticky` com deslocamentos
         calculados, e dá o mesmo resultado — cabeçalho do cartão em cima,
         cabeçalho da tabela por baixo, nenhum a passar sobre o outro. -->
    <header class="lp-head">
      <div class="lp-head__linha">
        <div class="lp-head__id">
          <h1 class="lp-titulo">{{ tituloEfectivo }}</h1>
          <span v-if="contexto" class="lp-contexto">{{ contexto }}</span>
        </div>

        <div class="lp-accoes">
          <!-- Acções sobre selecção. Só existem quando há selecção, e dizem
               sobre quantos registos actuam. Uma acção destrutiva sempre
               visível numa lista clínica é um acidente à espera. -->
          <template v-if="seleccionavel && seleccionados.length">
            <span class="lp-contagem-sel">
              {{ seleccionados.length }}
              {{ seleccionados.length === 1 ? "seleccionado" : "seleccionados" }}
            </span>
            <slot name="accoes-seleccao" :n="seleccionados.length" :linhas="seleccionados" />
            <span class="lp-sep" />
          </template>

          <div v-if="paginacao" class="lp-pesquisa">
            <q-icon name="las la-search" size="15px" />
            <input
              v-model="pesquisa"
              class="lp-pesquisa__campo"
              type="search"
              placeholder="Pesquisar…"
              :aria-label="`Pesquisar em ${tituloEfectivo}`"
            />
          </div>

          <slot name="accoes" />
        </div>
      </div>

      <p v-if="apoio" class="lp-apoio">{{ apoio }}</p>
    </header>

    <!-- ── Corpo ──────────────────────────────────────────────────────── -->
    <div ref="corpoRef" class="lp-corpo">
      <table v-if="temLinhas" class="lp-tabela">
        <thead>
          <tr>
            <th v-if="seleccionavel" class="lp-c lp-c--sel" scope="col">
              <input
                type="checkbox"
                :checked="todasSeleccionadas"
                :indeterminate.prop="algumasSeleccionadas"
                :aria-label="todasSeleccionadas ? 'Limpar selecção' : 'Seleccionar todos'"
                @change="alternarTodas"
              />
            </th>

            <th
              v-for="col in colunasDados"
              :key="col.name"
              class="lp-c"
              :class="classeColuna(col)"
              :style="estiloColuna(col)"
              scope="col"
              :aria-sort="ariaOrdenacao(col)"
            >
              <button
                v-if="col.ordenavel && ordenacaoDisponivel"
                class="lp-ord"
                type="button"
                @click="ordenarPor(col)"
              >
                <span>{{ col.label }}</span>
                <q-icon :name="iconeOrdenacao(col)" size="14px" />
              </button>
              <span v-else-if="col.ordenavel" class="lp-ord lp-ord--inactiva">
                <span>{{ col.label }}</span>
                <q-icon name="las la-sort" size="14px" />
                <q-tooltip>
                  A lista está paginada no servidor. Ordenar só a página visível
                  daria uma ordem que não é a do conjunto.
                </q-tooltip>
              </span>
              <span v-else>{{ col.label }}</span>
            </th>

            <th v-if="$slots['linha-accoes']" class="lp-c lp-c--accoes" scope="col">
              <span class="sr-only">Acções</span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="linha in linhasOrdenadas"
            :key="linha.id ?? JSON.stringify(linha)"
            class="lp-linha"
            :class="{ 'lp-linha--sel': estaSeleccionada(linha) }"
          >
            <td v-if="seleccionavel" class="lp-c lp-c--sel">
              <input
                type="checkbox"
                :checked="estaSeleccionada(linha)"
                :aria-label="`Seleccionar ${valorBruto(linha, colunaTitulo)}`"
                @change="alternarLinha(linha)"
              />
            </td>

            <td
              v-for="col in colunasDados"
              :key="col.name"
              class="lp-c"
              :class="classeColuna(col, linha)"
              :style="estiloColuna(col)"
            >
              <slot :name="`celula-${col.name}`" :linha="linha" :valor="valorBruto(linha, col)">
                <span v-if="col.estado" class="lp-estado" :class="`lp-estado--${tomDe(col, linha)}`">
                  <span class="lp-estado__ponto" />
                  {{ formatar(linha, col) }}
                </span>
                <template v-else>{{ formatar(linha, col) }}</template>
              </slot>
            </td>

            <td v-if="$slots['linha-accoes']" class="lp-c lp-c--accoes">
              <button class="lp-menu-btn" type="button" :aria-label="`Acções de ${valorBruto(linha, colunaTitulo)}`">
                <q-icon name="las la-ellipsis-v" size="16px" />
                <q-menu anchor="bottom right" self="top right" class="nav-flyout">
                  <q-list>
                    <slot name="linha-accoes" :linha="linha" />
                  </q-list>
                </q-menu>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Quatro estados, e "vazio" são dois: não haver registos e o filtro
           não devolver nada pedem acções diferentes a quem lê. -->
      <EstadoDados
        :carregando="carregando"
        :erro="erro"
        :vazio="!temLinhas"
        :repetivel="true"
        texto-carregar="A carregar…"
        texto-erro="Não foi possível carregar os registos."
        :texto-vazio="filtrado ? 'Nenhum registo corresponde ao que procura.' : textoVazio"
        :icone-vazio="filtrado ? 'las la-search' : 'las la-folder-open'"
        tamanho-icone="40px"
        @repetir="$emit('recarregar')"
      />
    </div>

    <!-- ── Rodapé ──────────────────────────────────────────────────────── -->
    <footer v-if="paginacao" class="lp-rodape">
      <span class="lp-total">
        {{ paginacao.total ?? 0 }}
        {{ (paginacao.total ?? 0) === 1 ? "registo" : "registos" }}
      </span>

      <span class="lp-rodape__nav">
        <label class="lp-porpagina">
          <span>Por página</span>
          <select v-model.number="porPagina" aria-label="Registos por página">
            <option v-for="n in [5, 10, 15, 25, 50]" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>

        <q-pagination
          v-if="(paginacao.totalPages ?? 1) > 1"
          v-model="pagina"
          :max="paginacao.totalPages ?? 1"
          :max-pages="5"
          boundary-links
          direction-links
          flat
          color="grey-7"
          active-color="primary"
        />
      </span>
    </footer>
  </section>
</template>

<script setup>
/**
 * Uma página de lista é um cartão: cabeçalho próprio, tabela a preencher o
 * resto, rodapé com contagem e paginação.
 *
 * Substitui o par `DataTable` + `Pagination`, que distribuía o mesmo
 * conteúdo por outra ordem — pesquisa, contagem, navegação e a acção
 * primária viviam todos numa barra acima da lista, e o título da página não
 * existia em lado nenhum.
 *
 * O `DataTable` fica de pé enquanto houver páginas por migrar. Sai quando a
 * última migrar; até lá as duas formas coexistem de propósito.
 *
 * ── Ordenação ────────────────────────────────────────────────────────────
 * No cliente, e só quando a lista cabe numa página. Numa lista paginada no
 * servidor, ordenar as quinze linhas visíveis produz uma ordem que não é a do
 * conjunto — e quem olha não tem como saber a diferença. O cabeçalho fica
 * visível e inerte, com o motivo no tooltip, até o backend aceitar `sort`.
 */
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import EstadoDados from "../EstadoDados.vue";

const props = defineProps({
  titulo: { type: String, default: "" },
  contexto: { type: String, default: "" },
  apoio: { type: String, default: "" },
  colunas: { type: Array, default: () => [] },
  linhas: { type: Array, default: () => [] },
  carregando: { type: Boolean, default: false },
  erro: { type: [Boolean, Object, String], default: false },
  /** { page, perPage, total, totalPages, search } — omitido esconde o rodapé. */
  paginacao: { type: Object, default: null },
  /** A lista está filtrada? Distingue "sem registos" de "sem resultados". */
  filtrado: { type: Boolean, default: false },
  textoVazio: { type: String, default: "Ainda não há registos." },
  seleccionavel: { type: Boolean, default: false },
});

const emit = defineEmits(["recarregar"]);
const seleccionados = defineModel("seleccionados", { type: Array, default: () => [] });

const route = useRoute();
const corpoRef = ref(null);

const tituloEfectivo = computed(() => props.titulo || route.meta?.title || "");

/* ── Colunas ────────────────────────────────────────────────────────────── */
const colunasDados = computed(() => props.colunas.filter((c) => c.name !== "actions"));
const colunaTitulo = computed(() => colunasDados.value[0]);

const valorBruto = (linha, col) => {
  if (!col) return "";
  return typeof col.field === "function" ? col.field(linha) : linha[col.field] ?? linha[col.name];
};

const formatar = (linha, col) => {
  const bruto = valorBruto(linha, col);
  if (typeof col.format === "function") return col.format(bruto, linha);
  return bruto ?? "—";
};

const tomDe = (col, linha) =>
  typeof col.tom === "function" ? col.tom(valorBruto(linha, col), linha) : "neutro";

const classeColuna = (col, linha) => ({
  "lp-c--num": !!col.numerico,
  "lp-c--forte": col === colunaTitulo.value && !!linha,
  "lp-c--centro": col.align === "center",
});

const estiloColuna = (col) => (col.largura ? { width: col.largura } : null);

/* ── Ordenação ──────────────────────────────────────────────────────────── */
const ordenacaoDisponivel = computed(() => (props.paginacao?.totalPages ?? 1) <= 1);
const ordem = ref({ coluna: null, ascendente: true });

const ordenarPor = (col) => {
  if (ordem.value.coluna === col.name) ordem.value.ascendente = !ordem.value.ascendente;
  else ordem.value = { coluna: col.name, ascendente: true };
};

const iconeOrdenacao = (col) => {
  if (ordem.value.coluna !== col.name) return "las la-sort";
  return ordem.value.ascendente ? "las la-sort-up" : "las la-sort-down";
};

const ariaOrdenacao = (col) => {
  if (!col.ordenavel || !ordenacaoDisponivel.value) return null;
  if (ordem.value.coluna !== col.name) return "none";
  return ordem.value.ascendente ? "ascending" : "descending";
};

const linhasOrdenadas = computed(() => {
  const { coluna, ascendente } = ordem.value;
  if (!coluna || !ordenacaoDisponivel.value) return props.linhas;
  const col = colunasDados.value.find((c) => c.name === coluna);
  if (!col) return props.linhas;
  const sinal = ascendente ? 1 : -1;
  return [...props.linhas].sort((a, b) => {
    const va = valorBruto(a, col);
    const vb = valorBruto(b, col);
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === "number" && typeof vb === "number") return (va - vb) * sinal;
    return String(va).localeCompare(String(vb), "pt", { numeric: true }) * sinal;
  });
});

const temLinhas = computed(() => !props.carregando && !props.erro && props.linhas.length > 0);

/* ── Selecção ───────────────────────────────────────────────────────────── */
const chave = (linha) => linha?.id ?? JSON.stringify(linha);
const estaSeleccionada = (linha) => seleccionados.value.some((s) => chave(s) === chave(linha));

const alternarLinha = (linha) => {
  seleccionados.value = estaSeleccionada(linha)
    ? seleccionados.value.filter((s) => chave(s) !== chave(linha))
    : [...seleccionados.value, linha];
};

const todasSeleccionadas = computed(
  () => props.linhas.length > 0 && seleccionados.value.length === props.linhas.length,
);
const algumasSeleccionadas = computed(
  () => seleccionados.value.length > 0 && !todasSeleccionadas.value,
);
const alternarTodas = () => {
  seleccionados.value = todasSeleccionadas.value ? [] : [...props.linhas];
};

// Mudar de página ou de filtro limpa a selecção: manter seleccionadas linhas
// que já não estão no ecrã faz uma acção em massa agir sobre o invisível.
watch(
  () => [props.paginacao?.page, props.paginacao?.search],
  () => { seleccionados.value = []; },
);

/* ── Paginação e pesquisa ───────────────────────────────────────────────── */
const modelo = (campo, omissao) =>
  computed({
    get: () => props.paginacao?.[campo] ?? omissao,
    set: (v) => {
      if (!props.paginacao) return;
      props.paginacao[campo] = v;
      emit("recarregar");
    },
  });

const pagina = modelo("page", 1);
const porPagina = modelo("perPage", 15);

const pesquisa = computed({
  get: () => props.paginacao?.search ?? "",
  set: (v) => {
    if (!props.paginacao) return;
    props.paginacao.search = v;
    props.paginacao.page = 1;
    emit("recarregar");
  },
});
</script>
