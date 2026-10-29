<template>
  <ListaPagina
    titulo="Clientes da seguradora"
    :contexto="contexto"
    apoio="Quem está coberto por esta apólice. O número de seguro é o que vai na factura."
    :colunas="colunas"
    :linhas="linhas"
    :carregando="store.loading"
    :paginacao="paginacao"
    :filtrado="!!paginacao.search"
    texto-vazio="Nenhum cliente está vinculado a esta seguradora."
    @recarregar="carregar"
  >
    <template #accoes>
      <q-btn
        unelevated no-caps
        icon="las la-user-plus"
        label="Vincular cliente"
        class="btn-primaria"
        @click="dialogo = true"
      />
    </template>

    <template #linha-accoes="{ linha }">
      <q-item v-close-popup clickable class="item-destrutivo" @click="desvincular(linha)">
        <q-item-section avatar><q-icon name="las la-user-minus" size="18px" /></q-item-section>
        <q-item-section>Desvincular cliente</q-item-section>
      </q-item>
    </template>
  </ListaPagina>

  <q-dialog v-model="dialogo" persistent>
    <q-card class="cs-vincular">
      <q-card-section class="row items-center q-pb-none">
        <div class="cs-vincular__titulo">Vincular cliente</div>
        <q-space />
        <q-btn flat round dense icon="las la-times" class="btn-icone" v-close-popup />
      </q-card-section>
      <q-card-section>
        <AttachCustomer :insurance-id="route.params.id" @close="aoVincular" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
/**
 * Os clientes de uma seguradora.
 *
 * Vêm todos dentro do registo da seguradora, não paginados no servidor — a
 * paginação e a pesquisa são locais. A `Pagination` que aqui estava era
 * alimentada por um `useCommom("insurances")` que listava seguradoras, não
 * clientes: os botões existiam e não mexiam nesta lista.
 */
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import AttachCustomer from "./components/AttachCustomer.vue";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { usePaginacaoLocal } from "src/composables/paginacao-local";
import { useInsuranceStore } from "src/stores/insurance";
import { showNotify } from "src/utils/notify";

const store = useInsuranceStore();
const route = useRoute();
const dialogo = ref(false);

const todos = computed(() => store.data?.insurance?.customersInsurance ?? []);
const { paginacao, linhas } = usePaginacaoLocal(todos, [
  (l) => l.customer?.name,
  (l) => l.customer?.nif,
  "insuranceNumber",
]);

const contexto = computed(() =>
  paginacao.search ? `a filtrar por \u201c${paginacao.search}\u201d` : "",
);

const colunas = [
  {
    name: "name", label: "Nome",
    field: (linha) => linha.customer?.name ?? null, align: "left", ordenavel: true,
  },
  { name: "insuranceNumber", label: "Número de seguro", field: "insuranceNumber", align: "left" },
  {
    name: "nif", label: "NIF",
    field: (linha) => linha.customer?.nif ?? null, align: "left", numerico: true,
  },
  { name: "actions", label: "Acções", align: "right" },
];

const carregar = () => store.indexCustomers(route.params.id);
onMounted(carregar);

const aoVincular = () => {
  dialogo.value = false;
  carregar();
};

// Desvincular ainda não tem endpoint. Dizê-lo é melhor do que um botão que
// parece funcionar e não faz nada.
const desvincular = () =>
  showNotify("Desvincular um cliente ainda não está disponível.", false);
</script>

<style scoped lang="scss">
.cs-vincular {
  width: 520px;
  max-width: 92vw;
  border-radius: var(--r-panel);
  background: var(--camada-flutuante);
}

.cs-vincular__titulo {
  font-size: var(--fs-title);
  font-weight: var(--fw-semi);
  color: var(--text);
}
</style>
