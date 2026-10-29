import { defineStore } from "pinia";
import { reactive } from "vue";
import { useFetchApi } from "src/composables/api";
export const useFinanceStore = defineStore("finance", () => {
  let data = reactive({
    receipt: {
      received: null,
      toReceive: null,
    },
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
    category: "FT",
  });
  let loadings = reactive({
    loadingAll: false,
    loadingOne: false,
    loadingDelete: false,
    loadingCreate: false,
  });

  const index = async () => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("finances/receipt");
    data.receipt = response.data.data;
    loadings.loadingAll = false;
  };

  const create = async (form) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().store("finances", form);
    loadings.loadingCreate = false;
    if (response) index();
    return response;
  };

  const destroy = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().destroy("finances", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };
  const softDelete = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().softDelete("finances/soft-delete", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().update("finances/" + id, form);
    loadings.loadingCreate = false;
    if (response) index();
    return response;
  };

  const show = async (id) => {
    loadings.loadingOne = true;
    const response = await useFetchApi().show("finances", id);
    loadings.loadingOne = false;
    return response;
  };
  const filter = async (search) => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("finances/filter/search", {
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
  };
});
