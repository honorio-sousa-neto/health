import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";
export const useHospitalizationStore = defineStore("imagiology", () => {
  let data = reactive([]);

  let form = reactive({
    name: null,
    description: null,
    serviceId: null,
    service: null
  });

  let currentExam = reactive({
    name: null,
    description: null,
    serviceId: null,
    service: null
  });

  let pagination = reactive({
      page: 1,
      perPage: 15,
      total: 15,
      totalPages: 1,
      search: "",
  });
  const onReset = () => {
    Object.assign(form, {
      name: null,
      description: null,
      serviceId: null,
    });

  };
  const onResetPagination = () => {
    Object.assign(pagination, {
      page: 1,
      perPage: 15,
      total: 15,
      totalPages: 1,
      search: "",
    });
  }

  let loading = ref(false)

  const index = async () => {
    loading.value = true;
    const response = await useFetchApi().index("hospitalizations", {
      params: {
        perPage: pagination.perPage,
        page: pagination.page,
        search: pagination.search,
        orderBy: pagination.orderBy,
      },
    });
    Object.assign(pagination, response.meta);
    Object.assign(data, response.data);
    loading.value = false;
    return response.data
  };

  const create = async (payload) => {
    loading.value = true;
    const { success, message, data } = await useFetchApi().store("hospitalizations", payload);
    loading.value = false;
    if (success) {
      onReset();
    }
    showNotify(message, success);
    return { success, message, data };
  };

  const destroy = async (id) => {
    loading.value = true;
    const { success, ...rest } = await useFetchApi().destroy("hospitalizations", id);
    loading.value = false;
    if (success) index();
    return { success, ...rest };
  };
  const softDelete = async (id) => {
    loading.value = true;
    const response = await useFetchApi().softDelete("hospitalizations/soft-delete", id);
    loading.value = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loading.value = true;
    const { success, message, ...rest } = await useFetchApi().update("hospitalizations/" + id, form);
    loading.value = false;
    if (success) {
      await show(id);
    }
    showNotify(message, success);
    return { success, ...rest };
  };

  const show = async (id) => {
    loading.value = true;
    const response = await useFetchApi().show("hospitalizations", id);
    Object.assign(form, response.data);
    Object.assign(currentExam, response.data);
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
