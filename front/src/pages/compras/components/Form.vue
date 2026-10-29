<template>
  <q-form @submit.prevent="onSubmit">

    <!-- O que impede gravar, dito ao abrir. Estas duas condições já recusavam
         a compra — mas só depois da factura toda preenchida. -->
    <div v-if="bloqueio" class="aviso">
      <q-icon class="aviso__icone" name="las la-exclamation-circle" size="18px" />
      <div class="aviso__corpo">
        <div class="aviso__titulo">{{ bloqueio.titulo }}</div>
        <div>{{ bloqueio.texto }}</div>
        <q-btn
          v-if="bloqueio.destino"
          flat no-caps dense
          class="btn-icone q-mt-sm"
          :label="bloqueio.accao"
          icon-right="las la-arrow-right"
          @click="$router.push({ name: bloqueio.destino })"
        />
      </div>
    </div>

    <section class="form-seccao">
      <h2 class="form-seccao__titulo">Factura</h2>

      <div class="form-grelha">
        <Supplier
          v-model:supplier="store.form.supplierId"
          class="fi fi--principal form-grelha__larga"
          label="Fornecedor *"
          :rules="[obrigatorio]"
        />

        <q-input
          v-model="store.form.code"
          class="fi"
          borderless
          label="N.º da factura *"
          hint="Como vem no documento do fornecedor."
          :rules="[obrigatorio]" lazy-rules
        />

        <q-input
          v-model="store.form.date"
          class="fi"
          borderless
          type="date"
          label="Data da factura *"
          hint="A data do documento, não a de hoje. É por ela que o custo médio se ordena."
          :rules="[obrigatorio]" lazy-rules
        />
      </div>
    </section>

    <section class="form-seccao lc">
      <h2 class="form-seccao__titulo">Linhas da factura</h2>

      <div v-if="store.form.items.length" class="lc-tabela-wrap">
        <table class="lc-tabela">
          <thead>
            <tr>
              <th class="lc-c lc-c--artigo" scope="col">Artigo</th>
              <th class="lc-c lc-c--qtd" scope="col">Qtd.</th>
              <th class="lc-c lc-c--un" scope="col">Unidade comprada</th>
              <th class="lc-c lc-c--conteudo" scope="col">Cada uma tem</th>
              <th class="lc-c lc-c--entra" scope="col">Entra em stock</th>
              <th class="lc-c lc-c--custo" scope="col">Custo por unidade</th>
              <th class="lc-c lc-c--subtotal" scope="col">Subtotal</th>
              <th class="lc-c lc-c--lote" scope="col">Lote e validade</th>
              <th class="lc-c lc-c--rm" scope="col"><span class="sr-only">Remover</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(l, i) in store.form.items" :key="i" class="lc-linha">

              <td class="lc-c lc-c--artigo">
                <Product
                  v-model:product="l.productId"
                  :initial-product="l.produto"
                  label=""
                  @select="(a) => aoEscolherArtigo(a, l)"
                />
                <div v-if="l.produto" class="lc-artigo__un">
                  Conta-se em {{ unidadeStockRotulo(l) }}
                </div>
              </td>

              <td class="lc-c lc-c--qtd">
                <input
                  v-model.number="l.quantity"
                  type="number" min="0" step="0.001" inputmode="decimal"
                  class="lc-num"
                  :aria-label="`Quantidade da linha ${i + 1}`"
                />
              </td>

              <td class="lc-c lc-c--un">
                <select
                  v-model="l.unitId"
                  class="lc-un"
                  :aria-label="`Unidade comprada na linha ${i + 1}`"
                  @change="aoTrocarUnidade(l)"
                >
                  <option :value="null">—</option>
                  <option v-for="u in unidades.units" :key="u.id" :value="u.id">
                    {{ u.abbreviation }} · {{ u.name }}
                  </option>
                </select>
              </td>

              <!-- O conteúdo da embalagem, na unidade em que o stock conta o
                   artigo. Uma caixa não tem tamanho na tabela de unidades: só
                   a caixa *deste* artigo tem, e é aqui que se declara. -->
              <td class="lc-c lc-c--conteudo">
                <span v-if="conversao(l).tipo === 'igual'" class="lc-sem-conteudo">
                  a própria unidade
                </span>
                <span v-else-if="conversao(l).tipo === 'tabela'" class="lc-sem-conteudo">
                  <span class="num">{{ numero(conversao(l).factor) }}</span>
                  {{ unidadeStockRotulo(l) }}
                </span>
                <span v-else class="lc-conteudo">
                  <input
                    v-model.number="l.conversionFactor"
                    type="number" min="0" step="0.001" inputmode="decimal"
                    class="lc-num"
                    :aria-label="`Conteúdo de cada unidade comprada na linha ${i + 1}`"
                  />
                  <span class="lc-conteudo__un">{{ unidadeStockRotulo(l) }}</span>
                </span>
              </td>

              <td class="lc-c lc-c--entra">
                <span class="lc-deriv">
                  {{ numero(entraEmStock(l)) }}
                  <span class="lc-deriv__un">{{ unidadeStockRotulo(l) }}</span>
                </span>
              </td>

              <td class="lc-c lc-c--custo">
                <input
                  v-model.number="l.price"
                  type="number" min="0" step="0.01" inputmode="decimal"
                  class="lc-num"
                  :aria-label="`Custo por unidade comprada na linha ${i + 1}`"
                />
              </td>

              <td class="lc-c lc-c--subtotal">
                <span class="lc-deriv">{{ moeda(subtotal(l)) }}</span>
              </td>

              <td class="lc-c lc-c--lote">
                <div class="lc-lote">
                  <input
                    v-model="l.batch"
                    type="text"
                    class="lc-txt"
                    placeholder="Lote"
                    :aria-label="`Lote da linha ${i + 1}`"
                  />
                  <input
                    v-model="l.expiration"
                    type="date"
                    class="lc-txt"
                    :aria-label="`Validade da linha ${i + 1}`"
                  />
                </div>
              </td>

              <td class="lc-c lc-c--rm">
                <button
                  v-if="store.form.items.length > 1"
                  type="button"
                  class="lc-rm"
                  :aria-label="`Remover a linha ${i + 1}`"
                  @click="store.form.items.splice(i, 1)"
                >
                  <q-icon name="las la-times" size="14px" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="lc-vazio">A factura não tem linhas.</p>

      <div class="lc-accoes">
        <q-btn
          flat no-caps dense
          icon="las la-plus"
          label="Acrescentar linha"
          class="btn-icone"
          @click="store.form.items.push(linhaVazia())"
        />
        <q-space />
        <div class="lc-total">
          <span class="lc-total__rotulo">Total da factura</span>
          <span class="lc-total__valor">{{ moeda(total) }}</span>
        </div>
      </div>
    </section>

    <div class="form-actions">
      <span v-if="problema" class="lc-vazio" style="margin-right: auto; padding: 0">
        {{ problema }}
      </span>
      <ResetButton type="button" @click="voltar" />
      <SubmitButton
        :loading="store.loadings.loadingCreate"
        :disable="Boolean(problema || bloqueio)"
        type="submit"
        rotulo="Registar compra"
      />
    </div>
  </q-form>
