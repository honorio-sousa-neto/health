import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";

export const useResultExamStore = defineStore("result", () => {
  let data = reactive([]);

  let form = reactive({
    results: [],
  });

  let currentExam = reactive({
    results: [],
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
  const onReset = () => {
    Object.assign(form, {
      stage: "DOCTOR_ONE",
      gender: "MALE",
      weight: "",
      age: "",
      height: "",
      breathingRate: "",
      heartbeatRate: "",
      pulse: "",
      bloodPressure: "",
      temperature: "",
    });
  };

  let loading = ref(false);

  const index = async () => {
    loading.value = true;
    const response = await useFetchApi().index("result-exams", {
      params: {
        perPage: pagination.meta.perPage,
        page: pagination.meta.page,
        search: pagination.meta.search,
        orderBy: pagination.meta.orderBy,
      },
    });

    Object.assign(pagination.meta, response.data.meta);
    data.length = 0;
    Object.assign(data, response.data.data);
    loading.value = false;
  };

  const create = async (payload) => {
    loading.value = true;
    const response = await useFetchApi().store("result-exams", payload);
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
    const response = await useFetchApi().destroy("result-exams", id);
    loading.value = false;
    if (response) index();
    return response;
  };
  const softDelete = async (id) => {
    loading.value = true;
    const response = await useFetchApi().softDelete(
      "result-exams/soft-delete",
      id
    );
    loading.value = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loading.value = true;
    const response = await useFetchApi().update("result-exams/" + id, form);
    loading.value = false;
    if (response.success) {
      await show(id);
      onReset();
      index();
    }
    showNotify(response.message, response.success);
    return response;
  };

  const show = async (id) => {
    loading.value = true;
    const response = await useFetchApi().show("result-exams", id);
    const result = response.data.data;
    Object.assign(form, response.data.data);
    form.serviceId = result?.service;
    Object.assign(currentExam, response.data.data);
    loading.value = false;
    return response;
  };

  return {
    index,
    create,
    destroy,
    update,
    show,
    data,
    pagination,
    loading,
    softDelete,
    form,
    currentExam,
    onReset,
  };
});
