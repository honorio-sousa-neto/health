import { defineStore } from "pinia";
import { reactive } from "vue";
import { useFetchApi } from "src/composables/api";
export const useMaterialStore = defineStore("material", () => {
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
    const response = await useFetchApi().index("materials", {
      params: {
        perPage: pagination.meta.perPage,
        page: pagination.meta.page,
        search: pagination.meta.search,
      },
    });

    Object.assign(pagination.meta, response.data.meta);
    data.data.length = 0;
    Object.assign(data.data, response.data.data);
    loadings.loadingAll = false;
  };

  const create = async (form) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().store("materials", form);
    loadings.loadingCreate = false;
    if (response) index();
    return response;
  };

  const destroy = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().destroy("materials", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().update("materials/" + id, form);
    loadings.loadingCreate = false;
    if (response) index();
    return response;
  };

  const show = async (id) => {
    loadings.loadingOne = true;
    const response = await useFetchApi().show("materials", id);
    loadings.loadingOne = false;
    return response;
  };

  const filter = async (search) => {
    const response = await useFetchApi().index("materials", {
      params: { search, perPage: 50, page: 1 },
    });
    return response.data.data;
  };

  const onReset = () => {
    Object.assign(pagination.meta, {
      page: 1,
      perPage: 15,
      total: 15,
      totalPages: 1,
      search: "",
    });
  };
  return {
    index,
    create,
    destroy,
    update,
    show,
    filter,
    data,
    pagination,
    loadings,
    onReset,
  };
});
