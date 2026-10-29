<template>
  <div v-if="carregando" class="state-box">
    <q-spinner-dots size="32px" />
    <div class="state-text">A carregar a compra…</div>
  </div>

  <p v-else-if="!compra" class="lc-vazio">Compra não encontrada.</p>

  <div v-else class="vc">

    <div v-if="compra.deletedAt" class="aviso">
      <q-icon class="aviso__icone" name="las la-undo" size="18px" />
      <div class="aviso__corpo">
        <div class="aviso__titulo">Compra anulada</div>
        <div>
          O stock foi estornado e o valor devolvido ao caixa em
          {{ data(compra.deletedAt) }}. Fica aqui para consulta.
        </div>
      </div>
    </div>

    <section class="form-seccao">
      <h2 class="form-seccao__titulo">Factura</h2>

      <div class="vc-campos">
        <div class="vc-campo" style="grid-column: 1 / -1">
          <div class="vc-campo__rotulo">Fornecedor</div>
          <div class="vc-campo__valor vc-campo__valor--principal">
            {{ compra.Supplier?.name ?? "Sem fornecedor" }}
          </div>
        </div>

        <div class="vc-campo">
          <div class="vc-campo__rotulo">N.º da factura</div>
          <div class="vc-campo__valor">{{ compra.code || "—" }}</div>
        </div>

        <div class="vc-campo">
          <div class="vc-campo__rotulo">Data da factura</div>
          <div class="vc-campo__valor">{{ data(compra.date ?? compra.createdAt) }}</div>
        </div>

        <div class="vc-campo">
          <div class="vc-campo__rotulo">Registada em</div>
          <div class="vc-campo__valor">{{ data(compra.createdAt) }}</div>
        </div>

        <div class="vc-campo">
          <div class="vc-campo__rotulo">Total</div>
          <div class="vc-campo__valor vc-campo__valor--principal">{{ moeda(compra.amount) }}</div>
        </div>
      </div>
    </section>

    <section class="form-seccao lc">
      <h2 class="form-seccao__titulo">Linhas da factura</h2>

      <div v-if="(compra.items ?? []).length" class="lc-tabela-wrap">
        <table class="lc-tabela">
          <thead>
            <tr>
              <th class="lc-c lc-c--artigo" scope="col">Artigo</th>
              <th class="lc-c lc-c--qtd" scope="col">Qtd.</th>
              <th class="lc-c lc-c--un" scope="col">Unidade comprada</th>
              <th class="lc-c lc-c--conteudo" scope="col">Cada uma tinha</th>
              <th class="lc-c lc-c--entra" scope="col">Entrou em stock</th>
              <th class="lc-c lc-c--custo" scope="col">Custo por unidade</th>
              <th class="lc-c lc-c--subtotal" scope="col">Subtotal</th>
              <th class="lc-c lc-c--lote" scope="col">Lote e validade</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(it, i) in compra.items" :key="i" class="lc-linha">
              <td class="lc-c lc-c--artigo">
                <div>{{ it.product?.name ?? "Artigo removido" }}</div>
                <div class="lc-artigo__un">Conta-se em {{ unStock(it) }}</div>
              </td>
              <td class="lc-c lc-c--qtd">
                <span class="lc-deriv">{{ numero(it.quantity) }}</span>
              </td>
              <td class="lc-c lc-c--un">{{ it.unit?.abbreviation ?? unStock(it) }}</td>
              <td class="lc-c lc-c--conteudo">
                <span v-if="Number(it.conversionFactor ?? 1) === 1" class="lc-sem-conteudo">
                  a própria unidade
                </span>
                <span v-else>
                  <span class="num">{{ numero(it.conversionFactor) }}</span> {{ unStock(it) }}
                </span>
              </td>
              <td class="lc-c lc-c--entra">
                <span class="lc-deriv">
                  {{ numero(entrou(it)) }}
                  <span class="lc-deriv__un">{{ unStock(it) }}</span>
                </span>
              </td>
              <td class="lc-c lc-c--custo">
                <span class="lc-deriv">{{ moeda(it.price) }}</span>
              </td>
              <td class="lc-c lc-c--subtotal">
                <span class="lc-deriv">{{ moeda(Number(it.quantity ?? 0) * Number(it.price ?? 0)) }}</span>
              </td>
              <td class="lc-c lc-c--lote">
                <div>{{ it.batch || "—" }}</div>
                <div class="lc-artigo__un">{{ it.expiration ? data(it.expiration) : "sem validade" }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="lc-vazio">Esta compra não tem linhas.</p>
    </section>

    <!-- Uma compra gravada não se edita: editá-la implicaria estornar e
         reaplicar stock e caixa, e o servidor recusa-o. O caminho existe e é
         este — anular e voltar a registar, com as linhas já copiadas. -->
    <div class="vc-accoes">
      <q-btn flat no-caps label="Voltar à lista" class="btn-icone" @click="voltar" />
      <q-space />
      <q-btn
        flat no-caps
        icon="las la-copy"
        label="Registar outra igual"
        class="btn-icone"
        @click="copiar"
      />
      <AnularCompra v-if="!compra.deletedAt" :id="compra.id" modo="texto" @anulada="recarregar" />
    </div>
  </div>
</template>

<script setup>
/**
 * Uma compra gravada, por extenso e só de leitura.
 *
 * O ecrã anterior dizia "Editar compra · Actualizar registo de compra",
 * carregava tudo em campos editáveis e, ao gravar, recebia sempre a mesma
 * recusa do servidor: a edição implicaria estornar e reaplicar stock e
 * caixa, e não está implementada. Era um beco com sinalização.
 */
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "src/boot/axios";
import { kwanza, quantidade } from "src/utils/format";
import AnularCompra from "./AnularCompra.vue";

const route = useRoute();
const router = useRouter();

const compra = ref(null);
const carregando = ref(true);

const moeda = kwanza;
const numero = quantidade;

const data = (v) =>
  v
    ? new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "long", year: "numeric" })
        .format(new Date(v))
    : "—";

const unStock = (it) => it.product?.unit?.abbreviation ?? "un";
const entrou = (it) => Number(it.quantity ?? 0) * Number(it.conversionFactor ?? 1);

const recarregar = async () => {
  carregando.value = true;
  try {
    const { data: resposta } = await api.get(`purchases/${route.params.id}`);
    compra.value = resposta?.data ?? null;
  } catch {
    compra.value = null;
  } finally {
    carregando.value = false;
  }
};

onMounted(recarregar);

const voltar = () => router.push({ name: "lista-compras" });
const copiar = () =>
  router.push({ name: "nova-compra", query: { copiar: route.params.id } });
</script>
