import { defineStore } from "pinia";
import { reactive } from "vue";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";
export const useSupplierStore = defineStore("supplier", () => {
  let data = reactive({
    data: [],
  });

  let form = reactive({
    name: "",
    nif: "",
    address: "",
    phone: "",
    email: "",
  });

  const onReset = () => {
    Object.assign(form, {
      name: null,
      nif: null,
      address: null,
      phone: null,
      email: null,
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
  let loadings = reactive({
    loadingAll: false,
    loadingOne: false,
    loadingDelete: false,
    loadingCreate: false,
  });

  const index = async () => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("suppliers", {
      params: {
        perPage: pagination.meta.perPage,
        page: pagination.meta.page,
        search: pagination.meta.search,
        orderBy: pagination.meta.orderBy,
      },
    });

    Object.assign(data.data, response.data.data);
    Object.assign(pagination.meta, response.data.meta);
    loadings.loadingAll = false;
  };

  const create = async (payload) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().store("suppliers", payload);
    loadings.loadingCreate = false;
    showNotify(response.message, response.success);
    if (response.success) {
      index();
      onReset();
    }
    return response;
  };

  const destroy = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().destroy("suppliers", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };
  const softDelete = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().softDelete(
      "suppliers/soft-delete",
      id
    );
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().update("suppliers/" + id, form);
    loadings.loadingCreate = false;
    showNotify(response.message, response.success);

    if (response.success) {
      index();
      onReset();
    }
    return response;
  };

  const show = async (id) => {
    loadings.loadingOne = true;
    const response = await useFetchApi().show("suppliers", id);
    Object.assign(form, response.data.data);
    loadings.loadingOne = false;
    return response;
  };
  const filter = async (search) => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("suppliers/filter/search", {
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
    onReset,
  };
});
