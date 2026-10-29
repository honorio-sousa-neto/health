<template>
  <div>
    <div class="text-bold">Planos assinados</div>
    <ul v-if="options.length">
      <li v-for="option in options">
        <div
          class="text-uppercase text-bold custom-link"
          @click="
            $emit('fetch', {
              internId: option.id,
              customerId: option.customerId,
              endDate: option.endDate,
              startDate: option.startDate,
              order: 'chief',
            })
          "
        >
          {{ option.intern.name }}
        </div>
        <div v-if="option.members?.length">
          <div class="text-bold">Membros do agregado</div>
          <ol>
            <li
              class="custom-link"
              v-for="(member, index) in option.members"
              :key="index"
              @click="
                $emit('fetch', {
                  internId: option.id,
                  customerId: member.id,
                  endDate: option.endDate,
                  startDate: option.startDate,
                  order: index + 1,
                })
              "
            >
              {{ member.name }}
            </li>
          </ol>
        </div>
      </li>
    </ul>
    <div v-else class="q-ml-sm q-pa-xs">Nenhum plano assinado</div>
    <div class="text-bold">Protocolos</div>
    <ul v-if="protocol.name">
      <li
        @click="
          $emit('fetchOthers', {
            type: 'protocol',
            source: protocol.id,
          })
        "
        class="custom-link text-uppercase text-bold"
      >
        {{ protocol.name }}
      </li>
    </ul>
    <div v-else class="q-ml-sm q-pa-xs">Nenhum protocolo</div>
    <div class="text-bold">Seguros externo</div>
    <ul v-if="extern.length">
      <li
        v-for="option in extern"
        class="custom-link text-uppercase text-bold"
        @click="
          $emit('fetchOthers', {
            type: 'insurance',
            source: option.insurance.id,
          })
        "
      >
        {{ option.insurance.name }}
      </li>
    </ul>
    <div v-else class="q-ml-sm q-pa-xs">Nenhum seguro externo</div>
  </div>
</template>
<script setup>
import { useCreateUpdate } from "src/composables/create-update";
import { onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
defineEmits(["fetch", "fetchOthers"]);
const { fetchOne } = useCreateUpdate("customers/my-benefits");
const route = useRoute();
let options = reactive([]);
let extern = reactive([]);
let protocol = reactive({
  id: null,
  name: null,
  value: null,
});

const fetchData = async () => {
  const data = await fetchOne(route.params.id);
  options.splice(0, options.length, ...data.intern);
  extern.splice(0, extern.length, ...data.insurance);
  Object.assign(protocol, data.protocol);
};
onMounted(() => {
  fetchData();
});
</script>
<style scoped lang="scss">
.custom-link {
  color: $teal-8;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
