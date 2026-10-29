<template>
  <ListaPagina
    titulo="Compras"
    :contexto="contexto"
    apoio="Cada compra entra no stock e sai do caixa. Para corrigir uma, anule-a e registe de novo."
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="!!pagination.search"
    texto-vazio="Ainda não há compras registadas."
    @recarregar="fetchAll"
  >
    <template #accoes>
      <NewRegist to="nova-compra" rotulo="Nova compra" />
    </template>

    <template #linha-accoes="{ linha }">
      <q-item v-close-popup clickable @click="$router.push({ name: 'ver-compra', params: { id: linha.id } })">
        <q-item-section avatar><q-icon name="las la-eye" size="18px" /></q-item-section>
        <q-item-section>Ver compra</q-item-section>
      </q-item>
      <AnularCompra modo="item" :id="linha.id" @anulada="fetchAll" />
    </template>
  </ListaPagina>
</template>

<script setup>
/**
 * A lista de compras.
 *
 * Tinha um botão de editar que levava a um ecrã que o servidor recusa gravar,
 * e um botão de eliminar que — sob o rótulo "Eliminar registo · esta acção é
 * irreversível" — estornava o stock e devolvia o dinheiro ao caixa. São
 * agora "Ver compra" e "Anular compra", que é o que cada um faz.
 */
import { computed } from "vue";
import NewRegist from "src/components/common/buttons/NewRegist.vue";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import AnularCompra from "./components/AnularCompra.vue";
import { useCommom } from "src/composables/commom";
import { kwanza } from "src/utils/format";

const { loading, data, pagination, fetchAll } = useCommom("purchases");

const contexto = computed(() =>
  pagination.search ? `a filtrar por \u201c${pagination.search}\u201d` : "",
);

const colunas = [
  {
    name: "supplier", label: "Fornecedor",
    field: (linha) => linha.Supplier?.name ?? null,
    align: "left", ordenavel: true,
    format: (v) => v ?? "Sem fornecedor",
  },
  { name: "code", label: "N.º da factura", field: "code", align: "left" },
  {
    name: "date", label: "Data", field: (linha) => linha.date ?? linha.createdAt,
    align: "left", ordenavel: true,
    format: (v) =>
      v
        ? new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
            .format(new Date(v))
        : "\u2014",
  },
  {
    name: "items", label: "Linhas", field: (linha) => linha._count?.items ?? 0,
    numerico: true,
  },
  {
    name: "amount", label: "Total", field: "amount",
    numerico: true, ordenavel: true, format: (v) => kwanza(v),
  },
  { name: "actions", label: "Acções", align: "right" },
];
</script>