</template>

<script setup>
/**
 * Registo de uma compra.
 *
 * ── As duas unidades de uma linha ────────────────────────────────────────
 *
 * Comprar não é a mesma coisa que guardar. Compram-se caixas de seringas e
 * guardam-se seringas; compra-se uma caixa de 12 garrafas de 500 ml e
 * guarda-se álcool em mililitros, para depois sair em mililitros ou à
 * garrafa conforme o serviço. A linha tem por isso duas unidades:
 *
 *   a unidade comprada    o que está na factura do fornecedor
 *   o conteúdo de cada    quanto da unidade de stock do artigo vem lá dentro
 *
 * O conteúdo não pode vir da tabela de unidades. Lá, "cx" vale 1 — porque
 * uma caixa, em abstracto, não tem tamanho. Só a caixa *deste* artigo tem,
 * e por isso é por linha que se declara. A coluna "Entra em stock" mostra o
 * produto das duas, que é o que o servidor vai lançar: é aí que um engano de
 * uma ordem de grandeza se vê antes de entrar, e não depois.
 *
 * Há um caso em que o conteúdo é conhecido e não se pergunta: quando as duas
 * unidades são de medida e da mesma família (L e mL, kg e g). Aí o factor da
 * tabela é uma conversão a sério. Entre unidades de contagem não é — "cx",
 * "kit" e "rolo" têm todas factor 1 na tabela, e tratá-lo como conversão
 * daria entradas de uma caixa em vez de cinquenta seringas.
 */
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "src/boot/axios";
import { kwanza, quantidade } from "src/utils/format";
import { linhaVazia, usePurchaseStore } from "src/stores/purchase";
import { useUnitOfMeasureStore } from "src/stores/unit-of-measure";
import Product from "./Product.vue";
import Supplier from "./Supplier.vue";
import ResetButton from "src/components/common/buttons/ResetButton.vue";
import SubmitButton from "src/components/common/buttons/SubmitButton.vue";

