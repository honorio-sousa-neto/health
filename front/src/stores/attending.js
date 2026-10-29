import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";
import { useRoute } from "vue-router";
import { SessionStorage } from "quasar";

export const useAttendingStore = defineStore("attending", () => {
  const user = SessionStorage.getItem("alfavida_user");
  const loading = ref(false);
  let data = reactive([]);
  let results = reactive([]);
  const route = useRoute();

  let form = reactive({
    customerId: null,
    consultationId: null,
    requestExams: [],
  });

  const onReset = () => {
    Object.assign(form, {
      customerId: null,
      consultationId: null,
      requestExams: [],
    });
  };
  let currentAttending = reactive({
    customer: {},
    exams: [],
    consultationName: {},
    consultation: {},
    requests: [],
    screening: {},
  });
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
  const index = async (stage) => {
    loading.value = true;
    if (typeof stage !== "string") {
      stage = undefined;
    }
    const response = await useFetchApi().index("attending-new", {
      params: {
        perPage: pagination.meta.perPage,
        page: pagination.meta.page,
        search: pagination.meta.search,
        orderBy: pagination.meta.orderBy,
        stage: stage
          ? stage
          : route.name == "lista-triagem"
          ? "SCREENING"
          : route.name == "medico-lista-atendimento"
          ? "CONSULTING_CLINIC"
          : route.name == "pedidos-exame"
          ? "EXAM"
          : route.name == "medico-lista-resultado-exames"
          ? "EXAM_RESULT"
          : route.name == "lista-exames"
          ? "ATTENDANCE"
          : "EXAM",
      },
    });

    data.length = 0;
    Object.assign(data, response.data.data);
    Object.assign(pagination.meta, response.data.meta);
    loading.value = false;
  };

  const create = async (payload) => {
    loading.value = true;
    const response = await useFetchApi().store("attending-new", payload);
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
    const response = await useFetchApi().destroy("attending-new", id);
    loading.value = false;
    if (response) await index();
    return response;
  };
  const softDelete = async (id) => {
    loading.value = true;
    const response = await useFetchApi().softDelete(
      "attending-new/soft-delete",
      id
    );
    loading.value = false;
    if (response) await index();
    return response;
  };

  const update = async (form, id) => {
    loading.value = true;
    const response = await useFetchApi().update("attending-new/" + id, form);
    loading.value = false;
    if (response.success) {
      await index();
      onReset();
    }
    showNotify(response.message, response.success);
    return response;
  };
  const show = async (id) => {
    loading.value = true;
    const response = await useFetchApi().show("attending-new", id);
    loading.value = false;
    Object.assign(currentAttending, response.data.data);
    return response;
  };

  const updateMany = async (requests, id) => {

    loading.value = true;
    const response = await useFetchApi().update("attending-new/exams/mark-as-paid/" + id, { requests });
    loading.value = false;
    return response;
  }

  return {
    updateMany,
    index,
    show,
    create,
    destroy,
    update,
    data,
    pagination,
    softDelete,
    loading,
    form,
    onReset,
    currentAttending,
    results,
  };
});
