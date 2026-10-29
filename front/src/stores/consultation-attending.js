import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";
import { SessionStorage } from "quasar";

export const useConsultationAttendingStore = defineStore(
  "consultationAttending",
  () => {
    const user = SessionStorage.getItem("alfavida_user");
    const loading = ref(false);
    let data = reactive([]);

    let form = reactive({
      historyClinic: {
        value: null,
      },
      reasonOfConsultation: null,
      byExamPhysics: null,
      byQuestioning: null,
      serviceType: null,
      userId: user.id,
      diagnosis: null,
      allergies: null,
      observation: null,
      prescription: null,
      requests: [],
    });
    let currentData = reactive({
      historyClinic: {
        value: null,
      },
      reasonOfConsultation: null,
      byExamPhysics: null,
      byQuestioning: null,
      serviceType: null,
      userId: user.id,
      diagnosis: null,
      allergies: null,
      observation: null,
      prescription: null,
      requests: [],
    });
    const onReset = () => {
      Object.assign(form, {
        historyClinic: {
          value: null,
        },
        reasonOfConsultation: null,
        byExamPhysics: null,
        byQuestioning: null,
        serviceType: null,
        userId: user.id,
        diagnosis: null,
        allergies: null,
        observation: null,
        prescription: null,
        requests: [],
      });
    };

    let pagination = reactive({
      meta: {
        page: 1,
        perPage: 15,
        total: 15,
        totalPages: 1,
        search: "",
        orderBy: {
          createdAt: "desc",
        },
      },
    });

    const index = async (payload) => {
      loading.value = true;
      const response = await useFetchApi().index("attending-consultations", {
        params: {
          perPage: pagination.meta.perPage,
          page: pagination.meta.page,
          search: pagination.meta.search,
          orderBy: pagination.meta.orderBy,
          stage: payload,
        },
      });

      Object.assign(pagination.meta, response.data.meta);
      data.length = 0;
      Object.assign(data, response.data.data);
      loading.value = false;
    };
    const show = async (id) => {
      loading.value = true;
      const response = await useFetchApi().show("attending-consultations", id);
      const result = response.data.data;
      Object.assign(form, response.data.data);
      form.serviceId = result.service;
      Object.assign(currentData, response.data.data);
      loading.value = false;
      return response;
    };
    const create = async (payload) => {
      loading.value = true;
      const response = await useFetchApi().store(
        "attending-consultations",
        payload
      );
      loading.value = false;
      if (response.success) {
        await index();
        onReset();
      }
      showNotify(response.message, response.success);
      return response;
    };

    const destroy = async (id) => {
      loading.value = true;
      const response = await useFetchApi().destroy(
        "attending-consultations",
        id
      );
      loading.value = false;
      if (response) await index();
      return response;
    };
    const softDelete = async (id) => {
      loading.value = true;
      const response = await useFetchApi().softDelete(
        "attending-consultations/soft-delete",
        id
      );
      loading.value = false;
      if (response) await index();
      return response;
    };

    const update = async (form, id) => {
      loading.value = true;
      const response = await useFetchApi().update(
        "attending-consultations/" + id,
        form
      );
      loading.value = false;
      if (response.success) {
        await index();
        onReset();
      }
      showNotify(response.message, response.success);
      return response;
    };

    return {
      index,
      create,
      destroy,
      update,
      data,
      pagination,
      softDelete,
      loading,
      form,
      show,
      onReset,
      currentData,
    };
  }
);
