<template>
  <Breadcrumbs>
    <template #children>
      <q-breadcrumbs-el
        label="Secção"
        active-class="text-h6 text-weight-regular text-teal-8"
        class="text-grey"
        :to="{ name: 'lista-seccao' }"
      />
      <q-breadcrumbs-el
        :label="currentSection.name"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{ name: 'editar-seccao' }"
      />
    </template>
  </Breadcrumbs>
  <div class="q-px-md">
    <div class="row q-gutter-md">
      <div class="q-py-sm">
        <q-btn
          color="grey"
          icon="las  la-pen"
          round
          dense
          size="sm"
          flat
          @click="confirm = !confirm"
        />
        Editar secção
      </div>
    </div>
    <q-slide-transition>
      <div v-show="confirm" class="q-pb-sm">
        <Form @create="onCreate" @set-name="onSetName" />
      </div>
    </q-slide-transition>
    <DataTable v-model:selected="selected" :columns :rows="data" title="Secção">
      <template #action>
        <div class="row full-width items-center justify-between">
          <SearchInput
            v-model:search="pagination.search"
            @fetch="fetchAll"
            debounce="700"
          />
          <NewRegist to="criar-exame" />
        </div>
      </template>
      <template #buttons="{ props }">
        <div class="row justify-end">
          <EditButton
            @click="
              $router.push({
                name: 'criar-exame',
                params: { id: props.row.id },
              })
            "
          />
          <DeleteButton
            :loading="loading"
            :id="props.row.id"
            @delete="onDestroy"
          />
        </div>
      </template>
    </DataTable>
    <Pagination
      v-model:perpage="pagination.perPage"
      v-model:page="pagination.page"
      @fetch="fetchAll"
      :total-pages="pagination.totalPages"
    />
    <!-- <div class="q-my-md">
      <List />
    </div> -->
  </div>
</template>
<script setup>
import { useSectionStore } from "src/stores/section";
import Form from "./components/Form.vue";
import List from "./components/List.vue";
import { onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import DataTable from "src/components/common/table/DataTable.vue";
import Pagination from "src/components/common/pagination/Pagination.vue";
import SearchInput from "src/components/common/table/SearchInput.vue";
import NewRegist from "src/components/common/buttons/NewRegist.vue";
import EditButton from "src/components/common/buttons/EditButton.vue";
import DeleteButton from "src/components/common/buttons/DeleteButton.vue";
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import { useCreateUpdate } from "src/composables/create-update";
import { useCommom } from "src/composables/commom";
const route = useRoute();
const { update } = useCreateUpdate("sections");
const { pagination, data } = useCommom("exams/section/" + route.params.id);

const confirm = ref(false);
const store = useSectionStore();

const columns = [
  { name: "name", label: "Nome", field: "name", align: "left" },

  // {
  //   name: "phone",
  //   label: "Contacto telefónico",
  //   field: "phone",
  //   align: "center",
  // },

  // {
  //   name: "username",
  //   label: "Nome de usuário",
  //   field: "username",
  //   align: "left",
  // },
  { name: "actions", label: "Acções", align: "right" },
];

const currentSection = reactive({
  name: null,
  id: null,
});

watch(confirm, async (current) => {
  if (current) {
    await store.show(route.params.id);
  }
});

const loading = ref(false);
const onCreate = async (form) => {
  loading.value = true;
  const data = await update(form, route.params.id);
  loading.value = false;
};

const onSetName = (payload) => {
  Object.assign(currentSection, payload);
};
</script>
