<template>
  <div>
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="las la-arrow-left" class="btn-icone q-mr-sm"
        @click="$router.go(-1)" />
      <div>
        <div class="ep-nome">{{ service.name || 'Serviço' }}</div>
        <div class="ep-sub">Ficha do serviço</div>
      </div>
      <q-space />
      <ExportarArtigo base-path="services" :registo-id="service.id" />
    </div>

    <div class="form-card">
      <Form @create="onCreate" :loading @get-name="setName" @cancel="$router.go(-1)" />

      <AbasFicha
        base-path="services"
        entity-id-key="serviceId"
        :registo-id="service.id"
        :registo-nome="service.name || ''"
        :exame="service.exam"
      />
    </div>
  </div>
</template>

<script setup>
/**
 * Serviço e produto são o mesmo registo com outro `type`, e é por isso que o
 * construtor do formulário de resultados aceita o id de qualquer um dos dois.
 * Havia aqui um botão que saltava para a ficha de produto só para o abrir, e
 * outro que ia a uma página própria mapear os consumíveis; ambos passaram a
 * abas por baixo dos campos, que é onde a configuração pertence.
 */
import { useCreateUpdate } from "src/composables/create-update";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Form from "./components/Form.vue";
import AbasFicha from "src/components/common/forms/AbasFicha.vue";
import ExportarArtigo from "src/components/common/buttons/ExportarArtigo.vue";

const { loading, update } = useCreateUpdate("services");
const router = useRouter();
const route = useRoute();

const onCreate = async (payload) => {
  const { category, id, createdAt, updatedAt, deletedAt, consumables, ...rest } = payload;
  const data = await update(rest, route.params.id);
  if (data) router.push({ name: "list-services" });
};

const service = ref({ name: null, id: null, exam: null });
const setName = (payload) => Object.assign(service.value, payload);
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
