import { defineStore } from "pinia";
import { reactive } from "vue";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";
import { useRoute } from "vue-router";

export const useDrugStore = defineStore("drug", () => {
  const route = useRoute();

  let state = reactive({
    data: [],
  });

  let form = reactive({
    name: "",
    tax: null,
  });

  const onReset = () => {
    Object.assign(form, {
      name: "",
      tax: null,
    });

    Object.assign(pagination.meta, {
      page: route.query.page || 1,
      perPage: route.query.perPage || 15,
      total: 15,
      totalPages: 1,
      search: route.query.search || "",
      orderBy: {
        createdAt: "desc",
      },
    });
  };

  let pagination = reactive({
    meta: {
      page: route.query.page || 1,
      perPage: route.query.perPage || 15,
      total: 15,
      totalPages: 1,
      search: route.query.search || "",
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

    const response = await useFetchApi().index("drugs", {
      params: {
        perPage: pagination.meta.perPage,
        page: route.query.search ? 1 : pagination.meta.page,
        search: pagination.meta.search,
        orderBy: pagination.meta.orderBy,
      },
    });

    Object.assign(pagination.meta, response.meta);
    state.data.splice(0, state.data.length, ...response.data);
    loadings.loadingAll = false;
  };

  const create = async (payload) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().store("drugs", payload);
    loadings.loadingCreate = false;
    if (response.success) {
      index();
      onReset();
    }
    showNotify(response.message, response.success);
    return response;
  };

  const destroy = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().destroy("drugs", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };
  const softDelete = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().softDelete("drugs/soft-delete", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().update("drugs/" + id, form);
    loadings.loadingCreate = false;
    if (response.success) {
      await show(id);
      onReset();
      index();
    }
    showNotify(response.message, response.success);
    return response;
  };

  const show = async (id) => {
    loadings.loadingOne = true;
    const response = await useFetchApi().show("drugs", id);
    Object.assign(form, response.data.data);
    loadings.loadingOne = false;
    return response;
  };

  return {
    index,
    create,
    destroy,
    update,
    softDelete,
    show,
    onReset,
    pagination,
    loadings,
    form,
    state,
  };
});
