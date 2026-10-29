<template>
  <div>
    <div class="row items-center q-mb-lg">
      <q-btn
        flat round dense
        icon="las la-arrow-left"
        class="btn-icone q-mr-sm"
        aria-label="Voltar"
        @click="$router.go(-1)"
      />
      <div>
        <div class="text-h6 text-weight-semibold">{{ titulo }}</div>
        <div class="pagina-sub">{{ subtitulo }}</div>
      </div>
    </div>

    <VistaCompra v-if="verCompra" />
    <Form v-else />
  </div>
</template>

<script setup>
/**
 * Compra nova ou compra gravada — e são coisas diferentes.
 *
 * Com id, abre em leitura: o servidor recusa editar uma compra, porque
 * editá-la implicaria estornar e reaplicar stock e caixa. Sem id, abre o
 * formulário de registo.
 */
import { computed } from "vue";
import { useRoute } from "vue-router";
import Form from "./components/Form.vue";
import VistaCompra from "./components/VistaCompra.vue";

const route = useRoute();
const verCompra = computed(() => !!route.params.id);

const titulo = computed(() => (verCompra.value ? "Compra" : "Nova compra"));
const subtitulo = computed(() =>
  verCompra.value
    ? "Registo gravado. Para corrigir, anule e registe de novo."
    : "Entrada de stock e saída de caixa, a partir da factura do fornecedor.",
);
</script>

<style scoped lang="scss">
.pagina-sub {
  font-size: var(--fs-label);
  color: var(--text-muted);
}
</style>
