import { defineStore } from "pinia";
import { useFetchApi } from "src/composables/api";
import { reactive } from "vue";

export const useGroupStore = defineStore("group", () => {
  let state = reactive({
    groups: [],
  });
  const loadings = reactive({
    loadingAll: false,
    loadingOne: false,
    loadingDelete: false,
    loadingCreate: false,
  });
  let form = reactive({
    name: "",
    parent_id: null,
  });
  let pagination = reactive({
    page: 1,
    perPage: 1,
    search: null,
    total: 10,
    totalPages: 1,
  });
  const onReset = () => {
    Object.assign(form, {
      name: "",
      parent_id: null,
    });
  };

  const index = async () => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("groups", {
      params: {
        page: pagination.page,
        perPage: pagination.perPage,
        search: pagination.search,
      },
    });
    state.groups.splice(0, state.groups.length, ...response.data);
    Object.assign(pagination, response.meta);
    loadings.loadingAll = false;
  };

  const store = async () => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().store("groups", form);
    state.groups.push(response.data);
    onReset();
    loadings.loadingCreate = false;
    return response.data;
  };

  const update = async (id, form) => {
    loadings.loadingUpdate = true;
    const response = await useFetchApi().update(`groups/${id}`, form);
    loadings.loadingUpdate = false;
    return response.data;
  };

  const destroy = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().destroy(`groups/${id}`);
    state.groups = state.groups.filter((group) => group.id !== id);
    loadings.loadingDelete = false;
    return response.data;
  };
  const show = async (id) => {
    loadings.loadingOne = true;
    const response = await useFetchApi().show(`groups/`, id);
    Object.assign(form, response.data);
    loadings.loadingOne = false;
    return response.data;
  };

  return {
    state,
    form,
    onReset,
    index,
    store,
    update,
    destroy,
    pagination,
    show,
    loadings,
  };
});
