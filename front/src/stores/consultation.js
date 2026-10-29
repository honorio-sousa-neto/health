import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";
import { useRoute } from "vue-router";

export const useConsultationStore = defineStore("consultation", () => {
  const loading = ref(false);
  let data = reactive([]);

  let form = reactive({
    name: null,
    description: null,
    serviceId: null,
    area: null,
  });
  let currentData = reactive({
    name: null,
    description: null,
    serviceId: null,
    area: null,
  });
  const onReset = () => {
    Object.assign(form, {
      name: null,
      description: null,
      serviceId: null,
      area: null,
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
    const response = await useFetchApi().index("consultations", {
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
    const response = await useFetchApi().show("consultations", id);
    const result = response.data.data;
    Object.assign(form, response.data.data);
    form.serviceId = result.service;
    Object.assign(currentData, response.data.data);
    loading.value = false;
    return response;
  };
  const create = async (payload) => {
    loading.value = true;
    const response = await useFetchApi().store("consultations", payload);
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
    const response = await useFetchApi().destroy("consultations", id);
    loading.value = false;
    if (response) await index();
    return response;
  };
  const softDelete = async (id) => {
    loading.value = true;
    const response = await useFetchApi().softDelete(
      "customers/soft-delete",
      id
    );
    loading.value = false;
    if (response) await index();
    return response;
  };

  const update = async (form, id) => {
    loading.value = true;
    let { serviceId, ...rest } = form;
    if (typeof serviceId == "object") {
      serviceId = serviceId.id;
    }
    const response = await useFetchApi().update("consultations/" + id, {
      serviceId,
      ...rest,
    });
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
});