const store = usePurchaseStore();
const unidades = useUnitOfMeasureStore();
const route = useRoute();
const router = useRouter();

const obrigatorio = (v) => !!v || "Campo obrigatório";

const moeda = kwanza;
const numero = quantidade;

// ── Unidades ─────────────────────────────────────────────────────────────

const porAbreviatura = (ab) =>
  ab ? unidades.units.find((u) => u.abbreviation === ab) ?? null : null;

const familiaDe = (u) => (u ? u.baseUnitId ?? u.id : null);

const unidadeStock = (l) => porAbreviatura(l.produto?.unitLabel);
const unidadeStockRotulo = (l) => l.produto?.unitLabel ?? "un";

/**
 * O conteúdo de cada unidade comprada:
 *   igual    a unidade comprada é a de stock — não há embalagem a declarar
 *   tabela   as duas são de medida e da mesma família — a conversão é real
 *   livre    tudo o resto — quem regista é que sabe o que vem na caixa
 */
const conversao = (l) => {
  const comprada = unidades.units.find((u) => u.id === l.unitId) ?? null;
  const stock = unidadeStock(l);

  if (!comprada || !stock || comprada.id === stock.id) {
    return { tipo: "igual", factor: 1 };
  }
  if (
    comprada.kind === "measure" &&
    stock.kind === "measure" &&
    familiaDe(comprada) === familiaDe(stock) &&
    Number(stock.factor) > 0
  ) {
    return { tipo: "tabela", factor: Number(comprada.factor) / Number(stock.factor) };
  }
  return { tipo: "livre", factor: Number(l.conversionFactor ?? 1) };
};

const entraEmStock = (l) => Number(l.quantity ?? 0) * conversao(l).factor;
const subtotal = (l) => Number(l.quantity ?? 0) * Number(l.price ?? 0);

const total = computed(() =>
  store.form.items.reduce((soma, l) => soma + subtotal(l), 0),
);

// ── Escolha de artigo ────────────────────────────────────────────────────

/**
 * Ao escolher o artigo, propõe a embalagem e o custo da última compra dele.
 * O custo vinha do `unit_price`, que é o preço de *venda* — semeava o campo
 * do custo com o número errado.
 */
const aoEscolherArtigo = async (artigo, l) => {
  l.produto = artigo;
  l.unitId = artigo ? porAbreviatura(artigo.unitLabel)?.id ?? null : null;
  l.conversionFactor = 1;
  if (!artigo) return;

  try {
    const { data } = await api.get(`purchases/last-item/${artigo.id}`);
    const ultima = data?.data;
    if (!ultima) return;
    if (ultima.unitId) l.unitId = ultima.unitId;
    if (ultima.conversionFactor) l.conversionFactor = Number(ultima.conversionFactor);
    if (l.price == null && ultima.price != null) l.price = Number(ultima.price);
  } catch {
    // Sem histórico o artigo fica na sua própria unidade, que é o caso simples.
  }
};

