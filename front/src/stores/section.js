import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";

export const useSectionStore = defineStore("sectionss", () => {
  let data = reactive([]);
  let exams = reactive([]);
  let form = reactive({
    name: null,
  });

  let currentSection = reactive({
    name: null,
    id: null,
    updatedAt: null,
    exams: [],
    _count: null,
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
      name: null,
    });

    Object.assign(pagination.meta, {
      page: 1,
      perPage: 15,
      total: 15,
      totalPages: 1,
      search: "",
      orderBy: {
        createdAt: "desc",
      },
    });
  };

  let loading = ref(false);

  const index = async () => {
    loading.value = true;
    const response = await useFetchApi().index("sections", {
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
    const response = await useFetchApi().store("sections", payload);
    loading.value = false;
    if (response.success) {
      index();
      onReset();
    }
    showNotify(response.message, response.success);
    return response;
  };

  const destroy = async (id) => {
    loading.value = true;
    const response = await useFetchApi().destroy("sections", id);
    loading.value = false;
    if (response) index();
    return response;
  };
  const softDelete = async (id) => {
    loading.value = true;
    const response = await useFetchApi().softDelete("sections/soft-delete", id);
    loading.value = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loading.value = true;
    const response = await useFetchApi().update("sections/" + id, form);
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
    const response = await useFetchApi().show("sections", id);

    Object.assign(form, response.data.data);
    Object.assign(currentSection, response.data.data);
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
    exams,
    pagination,
    loading,
    softDelete,
    form,
    onReset,
    currentSection,
  };
});
