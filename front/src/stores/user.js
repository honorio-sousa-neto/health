import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useFetchApi } from "src/composables/api";
export const useUserStore = defineStore("user", () => {
  let data = reactive([]);
  let pagination = reactive({
    meta: {
      page: 1,
      perPage: 10,
      total: 10,
      totalPages: 1,
      search: "",
      orderBy: {
        createdAt: "desc",
      },
    },
  });

  let form = reactive({
    name: "",
    username: "",
    role: null,
    email: "",
    phone: "",
    password: "",
  });
  const onResetForm = () => {
    Object.assign(form, {
      name: "",
      username: "",
      role: null,
      email: "",
      phone: "",
      password: "",
    });
  };
  const onReset = () => {
    Object.assign(pagination.meta, {
      page: 1,
      perPage: 10,
      total: 10,
      totalPages: 1,
      search: "",
    });
  };
  let loading = ref(false);

  const index = async () => {
    loading.value = true;
    const response = await useFetchApi().index("user-new", {
      params: {
        perPage: pagination.meta.perPage,
        page: pagination.meta.page,
        search: pagination.meta.search,
        orderBy: pagination.meta.orderBy,
      },
    });

    Object.assign(data, response.data.data);
    Object.assign(pagination.meta, response.data.meta);
    loading.value = false;
  };

  const create = async (form) => {
    loading.value = true;
    const response = await useFetchApi().store("user-new", form);
    loading.value = false;
    if (response) {
      onResetForm();
      index();
    }
    return response;
  };

  const destroy = async (id) => {
    loading.value = true;
    const response = await useFetchApi().destroy("user-new", id);
    loading.value = false;
    if (response) index();
    return response;
  };
  const softDelete = async (id) => {
    loading.value = true;
    const response = await useFetchApi().softDelete("user-new/soft-delete", id);
    loading.value = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loading.value = true;
    const response = await useFetchApi().update("user-new/" + id, form);
    loading.value = false;
    if (response) index();
    return response;
  };

  const show = async (id) => {
    loading.value = true;
    const response = await useFetchApi().show("user-new", id);
    Object.assign(form, response.data.data);
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
    softDelete,
    onReset,
    onResetForm,
    form,
  };
});
