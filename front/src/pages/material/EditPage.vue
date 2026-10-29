<template>
  <div>
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="las la-arrow-left" class="btn-icone q-mr-sm"
        @click="$router.go(-1)" />
      <div>
        <div class="ep-nome">{{ material.name || 'Consumível' }}</div>
        <div class="ep-sub">Ficha do consumível</div>
      </div>
      <q-space />
      <q-btn
        flat no-caps dense
        icon="las la-boxes"
        label="Existências"
        class="btn-icone"
        @click="$router.push({ name: 'stock-material', params: { id: $route.params.id } })"
      >
        <q-tooltip>Ver e ajustar o stock deste material</q-tooltip>
      </q-btn>
    </div>

    <div class="form-card">
      <Form @create="onCreate" :loading @get-name="setName" @cancel="$router.go(-1)" />
    </div>
  </div>
</template>

<script setup>
/**
 * Sem as abas de consumo padrão e parâmetros de exame que a ficha do produto
 * e a do serviço têm: um consumível é o que se gasta, não o que se realiza.
 * Não consome nada nem produz resultado.
 */
import { useCreateUpdate } from "src/composables/create-update";
import Form from "./components/Form.vue";
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";

const { loading, update } = useCreateUpdate("materials");
const router = useRouter();
const route = useRoute();

const onCreate = async (payload) => {
  const data = await update(payload, route.params.id);
  if (data) router.push({ name: "lista-materials" });
};

const material = ref({ name: null, id: null });
const setName = (payload) => Object.assign(material.value, payload);
</script>

<style scoped lang="scss">
.ep-nome {
  font-size: var(--fs-heading);
  font-weight: var(--fw-semi);
  line-height: var(--lh-tight);
  color: var(--text);
}

.ep-sub {
  font-size: var(--fs-label);
  line-height: var(--lh-tight);
  color: var(--text-muted);
}
</style>
