<template>
  <q-btn
    square
    no-caps
    color="primary"
    label="Submeter documento"
    @click="onSubmit"
    class="full-width q-mt-md"
    :loading="loading"
    :disable="!isValid"
  />
  <div class="q-mt-md">
    <q-radio v-model="print" val="A4" label="A4" />
    <q-radio v-model="print" val="A5" label="Impressora térmica" />
  </div>
</template>
<script setup>
import { openProtectedFile } from "src/utils/protected-file";
import { ref } from "vue";
import { api } from "src/boot/axios";
import { useFetch } from "src/composables/fetch";
const props = defineProps(["document", "isValid", "total", "amount-received"]);
const emit = defineEmits(["saved"]);
const { store } = useFetch();
const print = ref("A4");
const loading = ref(false);
const onSubmit = async () => {
  try {
    loading.value = true;

    const { data } = await store("documents", props.document);
    loading.value = false;
    emit("saved");
    if (print.value == "A5")
      openProtectedFile(
        api.defaults.baseURL + `/reports/termal/printing/${data.id}`,
        "_blank",
        "noreferrer"
      );
    else
      openProtectedFile(
        api.defaults.baseURL + `/reports/${data.id}`,
        "_blank",
        "noreferrer"
      );
  } catch (error) {}
};
</script>
