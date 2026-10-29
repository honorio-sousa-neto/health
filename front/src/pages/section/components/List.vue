<template>
  <q-table
    :title="`Exames de ${store.currentSection.name}`"
    flat
    :rows="store.currentSection.exams"
    :columns="columns"
    row-key="name"
    hide-bottom
  >
    <template #top-right>
      <q-btn
        color="teal-8"
        no-caps
        icon-right="add"
        label="Adicionar exame"
        @click="dialog = !dialog"
        rounded
      />
    </template>
    <template v-slot:body-cell-actions="props">
      <q-td :props="props">
        <q-btn
          flat
          round
          dense
          color="green-10"
          icon="las la-eye"
          @click="
            $router.push({
              name: 'edit-exam',
              params: { examId: props.row.id, id: $route.params.id },
            })
          "
        />
      </q-td>
    </template>
  </q-table>
  <q-dialog v-model="dialog">
    <q-card style="width: 1020px; max-width: 80vw">
      <q-card-section>
        <div class="row justify-end">
          <q-btn color="grey" icon="close" dense flat round v-close-popup />
        </div>
        <div>
          <FormExam></FormExam>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import FormExam from "./FormExam.vue";
import { useSectionStore } from "src/stores/section";
import { ref } from "vue";
import { columns } from "src/utils/columns/section";
import editDestroy from "src/components/global/edit-destroy.vue";
const store = useSectionStore();

const dialog = ref(false);
</script>
