<template>
  <Breadcrumbs>
    <template #children>
      <q-breadcrumbs-el
        label="Materiais"
        active-class="text-h6 text-weight-regular text-teal-8"
        class="text-grey"
        :to="{ name: 'lista-materials' }"
      />
      <q-breadcrumbs-el
        label="Actualizar estoque"
        active-class="text-h6 text-weight-regular text-teal-8"
        class="text-grey"
      />
      <q-breadcrumbs-el
        :label="service.name"
        active-class="text-h6 text-weight-regular text-teal-8"
        :to="{ name: 'stock-material', params: { id: service.id } }"
      />
    </template>
  </Breadcrumbs>
  <div class="q-pa-md">
    <div class="text-subtitle1 q-mb-md">
      Quantidade atual: <span class="text-bold">{{ service.currentQuantity ?? 0 }}</span>
    </div>
    <q-separator />
    <div class="q-py-md">
      <div class="text-bold q-mb-sm">Atualizar estoque</div>
      <q-form @submit="updateStock" @reset="onReset">
        <q-radio v-model="form.type" val="ENTRY" color="teal" label="Entrada" />
        <q-radio v-model="form.type" val="OUT" color="teal" label="Saída" />
        <div class="row q-gutter-md">
          <q-input
            v-model.number="form.quantity"
            type="number"
            label="Quantidade"
            standout="bg-teal text-white"
            class="col"
            :rules="[required]"
            lazy-rules
          />
          <div class="self-center">
            <q-btn
              color="teal"
              icon="las la-save"
              label="Actualizar"
              type="submit"
              :loading="saving"
            />
          </div>
        </div>
      </q-form>
    </div>
  </div>
</template>
<script setup>
import Breadcrumbs from "src/components/common/pagination/Breadcrumbs.vue";
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useCreateUpdate } from "src/composables/create-update";
import { api } from "src/boot/axios";
import { required } from "src/utils/validation";
import { Notify } from "quasar";

const { fetchOne } = useCreateUpdate("materials");
const route = useRoute();
const saving = ref(false);

let service = reactive({
  id: null,
  name: null,
  currentQuantity: 0,
});

let form = reactive({
  quantity: null,
  type: "ENTRY",
});

const loadService = async () => {
  if (route.params.id) {
    const data = await fetchOne(route.params.id);
    Object.assign(service, {
      id: data.id,
      name: data.name,
      currentQuantity: data.currentQuantity ?? 0,
    });
  }
};

onMounted(loadService);

const updateStock = async () => {
  saving.value = true;
  try {
    const { data } = await api.patch(
      `materials/update/stock/${route.params.id}`,
      form
    );
    if (data.success) {
      Notify.create({ message: data.message ?? "Estoque actualizado", color: "green-8" });
      onReset();
      await loadService();
    }
  } finally {
    saving.value = false;
  }
};

const onReset = () => {
  form.quantity = null;
  form.type = "ENTRY";
};
</script>