/** Ao trocar a unidade, o conteúdo anterior deixa de querer dizer o mesmo. */
const aoTrocarUnidade = (l) => {
  const c = conversao(l);
  l.conversionFactor = c.tipo === "livre" ? Number(l.conversionFactor ?? 1) || 1 : 1;
};

// ── Pré-condições ────────────────────────────────────────────────────────

const bloqueio = ref(null);

const carregarPreCondicoes = async () => {
  try {
    const { data } = await api.get("purchases/pre-flight");
    const d = data?.data ?? {};
    if (!d.defaultLocation) {
      bloqueio.value = {
        titulo: "Nenhum departamento recebe as entradas",
        texto:
          "O que se compra entra no departamento marcado para receber as entradas, e não há nenhum marcado. Abra um departamento e ligue «Recebe as entradas das compras».",
        accao: "Ir a Departamentos",
        destino: "inventario-locais",
      };
      return;
    }
    if (Number(d.cashBalance) <= 0) {
      bloqueio.value = {
        titulo: "Sem saldo em caixa",
        texto: `O saldo de ${d.destination} é de ${moeda(d.cashBalance)}. A compra é recusada enquanto o total for superior ao disponível.`,
        accao: "Ir ao fluxo de caixa",
        destino: "fluxo",
      };
    }
  } catch {
    // Sem resposta, não se inventa um bloqueio: o servidor recusa na mesma.
  }
};

// ── Problemas nas linhas ─────────────────────────────────────────────────

const problema = computed(() => {
  const linhas = store.form.items;
  if (!linhas.length) return "Acrescente pelo menos uma linha.";
  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i];
    if (!l.productId) return `A linha ${i + 1} não tem artigo.`;
    if (!(Number(l.quantity) > 0)) return `A linha ${i + 1} não tem quantidade.`;
    if (l.price == null || Number(l.price) < 0) return `A linha ${i + 1} não tem custo.`;
    if (!(conversao(l).factor > 0)) return `A linha ${i + 1} não diz o que vem em cada unidade.`;
  }
  return null;
});

// ── Carregar ─────────────────────────────────────────────────────────────

onMounted(async () => {
  if (!unidades.units.length) await unidades.index();
  carregarPreCondicoes();

  // "Anular e registar de novo" traz as linhas da compra anulada, para não
  // se voltar a escrever a factura inteira à mão.
  const copiar = route.query.copiar;
  if (!copiar) return;
  try {
    const { data } = await api.get(`purchases/${copiar}`);
    const c = data?.data;
    if (!c) return;
    store.form.supplierId = c.supplierId ?? null;
    store.form.code = null;
    store.form.items = (c.items ?? []).map((it) => ({
      productId: it.productId,
      produto: it.product
        ? { id: it.product.id, name: it.product.name, type: it.product.type,
            unitLabel: it.product.unit?.abbreviation ?? null, balance: null }
        : null,
      quantity: Number(it.quantity),
      unitId: it.unitId ?? null,
      conversionFactor: Number(it.conversionFactor ?? 1),
      batch: it.batch ?? null,
      expiration: it.expiration ? String(it.expiration).slice(0, 10) : null,
      price: it.price != null ? Number(it.price) : null,
    }));
    if (!store.form.items.length) store.form.items = [linhaVazia()];
  } catch {
    // A cópia é uma conveniência; sem ela o formulário abre vazio.
  }
});

const voltar = () => router.push({ name: "lista-compras" });

const onSubmit = async () => {
  if (problema.value || bloqueio.value) return;

  // `amount` não vai: o total é somado no servidor a partir destas linhas.
  const payload = {
    supplierId: store.form.supplierId,
    code: store.form.code,
    date: store.form.date,
    items: store.form.items.map((l) => ({
      productId: l.productId,
      quantity: Number(l.quantity),
      unitId: l.unitId || null,
      conversionFactor: conversao(l).factor,
      price: Number(l.price),
      batch: l.batch || null,
      expiration: l.expiration || null,
    })),
  };

  const resultado = await store.create(payload);
  if (resultado?.success) router.push({ name: "lista-compras" });
};
</script>
