<template>
  <div>
    <div class="text-bold q-ml-md row justify-between items-center">
      <div>Membros do agregado</div>
      <!-- <q-btn
        color="teal-8"
        icon="las la-save"
        label="Salvar alterações"
        @click="onSubmit"
        :loading
      /> -->
    </div>
    <q-select
      v-model="customer"
      type="text"
      label="Pesquisa"
      standout="bg-teal-8 text-white"
      use-input
      option-label="name"
      option-value="id"
      input-debounce="500"
      @filter="filterFunction"
      :options="options"
      @update:model-value="addToTable"
    >
    </q-select>
    <div class="q-my-md row q-col-gutter-md">
      <div class="col-3" v-for="(cust, index) in customers" :key="cust.id">
        <q-card square class="bg-grey-3">
          <q-card-section>
            <div class="row justify-between items-center">
              <div>
                <div>
                  {{ cust.name }}
                </div>
                <div>
                  {{ cust.phone }}
                </div>
              </div>
              <div>
                <q-btn
                  color="red-8"
                  flat
                  icon="close"
                  round
                  dense
                  @click="
                    () => {
                      customers.splice(index, 1);
                      members = members.filter((item) => item != cust.id);
                    }
                  "
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useCreateUpdate } from "src/composables/create-update";
const { fetchOne } = useCreateUpdate("signings");
import { useRoute } from "vue-router";
import { api } from "src/boot/axios";
const customer = ref(null);
const members = defineModel({ default: [] });

const emit = defineEmits(["saved"]);
const options = ref([]);
const route = useRoute();
const filterFunction = async (val, update, abort) => {
  try {
    if (!val) return;
    update(async () => {
      const { data } = await api.get("customers/filter/search", {
        params: { search: val },
      });
      val = null;
      options.value = data.data;
    });
  } catch (error) {}
};

const customers = ref([]);

const addToTable = (val) => {
  customers.value.push(val);
  members.value.push(val.id);
  customer.value = null;
};

onMounted(async () => {
  const data = await fetchOne(route.params.id);
  customers.value = data.members;
  members.value = customers.value.map((item) => item.id);
});
</script>
