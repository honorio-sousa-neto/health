<template>
  <div class="abas">
    <q-tabs
      v-model="aba"
      class="abas__barra"
      active-class="abas__tab--activa"
      indicator-color="transparent"
      no-caps
      dense
      align="left"
      inline-label
    >
      <q-tab name="consumo" icon="las la-clipboard-list" label="Consumo padrão" class="abas__tab" />
      <q-tab name="exame" icon="las la-flask" label="Parâmetros de exame" class="abas__tab" />
    </q-tabs>

    <q-tab-panels v-model="aba" animated class="abas__painéis">
      <q-tab-panel name="consumo" class="abas__painel">
        <AttachForm
          :base-path="basePath"
          :entity-id-key="entityIdKey"
          :loading="aGravar"
          @create="gravarConsumo"
        />
      </q-tab-panel>

      <q-tab-panel name="exame" class="abas__painel">
        <ExamFormBuilder
          v-if="registoId"
          :product-id="registoId"
          :product-name="registoNome"
          :exam="exame"
        />
        <p v-else class="abas__vazio">
          Guarde a ficha primeiro; os parâmetros de exame ligam-se ao registo.
        </p>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
/**
 * As duas coisas que se configuram num artigo depois de ele existir: o que
 * consome por omissão, e que parâmetros de resultado tem se for exame.
 *
 * Viviam em sítios diferentes — o consumo numa página própria alcançada por
 * um botão no cabeçalho, os parâmetros numa coluna ao lado do formulário — e
 * nenhuma das duas tem relação com o preenchimento dos campos. Abaixo dos
 * campos e em abas: primeiro identifica-se o artigo, depois configura-se.
 */
import { ref } from "vue";
import { useCreateUpdate } from "src/composables/create-update";
import AttachForm from "src/pages/services/components/AttachForm.vue";
import ExamFormBuilder from "src/pages/products/components/ExamFormBuilder.vue";

const props = defineProps({
  /** "services" ou "products" — o recurso a que o registo pertence. */
  basePath: { type: String, required: true },
  entityIdKey: { type: String, required: true },
  registoId: { type: String, default: null },
  registoNome: { type: String, default: "" },
  exame: { type: Object, default: null },
});

const aba = ref("consumo");

const { create, loading: aGravar } = useCreateUpdate(`${props.basePath}/materials/attach`);
const gravarConsumo = async (payload) => { await create(payload); };
</script>
