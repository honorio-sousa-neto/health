<template>
  <Breadcrumbs>
    <template #children>
      <q-breadcrumbs-el
        label="Grupos"
        active-class="text-h6 text-weight-regular text-teal-8"
        class="text-grey"
        :to="{ name: 'list-grupos' }"
      />
      <q-breadcrumbs-el
        :label="service.name"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{ name: 'editar-grupo', params: { id: service.id } }"
      />
    </template>
  </Breadcrumbs>
  <div class="q-pa-md">
    <!-- <div class="row justify-end">
      <div
        class="custom__link"
        @click="$router.push({ name: 'subgrupos', params: { id: service.id } })"
      >
        Adicionar subgrupos
      </div>
    </div> -->
    <Form @create="onCreate" :loading @get-name="setName" />
  </div>
</template>
<script setup>
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import { useCreateUpdate } from "src/composables/create-update";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Form from "./components/Form.vue";

const { update } = useCreateUpdate("groups");
const router = useRouter();
const route = useRoute();
const onCreate = async (payload) => {
  const data = await update(payload, route.params.id);
  if (data) router.go(-1);
};
const service = ref({ name: null, id: null });
const setName = (payload) => {
  console.log(payload);
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
