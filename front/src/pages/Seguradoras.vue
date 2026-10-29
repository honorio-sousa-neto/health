<template>
  <q-page padding>
    <q-card flat class="my-card q-py-md">
      <div>
        <q-btn
          color="primary"
          icon="add"
          no-caps
          rounded
          @click="dialog = true"
          label="Nova seguradora"
        />
        <div class="q-my-md">
          <List
            :rows="rows"
            :loading="loading"
            @destroy="
              (id) => {
                toEdit = id;
                confirm = true;
              }
            "
            @update="update"
          />
        </div>
      </div>
    </q-card>

    <q-dialog v-model="dialog" persistent>
      <q-card square style="min-width: min(470px, 92vw); max-width: 80vw">
        <q-card-section class="row justify-between items-center q-pb-none">
          <div class="text-h6 text-weight-regular">Novo serviço</div>
          <q-btn color="primary" round icon="close" flat v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <Form @saved="fetchData" :id="toEdit" />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="confirm" persistent>
      <q-card square style="min-width: min(300px, 92vw); max-width: 80vw">
        <q-card-section class="row justify-between items-center q-pb-none">
          <div class="text-h6 text-weight-regular">Eliminar item</div>
          <q-btn color="primary" round icon="close" flat v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div>Tem a certeza que quer eliminar este item?</div>
          <div class="q-gutter-sm q-my-sm">
            <q-btn
              color="red"
              rounded
              label="Sim, tenho a certeza"
              no-caps
              @click="remove"
              :loading="load"
            />
            <q-btn
              color="grey"
              rounded
              label="Não, cancelar"
              no-caps
              v-close-popup
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script setup>
import List from "src/components/seguradoras/List.vue";
import Form from "src/components/seguradoras/Form.vue";

import { ref, onMounted, watch } from "vue";
import { useFetch } from "src/composables/fetch";
const { index, destroy } = useFetch();

const dialog = ref(false);
const confirm = ref(false);
const loading = ref(false);
const load = ref(false);

const rows = ref([]);
async function fetchData() {
  try {
    dialog.value = false;
    loading.value = true;
    const { data, message, status } = await index("insurances");
    rows.value = data;
    loading.value = false;
  } catch (error) {
    console.log(error.message);
  }
}

async function remove() {
  try {
    load.value = true;

    const { data, error, message } = await destroy("insurances", toEdit.value);
    load.value = false;
    confirm.value = false;
    fetchData();
    // console.log('>>>> OK')
  } catch (error) {}
}

const toEdit = ref(null);
async function update(id) {
  try {
    toEdit.value = id;
    dialog.value = true;
  } catch (error) {}
}

watch(confirm, (current) => {
  if (!current) {
    toEdit.value = null;
  }
});

watch(dialog, (current) => {
  if (!current) {
    toEdit.value = null;
  }
});

onMounted(() => {
  fetchData();
});
</script>
