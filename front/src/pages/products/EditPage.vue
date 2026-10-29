<template>
  <div>
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="las la-arrow-left" class="btn-icone q-mr-sm"
        @click="$router.go(-1)" />
      <div>
        <div class="ep-nome">{{ product.name || 'Produto' }}</div>
        <div class="ep-sub">Ficha do produto</div>
      </div>
      <q-space />
      <ExportarArtigo base-path="products" :registo-id="product.id" />
    </div>

    <div class="form-card">
      <Form @create="onCreate" :loading @get-name="setName" @cancel="$router.go(-1)" />

      <AbasFicha
        base-path="products"
        entity-id-key="productId"
        :registo-id="product.id"
        :registo-nome="product.name || ''"
        :exame="product.exam"
      />
    </div>
  </div>
</template>

<script setup>
import { useCreateUpdate } from "src/composables/create-update";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Form from "./components/Form.vue";
import AbasFicha from "src/components/common/forms/AbasFicha.vue";
import ExportarArtigo from "src/components/common/buttons/ExportarArtigo.vue";

const { update, loading } = useCreateUpdate("products");
const router = useRouter();
const route = useRoute();

const onCreate = async (data) => {
  const { category, id, createdAt, updatedAt, deletedAt, real_price, consumables, ...rest } = data;
  const response = await update(rest, route.params.id);
  if (response) router.push({ name: "list-products" });
};

const product = ref({ name: null, id: null, exam: null });
const setName = (payload) => Object.assign(product.value, payload);
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
