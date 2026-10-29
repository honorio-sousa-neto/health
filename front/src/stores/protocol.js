import { defineStore } from "pinia";
import { reactive } from "vue";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";
export const useProtocolStore = defineStore("protocol", () => {
  let data = reactive({
    data: [],
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
  let loadings = reactive({
    loadingAll: false,
    loadingOne: false,
    loadingDelete: false,
    loadingCreate: false,
  });

  const index = async () => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("protocols", {
      params: {
        perPage: pagination.meta.perPage,
        page: pagination.meta.page,
        search: pagination.meta.search,
        orderBy: pagination.meta.orderBy,
      },
    });

    data.data.splice(0, data.data.length, ...response.data);
    loadings.loadingAll = false;
  };
  let form = reactive({
    name: null,
    value: null,
  });
  let currentProtocol = reactive({
    name: null,
    value: null,
  });

  const onReset = () => {
    Object.assign(form, {
      name: null,
      value: null,
    });
  };
  const create = async (form) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().store("protocol-new", form);
    loadings.loadingCreate = false;
    if (response) index();
    return response;
  };

  const destroy = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().destroy("protocol-new", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };
  const softDelete = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().softDelete(
      "protocol-new/soft-delete",
      id
    );
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().update("protocol-new/" + id, form);
    loadings.loadingCreate = false;
    showNotify(response.message, response.success);
    if (response.success) {
      index();
      Object.assign(currentProtocol, response.data.data);
    }
    return response;
  };

  const show = async (id) => {
    loadings.loadingOne = true;
    const response = await useFetchApi().show("protocol-new", id);
    Object.assign(form, response.data.data);
    Object.assign(currentProtocol, response.data.data);
    loadings.loadingOne = false;
    return response;
  };
  const filter = async (search) => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("protocol-new/filter/search", {
      params: {
        search,
      },
    });
    loadings.loadingAll = false;
    return response.data.data;
  };
  return {
    index,
    create,
    destroy,
    update,
    show,
    data,
    pagination,
    loadings,
    softDelete,
    filter,
    form,
    currentProtocol,
    onReset,
  };
});
