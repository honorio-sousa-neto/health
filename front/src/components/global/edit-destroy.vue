<template>
  <q-btn
    flat
    round
    dense
    color="green-10"
    icon="las la-eye"
    @click="$router.push({ name: path, params: { id } })"
  />
  <q-btn
    v-if="!notShow"
    flat
    round
    dense
    color="red-10"
    icon="las la-trash"
    @click="isDeleting = !isDeleting"
  />
  <q-dialog v-model="isDeleting" persistent>
    <q-card style="width: 400px; max-width: 80vw; height: 250px">
      <q-card-section class="fit flex flex-center text-grey-8">
        <div>
          <div class="text-center">
            <q-icon
              color="warning"
              name="las la-exclamation-triangle"
              size="xl"
            />
            <div class="text-h6">Aviso</div>
          </div>
          <div>Tem a certeza que quer eliminar este item?</div>
          <div class="row q-mt-lg justify-center q-gutter-md">
            <q-btn
              :loading="store.loadings.loadingDelete"
              color="red-10"
              icon="las la-trash"
              label="Sim, quero eliminar"
              @click="onDestroy"
              no-caps
            />
            <q-btn
              color="grey-8"
              icon="las la-ban"
              label="Cancelar"
              no-caps
              v-close-popup
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { inject, ref } from "vue";
import { useDynamicStore } from "src/composables/dynamicStore";
const isDeleting = ref(false);
const storeName = inject("store");

const props = defineProps({
  id: {
    type: String,
  },
  path: {
    type: String,
  },
  store: {
    type: String,
  },
  notShow: {
    type: Boolean,
    default: false,
  },
});

const store = useDynamicStore(props.store);
const onDestroy = async () => {
  await store.softDelete(props.id);
};
</script>
