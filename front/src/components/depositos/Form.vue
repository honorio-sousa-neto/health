<template>
  <div>
    <q-form @submit.prevent="onSubmit" @reset="onReset">
      <div>
        <div>
          <q-select
            outlined
            v-model="store.form.bankAccountId"
            type="text"
            label="Banco e conta"
            :rules="[required]"
            lazy-rules
            :options="bankStore.data.data"
            option-label="name"
            option-value="id"
            emit-value
            map-options
          />
          <q-input
            outlined
            v-model.number="store.form.amount"
            type="number"
            label="Montante"
            :rules="[required]"
          />
        </div>
      </div>
      <div class="q-mt-sm q-gutter-sm">
        <q-btn
          rounded
          icon="las la-save"
          label="Salvar"
          type="submit"
          color="primary"
          :loading="store.loadings.loadingCreate"
        />
        <q-btn
          label="Limpar"
          rounded
          icon="las la-eraser"
          type="reset"
          color="primary"
          outline
        />
      </div>
    </q-form>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted } from "vue";
import { required } from "src/utils/validation";
import { useRoute } from "vue-router";
import { useBankStore } from "src/stores/bank";
import { useDepositStore } from "src/stores/deposit";

const bankStore = useBankStore();
const store = useDepositStore();
const route = useRoute();

const onSubmit = async () => {
  let payload = {};
  Object.assign(payload, store.form);
  if (route.params.id) {
    await store.update(payload, route.params.id);
  } else {
    await store.create(payload);
  }
};
const onReset = () => {
  store.onReset();
};

const fetchData = async () => {
  try {
    await bankStore.index();
  } catch (error) {}
};

onMounted(() => {
  fetchData();
});
onUnmounted(() => {
  store.onReset();
});
</script>

<style scoped lang="scss">
.custom-btn {
  font-size: smaller;
  color: $primary;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
