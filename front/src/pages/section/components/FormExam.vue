<template>
  <q-form @submit="onSubmit" @reset="onReset" class="">
    <div>
      <q-select
        v-model="store.form.sectionId"
        type="text"
        label="Secção"
        standout="bg-teal text-white"
        use-input
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
        @filter="filterFunctionSection"
        :options="optionsSections"
        :rules="[required]"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-select>
      <q-input
        standout="bg-teal text-white"
        v-model="store.form.name"
        type="text"
        label="Nome"
        :rules="[required]"
        lazy-rules
      />
      <q-select
        v-model="store.form.serviceId"
        type="text"
        label="Conectar exame ao serviço"
        standout="bg-teal text-white"
        use-input
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
      <div>
        <div class="row q-gutter-md q-mb-sm">
          <q-radio
            v-model="store.form.isHeader"
            :val="false"
            label="Resultado Simples"
          />
          <q-radio
            v-model="store.form.isHeader"
            :val="true"
            label="Resultado Composto"
          />
        </div>
      </div>
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
import { api } from "src/boot/axios";
const store = useExamsStore();
const options = ref([]);
const route = useRoute();
const storeService = useServiceStore();

const filterFunction = async (val, update, abort) => {
  try {
    if (!val) return;
    update(async () => {
      const { data } = await api.get("services", { params: { search: val } });
      val = null;
      options.value = data.data;
    });
  } catch (error) {}
};

const optionsSections = ref([]);
const filterFunctionSection = async (val, update, abort) => {
  try {
    if (!val) return;
    update(async () => {
      const { data } = await api.get("sections", { params: { search: val } });
      val = null;
      optionsSections.value = data.data;
    });
  } catch (error) {}
};

const sectionStore = useSectionStore();
const onSubmit = async () => {
  try {
    const payload = {
      serviceId: store.form.serviceId.id,
      sectionId: store.form.sectionId.id,
    };
    const { serviceId, sectionId, service, section, ...rest } = store.form;
    const { success } = route.params.id
      ? await store.update(
          {
            serviceId: payload.serviceId,
            sectionId: payload.sectionId,
            ...rest,
          },
          route.params.id
        )
      : await store.create({
          serviceId: payload.serviceId,
          sectionId: payload.sectionId,
          ...rest,
        });
  } catch (error) {
    console.log(error.message);
  }
};

const onReset = () => {
  store.onReset();
};
</script>
