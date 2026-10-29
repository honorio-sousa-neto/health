<template>
  <q-form @submit="onSubmit" @reset="onReset">
    <div class="q-gutter-sm">
      <SelectCustomer v-model="form.customer" />
      <SelectIntern v-model:intern="form.intern" />
      <SelectAggregate
        v-if="form.intern && form.intern?.type === 'familiar'"
        v-model="form.members"
      />
      <InputDate
        :current-end="form.endDate"
        :current-start="form.startDate"
        v-model:end="form.endDate"
        v-model:start="form.startDate"
      />
    </div>
    <div class="q-mt-md q-gutter-md">
      <SubmitButton :loading="loading" type="submit" />
      <ResetButton type="reset" />
    </div>
  </q-form>
</template>
<script setup>
import ResetButton from "src/components/common/buttons/ResetButton.vue";
import SubmitButton from "src/components/common/buttons/SubmitButton.vue";
import InputDate from "src/components/common/forms/InputDate.vue";
import { useCreateUpdate } from "src/composables/create-update";
import SelectAggregate from "src/pages/clients/components/SelectAggregate.vue";
import { onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
import SelectCustomer from "./SelectCustomer.vue";
import SelectIntern from "./SelectIntern.vue";
const { fetchOne } = useCreateUpdate("signings");
const emits = defineEmits(["create", "getName"]);
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});
let form = reactive({
  customer: null,
  intern: null,
  startDate: null,
  endDate: null,
  members: [],
});

const onSubmit = async () => {
  const { customer, intern, ...rest } = form;
  console.log(form);
  emits("create", { customerId: customer.id, internId: intern.id, ...rest });
};

const route = useRoute();
const fetchData = async () => {
  const data = await fetchOne(route.params.id);
  emits("getName", { name: data.customer.name, id: data.id });
  Object.assign(form, data);
  form.members = data.members.map((item) => item.id);
};

onMounted(() => {
  if (route.params.id) {
    fetchData();
  }
});
</script>
<style>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
