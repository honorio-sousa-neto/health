<template>
  <Breadcrumbs>
    <template #children>
      <q-breadcrumbs-el
        label="Produtos"
        active-class="text-h6 text-weight-regular text-teal-8"
        class="text-grey"
        :to="{ name: 'list-products' }"
      />
      <q-breadcrumbs-el
        :label="service.name"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{ name: 'editar-produto', params: { id: service.id } }"
      />
    </template>
  </Breadcrumbs>
  <div class="q-pa-md">
    <!-- <div
      class="row justify-end custom__link"
      @click="
        $router.push({
          name: 'mapear-insumo',
          params: { id: $route.params.id },
        })
      "
    >
      Mapear insumos
    </div> -->
    <Form @create="onCreate" :loading @get-name="setName" />
  </div>
</template>
<script setup>
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import Form from "./components/Form.vue";
import { useCreateUpdate } from "src/composables/create-update";
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";

const { loading, update } = useCreateUpdate("services");
const router = useRouter();
const route = useRoute();
const onCreate = async (payload) => {
  const { category, ...rest } = payload;
  const data = await update(rest, route.params.id);
  if (data) router.go(-1);
};
const service = ref({ name: null, id: null });
const setName = (payload) => {
  service.value = payload;
};
</script>

<style scoped lang="scss">
.custom__link {
  color: $teal;
  transition: all 0.7s ease-out;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
