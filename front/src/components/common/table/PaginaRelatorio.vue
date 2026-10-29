<template>
  <section class="lp">
    <!-- O mesmo cabeçalho da `ListaPagina`, e de propósito: um relatório e
         uma listagem são a mesma página com conteúdos diferentes. O que muda
         é o corpo — aqui cabe mais do que uma tabela. -->
    <header class="lp-head">
      <div class="lp-head__linha">
        <div class="lp-head__id">
          <h1 class="lp-titulo">{{ tituloEfectivo }}</h1>
          <span v-if="contexto" class="lp-contexto">{{ contexto }}</span>
        </div>

        <div class="lp-accoes">
          <slot name="accoes" />
        </div>
      </div>

      <p v-if="apoio" class="lp-apoio">{{ apoio }}</p>
    </header>

    <div class="lp-corpo">
      <slot v-if="temConteudo" />

      <EstadoDados
        :carregando="carregando"
        :erro="erro"
        :vazio="vazio"
        :repetivel="true"
        texto-carregar="A calcular…"
        texto-erro="Não foi possível calcular o relatório."
        :texto-vazio="textoVazio"
        :icone-vazio="iconeVazio"
        tamanho-icone="40px"
        @repetir="$emit('recarregar')"
      />
    </div>

    <footer v-if="$slots.rodape" class="lp-rodape">
      <slot name="rodape" />
    </footer>
  </section>
</template>

<script setup>
/**
 * A casca de uma página de relatório.
 *
 * Um relatório não é uma listagem: tem várias tabelas, ou uma tabela e um
 * total, e não se pagina. Mas é a mesma página — mesmo cabeçalho, mesmos
 * estados, mesmas tabelas por dentro (`.lp-tabela`, `.lp-c`).
 *
 * Antes desta, cada relatório trazia o seu cabeçalho, o seu estado vazio e a
 * sua tabela, e não havia dois iguais.
 */
import { computed } from "vue";
import { useRoute } from "vue-router";
import EstadoDados from "../EstadoDados.vue";

const props = defineProps({
  titulo: { type: String, default: "" },
  contexto: { type: String, default: "" },
  apoio: { type: String, default: "" },
  carregando: { type: Boolean, default: false },
  erro: { type: [Boolean, Object, String], default: false },
  /** Nada a mostrar — por não haver dados, ou por ainda não se ter gerado. */
  vazio: { type: Boolean, default: false },
  textoVazio: { type: String, default: "Sem dados para este período." },
  iconeVazio: { type: String, default: "las la-chart-bar" },
});

defineEmits(["recarregar"]);

const route = useRoute();
const tituloEfectivo = computed(() => props.titulo || route.meta?.title || "");

const temConteudo = computed(
  () => !props.carregando && !props.erro && !props.vazio,
);
</script>
