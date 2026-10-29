<template>
  <q-form @submit="onSubmit" @reset="onReset" class="">
    <div>
      <q-input
        standout="bg-teal-8 text-white"
        v-model="store.form.name"
        type="text"
        label="Nome"
        :rules="[required]"
        lazy-rules
        dense
      />
      <q-select
        v-model="store.form.serviceId"
        type="text"
        label="Conectar exame ao serviço"
        standout="bg-teal-8 text-white"
        use-input
        dense
        class="col-md-12 col-xs-12"
        :option-label="
          (item) =>
            item === null
              ? ''
              : item.name +
                `${item.description ? ' [' + item.description + ']' : ''}`
        "
        option-value="id"
        input-debounce="500"
        @filter="filterFunction"
        :options="options"
        :rules="[required]"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-select>
      <q-checkbox
        left-label
        v-model="store.form.isHeader"
        label="É um cabeçalho?"
      />
      <q-slide-transition>
        <div v-if="!store.form.isHeader">
          <AddInput
            v-model:options="store.form.options"
            v-model:input="store.form.input"
            v-model:reference="store.form.reference"
          ></AddInput>
        </div>
      </q-slide-transition>
      <q-slide-transition>
        <div v-if="store.form.isHeader">
          <AddSubitem v-model:items="store.form.subItens"></AddSubitem>
        </div>
      </q-slide-transition>
    </div>
    <div class="row q-mt-md q-gutter-md">
      <q-btn
        rounded
        label="Submit"
        type="submit"
        color="primary"
        icon-right="las la-save"
      />
      <q-btn
        rounded
        label="Cancelar"
        outline
        type="reset"
        color="red-8"
        icon="las la-ban"
      />
    </div>
  </q-form>
</template>
<script setup>
import { useExamsStore } from "src/stores/exams";
import { useSectionStore } from "src/stores/section";
import { useServiceStore } from "src/stores/service";
import { required } from "src/utils/validation";
import AddSubitem from "./AddSubitem.vue";
import AddInput from "./AddInput.vue";
import { ref } from "vue";
import { useRoute } from "vue-router";
const store = useExamsStore();
const options = ref([]);
const route = useRoute();
const storeService = useServiceStore();
const filterFunction = async (val, update, abort) => {
  try {
    if (!val) return;
    update(async () => {
      const data = await storeService.filter("ENF", val);
      val = null;
      options.value = data;
    });
  } catch (error) {}
};

const sectionStore = useSectionStore();
const onSubmit = async () => {
  try {
    const payload = {
      serviceId: store.form.serviceId.id,
      sectionId: route.params.id,
    };
    const { serviceId, sectionId, ...rest } = store.form;
    const { success } = route.params.examId
      ? await store.update(
          {
            serviceId: payload.serviceId,
            sectionId: payload.sectionId,
            ...rest,
          },
          route.params.examId
        )
      : await store.create({
          serviceId: payload.serviceId,
          sectionId: payload.sectionId,
          ...rest,
        });

    if (success) {
      await sectionStore.show(route.params.id);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const onReset = () => {
  store.onReset();
};
</script>
